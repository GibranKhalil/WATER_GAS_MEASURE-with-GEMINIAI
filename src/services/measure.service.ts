import { MeasureType } from '../@types/measure.types';
import { AppDataSource } from '../dataSource';
import { CreateMeasureDTO } from '../dto/createMeasure.dto';
import { UpdateMeasureDTO } from '../dto/updateMeasure.dto';
import { MeasureEntity } from '../entities/measure.entity';
import { Repository } from 'typeorm';

/**
 * Classe que se comunica com o banco de dados através do typeORM
 */
export class MeasureService {
  constructor(
    private readonly measureRepository: Repository<MeasureEntity> = AppDataSource.getRepository(
      MeasureEntity,
    ),
  ) {}

  /**
   * Resgata todas as medidas vinculadas ao usuário baseando-se no código de cliente
   * @param customer_code código do cliente
   * @returns
   */
  async getAllCustomerMeasures(customer_code: string) {
    try {
      const response = await this.measureRepository.find({
        where: { customer_code },
      });
      return response;
    } catch (error) {
      throw new Error(`Erro ao obter as leituras do cliente: ${error}`);
    }
  }

  /**
   * Resgata todas as medições vinculadas ao usuário filtrando pelo tipo de medição
   * @param customer_code código do cliente
   * @param measure_type tipo de medida
   * @returns
   */
  async getAllCustomerMeasuresByType(
    customer_code: string,
    measure_type: MeasureType,
  ) {
    try {
      const response = await this.measureRepository.find({
        where: { customer_code, measure_type },
      });
      return response;
    } catch (error) {
      throw new Error(
        `Erro ao obter as leituras do cliente por tipo: ${error}`,
      );
    }
  }

  /**
   * Cria uma nova medida dentro do banco de dados
   * @param measureData
   * @returns
   */
  async createMeasure(measureData: CreateMeasureDTO) {
    try {
      return await this.measureRepository.save(measureData);
    } catch (error) {
      throw new Error(`Erro ao criar uma nova leitura: ${error}`);
    }
  }

  /**
   * Atualiza uma medição
   * @param measureData
   * @param measure_uuid id do objeto alvo da atualização
   * @returns
   */
  async updateMeasure(measureData: UpdateMeasureDTO, measure_uuid: string) {
    try {
      return this.measureRepository.update(measure_uuid, measureData);
    } catch (error) {
      throw new Error(`Erro ao atualizar a leitura: ${error}`);
    }
  }

  /**
   * Verificar se uma medida do mesmo tipo já foi realizada nesse mês
   * @param measureType Tipo de medida
   * @param customer_code Código do cliente
   * @param targetDate
   * @returns
   */
  async checkMeasureTypeInMonth(
    measureType: MeasureType,
    customer_code: string,
    targetDate: Date,
  ): Promise<boolean> {
    try {
      const month = targetDate.getMonth() + 1;
      const year = targetDate.getFullYear();

      const measure = await this.measureRepository
        .createQueryBuilder('measure')
        .where('measure.measure_type = :measureType', { measureType })
        .andWhere('measure.customer_code = :customer_code', { customer_code })
        .andWhere('EXTRACT(MONTH FROM measure.measure_datetime) = :month', {
          month,
        })
        .andWhere('EXTRACT(YEAR FROM measure.measure_datetime) = :year', {
          year,
        })
        .getOne();

      return !!measure;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verificar se uma medida existe baseando-se no id
   * @param measure_uuid id da medição
   * @returns
   */
  async checkMeasureExistsByID(measure_uuid: string): Promise<boolean> {
    try {
      const checkCode = await this.measureRepository.findOne({
        where: { id: measure_uuid },
      });
      return !!checkCode;
    } catch (error) {
      throw new Error(`${error.message}`);
    }
  }

  /**
   * Verificar se o valor de uma medida já foi confirmado
   * @param measure_uuid
   * @returns
   */
  async checkMeasureHadConfirmed(measure_uuid: string): Promise<boolean> {
    try {
      const checkConfirmed = await this.measureRepository.findOne({
        where: { id: measure_uuid, has_confirmed: true },
      });
      return !!checkConfirmed;
    } catch (error) {
      throw new Error(
        `Erro ao verificar se a leitura já foi confirmada: ${error}`,
      );
    }
  }
}
