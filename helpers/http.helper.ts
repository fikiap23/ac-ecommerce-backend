import { Response } from 'express';
import {
  IFormatErrorResponse,
  IFormatResponse,
  IMessageStatusCode,
} from './interfaces/http-helper.interface';
import { RpcException } from '@nestjs/microservices';

export const getMessageStatusCode = (status: number): IMessageStatusCode => {
  let isSuccess = false;
  let message: string;
  switch (status) {
    case 200:
      isSuccess = true;
      message = 'OK';
      break;
    case 201:
      isSuccess = true;
      message = 'CREATED';
      break;
    case 400:
      message = 'BAD_REQUEST';
      break;
    default:
      message = 'NOT_DEFINED';
  }
  return { isSuccess, message };
};

export const formatErrorResponse = (
  response: Response,
  message: string,
  statusCode: number,
): Response<any, Record<string, IFormatErrorResponse>> => {
  const res = { isSuccess: false, message };

  return response.status(statusCode).send(res);
};

export const formatResponse = (
  response: Response,
  status: number,
  data: any,
  meta?: any,
): Response<any, Record<string, IFormatResponse>> => {
  const { isSuccess, message } = getMessageStatusCode(status);
  const res: IFormatResponse = { isSuccess, message, data, meta };
  return response.status(status).send(res);
};

export class CustomError extends RpcException {
  constructor({
    message,
    statusCode,
  }: {
    message: string;
    statusCode: number;
  }) {
    super({
      statusCode,
      message,
    });
  }
}
