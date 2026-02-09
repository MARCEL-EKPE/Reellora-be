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
    async uploadToYouTube(videoPath: string, title: string, description: string) {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(process.cwd(), 'youtube-service-account.json'),
            scopes: ['https://www.googleapis.com/auth/youtube.upload'],
        });

    }

}