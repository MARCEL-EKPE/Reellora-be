import { Injectable, BadRequestException, Logger, Inject } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { Readable } from 'stream';
import assetsConfig from '../config/assets.config';
import type { AssetStorage, AssetUploadRequest, StoredAsset } from '../../pipeline-core/interfaces/asset-storage.interface';

@Injectable()
export class LocalAssetStorageProvider implements AssetStorage {
    private readonly logger = new Logger(LocalAssetStorageProvider.name);

    constructor(
        @Inject(assetsConfig.KEY)
        private readonly config: ConfigType<typeof assetsConfig>,
    ) { }

    async upload(request: AssetUploadRequest): Promise<StoredAsset> {
        const basePath = this.config.localBasePath;
        const targetPath = path.join(basePath, request.key);
        const targetDir = path.dirname(targetPath);

        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        const buffer = await this.toBuffer(request.body);
        await fs.promises.writeFile(targetPath, buffer);

        this.logger.log(`Stored local asset: ${request.key}`);

        return {
            storageKey: request.key,
            url: this.toFileUrl(targetPath),
            sizeBytes: buffer.length,
            mimeType: request.contentType,
        };
    }

    async download(key: string): Promise<Buffer> {
        const targetPath = path.join(this.config.localBasePath, key);

        if (!fs.existsSync(targetPath)) {
            throw new BadRequestException(`Local asset not found: ${key}`);
        }

        return fs.promises.readFile(targetPath);
    }

    async getSignedUrl(key: string): Promise<string> {
        const targetPath = path.join(this.config.localBasePath, key);

        if (!fs.existsSync(targetPath)) {
            throw new BadRequestException(`Local asset not found: ${key}`);
        }

        return this.toFileUrl(targetPath);
    }

    async delete(key: string): Promise<void> {
        const targetPath = path.join(this.config.localBasePath, key);

        if (!fs.existsSync(targetPath)) {
            throw new BadRequestException(`Local asset not found: ${key}`);
        }

        await fs.promises.unlink(targetPath);
        this.logger.log(`Deleted local asset: ${key}`);
    }

    private toFileUrl(targetPath: string): string {
        return `file://${path.resolve(targetPath)}`;
    }

    private async toBuffer(body: Buffer | Readable | string): Promise<Buffer> {
        if (Buffer.isBuffer(body)) {
            return body;
        }

        if (typeof body === 'string') {
            return Buffer.from(body, 'utf8');
        }

        if (body instanceof Readable) {
            const chunks: Buffer[] = [];

            for await (const chunk of body) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, 'utf8'));
            }

            return Buffer.concat(chunks);
        }

        throw new BadRequestException('Unsupported upload body type');
    }
}
