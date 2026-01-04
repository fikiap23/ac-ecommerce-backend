import * as _ from 'lodash';
import * as path from 'path';
import { formatErrorResponse } from './http.helper';
import { Response } from 'express';

export const isEmpty = (value: any) => {
  return _.isEmpty(value);
};

export const imageFileFilter = (req, file, callback) => {
  const allowedExtensions = [
    '.jpg',
    '.jpeg',
    '.png',
    '.webp',
    '.gif',
    '.bmp',
    '.tiff',
    '.tif',
    '.heic',
    '.heif',
    '.svg',
    '.avif',
    '.jfif',
  ];

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

export const fileFilterImageOrDocument = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const imageExts = ['.jpg', '.jpeg', '.png', '.webp'];
  const docExts = [
    '.pdf',
    '.doc',
    '.docx',
    '.xls',
    '.xlsx',
    '.ppt',
    '.pptx',
    '.txt',
    '.csv',
    '.rtf',
  ];

  const imageMimes = ['image/jpeg', 'image/png', 'image/webp'];
  const docMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/rtf',
    'text/rtf',
  ];

  const ext = path.extname(file.originalname || '').toLowerCase();

  const validExt = imageExts.includes(ext) || docExts.includes(ext);
  const validMime =
    imageMimes.includes(file.mimetype) || docMimes.includes(file.mimetype);

  if (validExt || validMime) {
    return callback(null, true);
  }

  req.fileValidationError = 'Invalid file type (image/document only)';
  return callback(new Error('Invalid file type (image/document only)'), false);
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
