import type { Niche } from "~/enums/niche.enum";

export interface YouTubeData {
    channelId: string;
    title: string;
    niche: Niche
    thumbnail?: string;
    accessToken: string;
    refreshToken: string;
    tokenExpiry: number; // Date.now() + (expires_in * 1000)
    userId: string;
}
