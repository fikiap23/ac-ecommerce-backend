import * as _ from 'lodash';
import * as path from 'path';
import { formatErrorResponse } from './http.helper';
import { Response } from 'express';

export const isEmpty = (value: any) => {
  return _.isEmpty(value);
};

export const imageFileFilter = (req, file, callback) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  let validExt = false;

  for (const x of allowedExtensions) {
    if (ext === x) validExt = true;
  }

  if (validExt) {
    return callback(null, true);
  } else {
    req.fileValidationError = 'Invalid image file type';
    return callback(new Error('Invalid image file type'), false);
  }
};

export const videoFileFilter = (req, file, callback) => {
  const allowedExtension = ['.mp4'];
  const ext = path.extname(file.originalname);
  let validExt = false;

  for (const x in allowedExtension) {
    if (ext === allowedExtension[x]) validExt = true;
  }

  if (validExt) {
    return callback(null, true);
  } else {
    req.fileValidationError = 'Invalid file type';
    return callback(new Error('Invalid file type'), false);
  }
};

export const videoOrImageFileFilter = (req, file, callback) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4'];
  const ext = path.extname(file.originalname).toLowerCase();
  const isValid = allowedExtensions.includes(ext);

  if (isValid) {
    return callback(null, true);
  } else {
    req.fileValidationError = 'Invalid file type (only image/video allowed)';
    return callback(
      new Error('Invalid file type (only image/video allowed)'),
      false,
    );
  }
};

export const errorHandler = (response: Response, error: any) => {
  console.log(error);
  // check if the error has the structure of RpcCustomException
  if (
    error &&
    typeof error === 'object' &&
    'statusCode' in error &&
    'message' in error
  ) {
    const { statusCode, message } = error;

    return formatErrorResponse(response, message, statusCode);
  }

  // check if the error has the structure of RpcException
  if (
    error &&
    typeof error.error === 'object' &&
    'statusCode' in error.error &&
    'message' in error.error
  ) {
    const { statusCode, message } = error.error;
    return formatErrorResponse(response, message, statusCode);
  }

  // default error handling
  return formatErrorResponse(response, 'Internal server error', 500);
};
