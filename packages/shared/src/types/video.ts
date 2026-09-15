export interface GenerateVideoRequest {
  newsItemId: string;
}

export interface VideoAsset {
  type: string;
  url: string;
}

export interface VideoSummary {
  id: string;
  status: string;
  title?: string;
  errorMessage?: string;
  createdAt: string;
  assets?: VideoAsset[];
}
