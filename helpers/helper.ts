import { createWriteStream, promises as fsp, mkdirSync } from 'fs';
import { extname } from 'path';
import * as path from 'path';
import { CustomError } from './http.helper';
import { Readable } from 'stream';

const BASE_PUBLIC = path.resolve('./public');
const UPLOAD_DIR = ['uploads'];

function safeJoin(base: string, ...segments: string[]) {
  const p = path.resolve(base, ...segments);
  if (!p.startsWith(base))
    throw new CustomError({ message: 'Path invalid', statusCode: 400 });
  return p;
}

export function assertImages(files?: Express.Multer.File[]) {
  if (!files?.length) return;
  for (const f of files) {
    const ext = path.extname(f.originalname).toLowerCase();
    const okExt = ['.png', '.jpg', '.jpeg', '.webp'];
    const okMime = ['image/png', 'image/jpeg', 'image/webp'];
    if (!okExt.includes(ext) || !okMime.includes(f.mimetype)) {
      throw new CustomError({ message: 'Invalid file type', statusCode: 400 });
    }
    // opsional: size limit tambahan selain Multer
    const MAX_MB = 3;
    if (f.size > MAX_MB * 1024 * 1024) {
      throw new CustomError({
        message: `File size max ${MAX_MB}MB`,
        statusCode: 400,
      });
    }
  }
}

/** Simpan semua file, return {filename,url,absPath}. Jika gagal di tengah, hapus yang sudah terbuat. */
export const getFilename = (file?: Express.Multer.File) => {
  let fileName: string;
  if (file) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    fileName = `${uniqueSuffix}${ext}`;
    return fileName;
  }

  return fileName;
};

export const createFileImageHelper = async (imageFile, writePath, fileName) => {
  // create directory if not exists
  mkdirSync(writePath, { recursive: true });

  // write stream and waiting process
  const is = Readable.from(imageFile.buffer);
  const os = createWriteStream(`${writePath}/${fileName}`);
  is.pipe(os);

  return 'success';
};

export type SavedImage = { filename: string; url: string; absPath: string };
export async function saveImages(
  files: Express.Multer.File[] = [],
  subdir: string | string[] = 'uploads',
  nameLabel = 'Image',
): Promise<SavedImage[]> {
  if (!files.length) return [];

  // normalisasi subdir -> segments
  const segments = Array.isArray(subdir)
    ? subdir
    : subdir.split('/').filter(Boolean);

  // direktori tujuan absolut di dalam ./public
  const targetAbs = safeJoin(BASE_PUBLIC, ...segments);
  await fsp.mkdir(targetAbs, { recursive: true });

  const saved: SavedImage[] = [];

  try {
    for (const f of files) {
      // pastikan getFilename mendukung label + file
      const filename = getFilename(f);
      // tulis file
      await createFileImageHelper(f, targetAbs, filename);

      // URL publik selalu POSIX
      const url = '/' + path.posix.join(...segments, filename);
      const absPath = path.join(targetAbs, filename);
      saved.push({ filename, url, absPath });
    }
    return saved;
  } catch (err) {
    // rollback: hapus semua file yang sempat dibuat
    await Promise.allSettled(saved.map((s) => fsp.unlink(s.absPath)));
    throw err;
  }
}

export async function deleteFilesBestEffort(absPaths: string[]) {
  await Promise.allSettled(
    absPaths.map((p) =>
      fsp.unlink(p).catch((e: any) => {
        if (e?.code !== 'ENOENT') throw e;
      }),
    ),
  );
}
