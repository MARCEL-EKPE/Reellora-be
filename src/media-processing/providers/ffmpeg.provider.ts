import { Injectable } from '@nestjs/common';
import ffmpeg from "node-fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg"

ffmpeg.setFfmpegPath(ffmpegInstaller.path)

@Injectable()
export class FfmpegProvider {

    async trimVideo(inputPath: string, outputPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            ffmpeg(inputPath)
                .setStartTime("00:00:00")  // trim starting at 2s
                .setDuration(50)           // 5 seconds output
                .output(outputPath)
                .on("end", () => resolve(outputPath))
                .on("error", reject)
                .run();
        });
    }

}
