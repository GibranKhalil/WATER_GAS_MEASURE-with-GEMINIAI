import { MeasureType } from 'src/@types/measure.types';
import { CreateMeasureDTO } from './createMeasure.dto';

export class UpdateMeasureDTO implements Partial<CreateMeasureDTO> {
  image?: string;
  customer_code?: string;
  measure_datetime?: Date;
  measure_type?: MeasureType;
  value?: number;
  has_confirmed?: boolean;
}
