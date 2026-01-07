import fs from 'fs/promises';
import path from 'path';
import { config } from '@/config/app';

export interface StoredFile {
  key: string;
  publicUrl: string;
}

export interface StorageProvider {
  savePng(params: { key: string; buffer: Buffer }): Promise<StoredFile>;
}

export class LocalStorageProvider implements StorageProvider {
  async savePng(params: { key: string; buffer: Buffer }): Promise<StoredFile> {
    const { key, buffer } = params;

    // key example: qr/abc123.png
    const uploadsRoot = path.resolve(config.upload.uploadPath);
    const absPath = path.join(uploadsRoot, key);

    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, buffer);

    const baseUrl = config.app.url.replace(/\/$/, '');
    const publicUrl = `${baseUrl}/uploads/${key}`;

    return { key, publicUrl };
  }
}

export const storage: StorageProvider = new LocalStorageProvider();
