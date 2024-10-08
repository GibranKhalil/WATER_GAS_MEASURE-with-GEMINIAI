import type { Request, Response } from 'express';
import { dataValidation } from '../utils/validations.utils';
import {
  MeasureType,
  type ErrorResponse,
  type SuccessResponse,
} from '../@types/measure.types';
import { geminiService } from '../externalServices/gemini.service';
import { extractData } from '../utils/extractData.utils';
import path from 'path';
import fs from 'fs';
import { MeasureService } from '../services/measure.service';
import { CreateMeasureDTO } from '../dto/createMeasure.dto';
import { validate } from 'class-validator';

/**
 * Controller para operações relacionadas às medições de consumo de GAS/WATER
 */
export class MeasureController {
  /**
   * Construtor da Classe que instancia o serviço da entidade
   * @param service Classe responsável por comunicar-se com o banco de dados
   */
  constructor(private readonly service: MeasureService = new MeasureService()) {
    geminiService.setPrompt(
      'Me devolva apenas o valor inteiro que está no visor do medidor, ignore os 0',
    );
  }

  /**
   * Função responsável por criar o nome de um arquivo único
   * @param mimeType Tipo do arquivo
   * @returns Retornar um nome para o arquivo
   */
  buildFilename(mimeType: string) {
    const fileExtension: string = mimeType.split('/')[1];
    return `${crypto.randomUUID()}.${fileExtension}`;
  }

  /**
   * Constroi o caminho do arquivo até o diretório temp, responsável por armazenar dados temporários
   * @param mimeType Tipo do arquivo
   * @returns retorna uma string com o caminho do arquivo
   */
  buildTempFilePath(mimeType: string) {
    const filename = this.buildFilename(mimeType);
    return path.join('src', 'temp', filename);
  }

  /**
   * Função responsável por escrever um arquivo no diretório temp
   * @param imageData Dados do arquivo criptografado em base64
   * @param mimeType Tipo do arquivo enviado
   * @returns retorna o caminho de busca do arquivo
   */
  saveTempImage(imageData: string, mimeType: string) {
    const filePath = this.buildTempFilePath(mimeType);
    fs.writeFileSync(filePath, imageData, { encoding: 'base64' });
    return filePath;
  }

  /**
   * Constrói uma url para acessar o arquivo enviado
   * @param protocol Protocolo de acesso a página
   * @param host Domain Name (DN) da página
   * @param filePath caminho do arquivo
   * @returns retorna uma url para disponibilizar ao usuário
   */
  buildTempImageURL(protocol: string, host: string, filePath: string) {
    return `${protocol}://${host}/temp-image/${path.basename(filePath)}`;
  }

  /**
   * Função responsável por criar respostas para exibir erros ao usuário
   * @param error_code Tipo de erro
   * @param error_description Descricao do erro
   * @returns retorna um objeto do tipo ErrorResponse
   */
  buildErrorResponse(
    error_code:
      | 'INVALID_DATA'
      | 'DOUBLE_REPORT'
      | 'MEASURE_NOT_FOUND'
      | 'CONFIRMATION_DUPLICATE'
      | 'INVALID_TYPE'
      | 'SERVER_ERROR'
      | 'MEASURES_NOT_FOUND',
    error_description: string,
  ): ErrorResponse {
    return {
      error_code,
      error_description,
    };
  }

  /**
   * Função que verifica se um tipo de medida é válido
   * @param measure_type tipo de medida
   * @returns um booleano que mostra se é um tipo válido ou não
   */
  checkMeasureTypeIsValid(measure_type: string): boolean {
    return measure_type.toUpperCase() in MeasureType;
  }

  /**
   * Função responsável por se comunicar com o GEMINI, a IA do google e obter o número no visor do medidor
   * @param base64Data Imagem encriptografada em base64
   * @param mimeType Tipo da Imagem
   * @returns um número representando a medida
   */
  async getMeasureValueWithGemini(
    base64Data: string,
    mimeType: string,
  ): Promise<number> {
    const text = await geminiService.fileToText(base64Data, mimeType);
    return Number(text);
  }

  /**
   * Função responsável por validar o corpo da requisição utilizando a biblioteca class-validator e class-transformer
   * @param image
   * @param customer_code
   * @param measure_datetime
   * @param measure_type
   * @returns
   */
  async validatePostRequest(
    image: string,
    customer_code: string,
    measure_datetime: string,
    measure_type: any,
  ) {
    const createMeasureDTO = new CreateMeasureDTO();
    createMeasureDTO.image = image;
    createMeasureDTO.customer_code = customer_code;
    createMeasureDTO.measure_datetime = new Date(measure_datetime);
    createMeasureDTO.measure_type = measure_type;
    createMeasureDTO.value = 9999;

    const errors = await validate(createMeasureDTO, { always: true });

    return errors.length > 0;
  }

  /**
   * Rota para resgatar um arquivo armazenado
   * @param req
   * @param res
   * @returns retorna uma imagem para o usuário
   */
  async getTempImage(req: Request, res: Response) {
    const filename = req.params.filename;
    const filePath = path.resolve('src', 'temp', filename);

    res.sendFile(filePath, (err) => {
      if (err) {
        res
          .status(404)
          .json({ success: false, message: 'Imagem não encontrada' });
      }
    });
  }

