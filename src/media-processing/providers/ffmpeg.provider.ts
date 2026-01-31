import { Injectable } from '@nestjs/common';
import ffmpeg from "node-fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

@Injectable()
export class FfmpegProvider {

    async trimVideo(inputPath: string, outputPath: string, duration?: number): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .setStartTime("00:00:08")
                .setDuration(duration)
                .output(outputPath)
                .on("end", () => resolve(outputPath))
                .on("error", reject)
                .run();
        });
    }


    async addWatermark(
        inputPath: string,
        outputPath: string,
        logoPath: string
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .input(logoPath)
                .complexFilter([
                    {
                        filter: 'scale2ref',
                        options: {
                            w: 'main_w*0.08', // 8% of video width
                            h: 'ow/mdar',
                        },
                        inputs: ['1:v', '0:v'],
                        outputs: ['wm', 'base'],
                    },
                    {
                        filter: 'overlay',
                        options: {
                            x: 'main_w-overlay_w-20',
                            y: 'main_h-overlay_h-20',
                        },
                        inputs: ['base', 'wm'],
                    },
                ])
                .output(outputPath)
                .on('end', () => resolve(outputPath))
                .on('error', reject)
                .run();
        });
    }

}

// Since we're already building AI-driven video orchestration:

// Expose watermark config:
// {
//   sizeRatio: 0.08,
//   opacity: 0.8,
//   position: 'bottom-right'
// }