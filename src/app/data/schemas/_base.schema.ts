export interface ApiResponse<T> {
  error_schema: ErrorSchema;
  output_schema: T;
}

export interface ErrorSchema {
  error_code: string;
  error_message:
  | {
    english: string;
    indonesian: string;
  }
  | string;
}