  /**
   * Rota para enviar uma nova medição
   * @param req
   * @param res
   * @returns
   */
  async postMeasure(req: Request, res: Response) {
    const { image, measure_type, customer_code, measure_datetime } = req.body;

    try {
      const dataIsValid = await this.validatePostRequest(
        image,
        customer_code,
        measure_datetime,
        measure_type,
      );

      if (dataIsValid) {
        return res
          .status(400)
          .json(
            this.buildErrorResponse(
              'INVALID_DATA',
              'Certifique-se de incluir imagem, tipo de medida, código do cliente e data da medida nos formatos corretos',
            ),
          );
      }

      if (!dataValidation.isBase64Image(image)) {
        return res
          .status(400)
          .json(
            this.buildErrorResponse(
              'INVALID_DATA',
              'A imagem fornecida não está em um formato válido',
            ),
          );
      }

      const base64Data = extractData.extractBase64Data(image);
      const mimeType = extractData.extractMimeType(image) as string;

      const doubleMeasure = await this.service.checkMeasureTypeInMonth(
        measure_type,
        customer_code,
        new Date(measure_datetime),
      );

      if (doubleMeasure) {
        return res
          .status(409)
          .json(
            this.buildErrorResponse(
              'DOUBLE_REPORT',
              'Leitura do mês já realizada',
            ),
          );
      }

      const measure_value = await this.getMeasureValueWithGemini(
        base64Data,
        mimeType,
      );

      if (!measure_value) {
        return res
          .status(500)
          .json(
            this.buildErrorResponse(
              'INVALID_DATA',
              'Não foi possível ler o número na imagem, tente novamente',
            ),
          );
      }

      const filePath = this.saveTempImage(base64Data, mimeType);
      const tempUrl = this.buildTempImageURL(
        req.protocol,
        req.get('host') as string,
        filePath,
      );

      const create = await this.service.createMeasure({
        customer_code: customer_code,
        image: tempUrl,
        measure_datetime: new Date(measure_datetime),
        measure_type: measure_type,
        value: measure_value,
      });

      const response: SuccessResponse = {
        image_url: create.image,
        measure_uuid: create.id,
        measure_value: create.value,
      };

      return res.status(200).json(response);
    } catch (error) {
      return res
        .status(500)
        .json(
          this.buildErrorResponse(
            'SERVER_ERROR',
            `Erro ao enviar medida: ${error.message}`,
          ),
        );
    }
  }

  /**
   * Rota responsável por confirmar os valores antes enviados
   * @param req
   * @param res
   * @returns resultado de sucesso ou não
   */
  async patchConfirmMeasure(req: Request, res: Response) {
    const { measure_uuid, confirmed_value } = req.body;

    if (!measure_uuid || !confirmed_value || !parseInt(confirmed_value)) {
      return res
        .status(400)
        .json(
          this.buildErrorResponse(
            'INVALID_DATA',
            'Os dados fornecidos no corpo da requisição são inválidos',
          ),
        );
    }

    try {
      const validMeasure = await this.service.checkMeasureExistsByID(
        measure_uuid,
      );
      if (!validMeasure) {
        return res
          .status(404)
          .json(
            this.buildErrorResponse(
              'MEASURE_NOT_FOUND',
              'Leitura não encontrada',
            ),
          );
      }

      const alreadyConfirmed = await this.service.checkMeasureHadConfirmed(
        measure_uuid,
      );
      if (alreadyConfirmed) {
        return res
          .status(409)
          .json(
            this.buildErrorResponse(
              'CONFIRMATION_DUPLICATE',
              'Leitura do mês já realizada',
            ),
          );
      }

      await this.service.updateMeasure(
        { value: Number(confirmed_value), has_confirmed: true },
        measure_uuid,
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      return res
        .status(500)
        .json(
          this.buildErrorResponse(
            'SERVER_ERROR',
            `Erro ao confirmar o valor da leitura: ${error.message}`,
          ),
        );
    }
  }

  /**
   * Rota responsável por devolver ao usuário suas medidas baseando-se no seu customer_code
   * @param req
   * @param res
   * @returns
   */
  async getCustomerMeasuresList(req: Request, res: Response) {
    const { customer_code } = req.params;
    const measure_type = req.query.measure_type as string;

    if (measure_type && !this.checkMeasureTypeIsValid(measure_type)) {
      const response = this.buildErrorResponse(
        'INVALID_TYPE',
        'Tipo de medição não permitida',
      );
      return res.status(400).json(response);
    }

    try {
      const measures = measure_type
        ? await this.service.getAllCustomerMeasuresByType(
            customer_code,
            measure_type.toUpperCase() as MeasureType,
          )
        : await this.service.getAllCustomerMeasures(customer_code);

      if (measures.length <= 0) {
        return res
          .status(404)
          .json(
            this.buildErrorResponse(
              'MEASURES_NOT_FOUND',
              'Nenhuma leitura Encontrada',
            ),
          );
      }

      return res.status(200).json({ customer_code, measures });
    } catch (error) {
      return res.status(500).json({
        error_code: 'SERVER_ERROR',
        error_description: `Erro ao obter as medições do cliente: ${customer_code}`,
      });
    }
  }
}
