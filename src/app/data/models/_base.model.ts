export interface OutputWrapper<T> {
  outputSchema: T;
  errorSchema: ErrorSchema;
}

export interface ErrorOutputWrapper<T> {
  status: number;
  code: string;
  message: string;
  data?: T;
}

export interface ErrorSchema {
  errorCode: string;
  errorMessage: string;
}
