import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import {
  CreateBulkFileStorageBucketDto,
  CreateFileStorageBucketDto,
} from '../dto/gateway-storage-bucket.dto';
import { CustomError } from 'helpers/http.helper';

@Injectable()
export class GatewayStorageBucketRepository {
  async httpPostFile(dto: CreateFileStorageBucketDto): Promise<void> {
    const url = `${process.env.BASE_URL_STORAGE_BUCKET}/files`;
    const formData = new FormData();
    formData.append('name', dto.name);
    formData.append('access', dto.access);
    formData.append('tribe', dto.tribe);
    formData.append('service', dto.service);
    formData.append('module', dto.module);
    formData.append('file', dto.file.buffer, dto.name);

    await axios
      .post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'SSB-KEY': process.env.API_KEY_VALUE_STORAGE_BUCKET,
        },
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
        throw new CustomError({
          message: 'Error in save file',
          statusCode: 500,
        });
      });
  }

  async httpDeleteBulkFiles(dto: string[]): Promise<void> {
    const url = `${process.env.BASE_URL_STORAGE_BUCKET}/files`;

    await axios
      .delete(url, {
        data: {
          names: dto,
        },
        headers: {
          'SSB-KEY': process.env.API_KEY_VALUE_STORAGE_BUCKET,
        },
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
        throw new CustomError({
          message: 'Error in bulk delete file',
          statusCode: 500,
        });
      });
  }

  async httpPostBulkFiles(
    dtos: CreateBulkFileStorageBucketDto[],
  ): Promise<void> {
    const url = `${process.env.BASE_URL_STORAGE_BUCKET}/files/bulk`;

    const formData = new FormData();
    dtos.forEach((dto) => {
      formData.append('filesEntity', JSON.stringify(dto.filesEntity));
      formData.append('files', dto.files.buffer, dto.filesEntity.name);
    });

    await axios
      .post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'SSB-KEY': process.env.API_KEY_VALUE_STORAGE_BUCKET,
        },
      })
      .then(() => {
        return;
      })
      .catch((err) => {
        console.log(err);
        throw new CustomError({
          message: 'Error in bulk save file',
          statusCode: 500,
        });
      });
  }
}
