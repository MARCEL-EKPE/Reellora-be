export interface PipelineJob {
  videoId: string;
  stage: PipelineStage;
}

export type PipelineStage =
  | 'research'
  | 'script'
  | 'plan'
  | 'generate-media'
  | 'render'
  | 'quality-check'
  | 'publish';

export interface SceneGenerationJob {
  videoId: string;
  sceneId: string;
}
