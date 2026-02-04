import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

export interface UploadedVideoResult {
    videoId: string;
    url: string;
    title: string;
}

@Injectable()
export class VideoUploadProvider {
    private youtube: any;
    private clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    private privateKey = process.env.GOOGLE_PRIVATE_KEY;
    private channelId = process.env.YOUTUBE_CHANNEL_ID;

    constructor() {
        if (this.clientEmail && this.privateKey) {
            this.youtube = google.youtube({
                version: 'v3',
                auth: new google.auth.JWT({
                    email: this.clientEmail,
                    key: this.privateKey,
                    scopes: ['https://www.googleapis.com/auth/youtube.upload'],
                }),
            });
        }
    }

    /**
     * Upload a video file to YouTube channel
     */
    async uploadToYouTube(
        filePath: string,
        title: string,
        description: string,
        tags: string[] = [],
        privacyStatus = 'unlisted'
    ): Promise<UploadedVideoResult> {
        // For testing: save the file into the repository `videos/` folder
        if (!fs.existsSync(filePath)) {
            throw new Error(`Video file not found: ${filePath}`);
        }

        try {
            const videosDir = path.join(process.cwd(), 'videos');
            if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

            const destName = `${this._sanitizeFilename(title || path.basename(filePath, path.extname(filePath)))}-${Date.now()}${path.extname(filePath)}`;
            const destPath = path.join(videosDir, destName);
            fs.copyFileSync(filePath, destPath);

            const fakeId = `local-${Date.now()}`;
            const url = `file://${destPath}`;

            console.log(`✅ Video saved locally for testing: ${destPath}`);

            return {
                videoId: fakeId,
                url,
                title,
            };
        } catch (err) {
            throw new Error(`Failed to save video locally: ${err.message}`);
        }
    }

    private _sanitizeFilename(filename: string): string {
        return filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    }

    /**
     * Upload to S3 (alternative to YouTube)
     */
    async uploadToS3(filePath: string, bucketName: string, key: string): Promise<string> {
        // Placeholder for S3 upload
        throw new Error('S3 upload not yet implemented');
    }
}
