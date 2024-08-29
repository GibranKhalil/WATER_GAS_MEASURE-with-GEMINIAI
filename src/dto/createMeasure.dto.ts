import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { MeasureType } from '../@types/measure.types';

export class CreateMeasureDTO {
  @IsNotEmpty({ message: 'O campo de imagem não pode estar vazio' })
  image: string;

  @IsNotEmpty({
    message:
      'É necessário vincular o código do cliente responsável pela medida',
  })
  customer_code: string;

  @IsNotEmpty({ message: 'A data de medição não pode estar vazia' })
  @IsDate({ message: 'A data deve estar em um formato válido' })
  measure_datetime: Date;

  @IsNotEmpty({ message: 'Deve ser informado o tipo de medição' })
  @IsEnum(MeasureType, { message: 'O tipo de medição deve ser WATER ou GAS' })
  measure_type: MeasureType;

  @IsNotEmpty({ message: 'O valor da medição não pode estar vazio' })
  @IsNumber({}, { message: 'O valor da medição deve ser um número' })
  value: number;

  @IsOptional()
  has_confirmed?: boolean;
}
