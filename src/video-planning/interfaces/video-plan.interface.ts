export interface VisualDescription {
  type: 'runway' | 'image' | 'stock' | 'graphic' | 'map';
  prompt: string;
  referenceImageUrl?: string;
}

export interface TransitionDescription {
  type?: string;
  durationSeconds?: number;
}

export interface VideoScene {
  id: string;
  order: number;
  narration?: string;
  durationSeconds?: number;
  visual?: VisualDescription;
  transition?: TransitionDescription;
}

export interface VideoPlan {
  id?: string;
  title?: string;
  estimatedDurationSeconds?: number;
  scenes: VideoScene[];
}
