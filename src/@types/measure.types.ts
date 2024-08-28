export type ErrorResponse = {
  error_code:
    | 'INVALID_DATA'
    | 'DOUBLE_REPORT'
    | 'MEASURE_NOT_FOUND'
    | 'CONFIRMATION_DUPLICATE'
    | 'INVALID_TYPE'
    | 'SERVER_ERROR'
    | 'MEASURES_NOT_FOUND';
  error_description: string;
};

export type SuccessResponse = {
  image_url?: string;
  measure_value?: number;
  measure_uuid?: string;
  success?: boolean;
};

export enum MeasureType {
  WATER = 'WATER',
  GAS = 'GAS',
}
