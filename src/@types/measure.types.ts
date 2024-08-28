export type ErrorResponse = {
    error_code: "INVALID_DATA" | "DOUBLE_REPORT";
    error_description: string;
};

export type SuccessResponse = {
    image_url: string;
    measure_value: number;
    measure_uuid: string;
};