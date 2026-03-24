export interface SceneClipCandidate {
    sceneIndex: number;
    clips: Array<{
        path: string;
        start: number;
        duration: number;
        previewFrames: Array<{ path: string; timestamp: number }>;
    }>;
}