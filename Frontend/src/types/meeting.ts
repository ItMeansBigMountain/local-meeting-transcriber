export interface Meeting {
  Id: number;
  Title?: string;
  AudioUrl: string;
  Summary?: string;
  Transcript?: string;
  DiarizedTranscript?: string;
  CreatedUtc: string;
}

export interface NormalizedMeeting {
  id: string | number;
  title?: string;
  audioUrl: string;
  summary?: string;
  transcript?: string;
  diarizedTranscript?: string;
  createdUtc: string;
}
