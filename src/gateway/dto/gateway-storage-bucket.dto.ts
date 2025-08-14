export class CreateFileStorageBucketDto {
  name: string;
  access: 'PUBLIC' | 'PRIVATE';
  tribe: string;
  service: string;
  module: string;
  file: Express.Multer.File;
  subFolder?: string;
}

export class FileEntity {
  name: string;
  access: 'PUBLIC' | 'PRIVATE';
  tribe: string;
  service: string;
  module: string;
  subFolder?: string;
}

export class CreateBulkFileStorageBucketDto {
  filesEntity: FileEntity;
  files: Express.Multer.File;
}
