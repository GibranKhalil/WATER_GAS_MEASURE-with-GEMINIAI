import type { Request, Response } from "express";
import { dataValidation } from "../utils/validations.utils";
import type { ErrorResponse, SuccessResponse } from "../@types/measure.types";
import { geminiService } from "../service/gemini.service";
import { extractData } from "../utils/extractData.utils";
import path from "path";
import fs from 'fs';

class MeasureController{

    buildFilename(mimeType: string){
        const fileExtension: string = mimeType.split('/')[1]
        return `${crypto.randomUUID()}.${fileExtension}`
    }

    buildTempFilePath(mimeType: string){
        const filename = this.buildFilename(mimeType)
        return path.join('src', 'temp', filename)
    }

    saveTempImage(imageData: string, mimeType: string){
        const filePath = this.buildTempFilePath(mimeType)
        fs.writeFileSync(filePath, imageData, { encoding: 'base64'})
        return filePath
    }

    buildTempImageURL(protocol: string, host: string, filePath: string){
        return `${protocol}://${host}/image/temp-image/${path.basename(filePath)}`;
    }

    async getTempImage(req: Request, res: Response){
        const filename = req.params.filename;
        const filePath = path.resolve('src', 'temp', filename)

        res.sendFile(filePath, err => {
            if(err){
                res.status(404).json({success: false, message: 'Imagem não encontrada'})
            }
        })
    }

    //Falta verificar no banco se existe
    //Falta mudar o nome da função
    async post(req: Request, res: Response){
        const {image, measure_type, customer_code, measure_datetime} = req.body

        if(!image || !measure_type || !customer_code || !measure_datetime){

            const response: ErrorResponse = {
                error_code: 'INVALID_DATA',
                error_description: 'Certifique-se de incluir imagem, tipo de medida, código do cliente e data da medida'
            }

            return res.status(400).json(response);
        }

        if(!dataValidation.isBase64Image(image)){

            const response: ErrorResponse = {
                error_code: 'INVALID_DATA',
                error_description: 'A imagem fornecida não está em um formato válido'
            }

            return res.status(400).json(response);
        }

        geminiService.setPrompt("Me devolva apenas o valor que está no visor do medidor")

        const base64Data = extractData.extractBase64Data(image)
        const mimeType = extractData.extractMimeType(image) as string

        const text = await geminiService.fileToText(base64Data, mimeType)

        const measure_value = Number(text)

        if(!measure_value){
            const response: ErrorResponse = {
                error_code: "INVALID_DATA",
                error_description: "Não foi possível ler a imagem, tente novamente"
            };
            return res.status(500).json(response);
        }

        const filePath = this.saveTempImage(base64Data, mimeType);
        const tempUrl = this.buildTempImageURL(req.protocol, req.get('host') as string, filePath)

        const response: SuccessResponse = {
            image_url: tempUrl,
            measure_uuid: crypto.randomUUID(),
            measure_value: measure_value
        };

        return res.status(200).json(response);
    }

    async patch(req: Request, res: Response){
        
    }
}

const measureController = new MeasureController()

export {measureController}