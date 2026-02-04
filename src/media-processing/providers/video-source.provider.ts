import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execPromise = promisify(exec);

export interface SourcedVideoMetadata {
    sourceUrl: string;
    title: string;
    channel?: string;
    duration?: number;
    downloadPath: string;
}

@Injectable()
export class VideoSourceProvider {
    // Use explicit env override if yt-dlp isn't on PATH
    private ytdlPath = process.env.YTDL_PATH || 'yt-dlp'; // ensure yt-dlp is installed

    /**
     * Download video from YouTube URL
     */
    async downloadYouTubeVideo(url: string, outputDir: string): Promise<SourcedVideoMetadata> {
        // If a local file path or file:// URL is provided, skip yt-dlp and
        // return a minimal metadata object pointing to the existing file.
        try {
            if (url.startsWith('file://')) {
                const localPath = url.replace('file://', '');
                if (fs.existsSync(localPath)) {
                    return {
                        sourceUrl: url,
                        title: path.basename(localPath, path.extname(localPath)),
                        channel: 'local-file',
                        duration: 0,
                        downloadPath: localPath,
                    };
                }
                throw new Error(`Local file not found: ${localPath}`);
            }

            if (fs.existsSync(url)) {
                return {
                    sourceUrl: `file://${url}`,
                    title: path.basename(url, path.extname(url)),
                    channel: 'local-file',
                    duration: 0,
                    downloadPath: url,
                };
            }

            const sanitizedTitle = this._sanitizeFilename(url.split('v=')[1] || 'video');
            const outputPath = path.join(outputDir, `${sanitizedTitle}-${Date.now()}.mp4`);

            // Use yt-dlp to download the best available format (mp4 preferred)
            const cmd = `${this.ytdlPath} -f "best[ext=mp4]" -o "${outputPath}" "${url}"`;
            await execPromise(cmd);

            // Extract metadata (title, channel, duration)
            const infoCmd = `${this.ytdlPath} --dump-json --no-warnings "${url}"`;
            const { stdout } = await execPromise(infoCmd);
            const metadata = JSON.parse(stdout);

            return {
                sourceUrl: url,
                title: metadata.title || 'Unknown Title',
                channel: metadata.channel || metadata.uploader || 'Unknown Channel',
                duration: metadata.duration || 0,
                downloadPath: outputPath,
            };
        } catch (err) {
            throw new Error(`Failed to download video from ${url}: ${err.message}`);
        }
    }

    /**
     * Search for trending YouTube videos (requires YouTube Data API)
     */
    async fetchTrendingVideoUrls(maxResults = 10): Promise<string[]> {
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

        try {
            const res = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    part: 'snippet,contentDetails',
                    chart: 'mostPopular',
                    regionCode: 'US',
                    maxResults,
                    key: apiKey,
                },
            });

            return res.data.items.map((item: any) => `https://www.youtube.com/watch?v=${item.id}`);
        } catch (err) {
            throw new Error(`Failed to fetch trending videos: ${err.message}`);
        }
    }

    /**
     * Search for videos by keyword (requires YouTube Data API)
     */
    async searchVideosByKeyword(keyword: string, maxResults = 10): Promise<string[]> {
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (!apiKey) throw new Error('YOUTUBE_API_KEY is not set');

        try {
            const res = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    q: keyword,
                    type: 'video',
                    order: 'relevance',
                    maxResults,
                    key: apiKey,
                },
            });

            return res.data.items.map((item: any) => `https://www.youtube.com/watch?v=${item.id.videoId}`);
        } catch (err) {
            throw new Error(`Failed to search videos: ${err.message}`);
        }
    }

    private _sanitizeFilename(filename: string): string {
        return filename.replace(/[^a-z0-9_-]/gi, '_').toLowerCase();
    }
}
