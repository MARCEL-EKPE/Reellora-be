export interface CompositionRequest {
  videoId: string;
  sceneAssets: Array<{
    storageKey: string;
    durationSeconds: number;
    narrationStorageKey?: string;
  }>;
  finalOutputPath: string;
  musicStorageKey?: string;
  logoPath?: string;
  subtitleStorageKey?: string;
}
