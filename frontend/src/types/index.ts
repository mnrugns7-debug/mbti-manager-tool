export interface GenerateRequest {
  mbti: string;
  traits: string;
  content: string;
  scenes: string[];
  intensity: string;
  selectedMemberId?: string;
}

export interface Strategy {
  order: string;
  keyValues: string[];
}

export interface NgApproach {
  ng: string;
  reason: string;
}

export interface Example {
  label: string;
  text: string;
}

export interface NgToGood {
  ng: string;
  good: string;
}

export interface GenerateResult {
  strategy: Strategy;
  ngApproaches: NgApproach[];
  tone: string;
  examples: Example[];
  ngToGood: NgToGood[];
  template: string;
}

export interface MbtiProfile {
  name: string;
  core: string;
  avoid: string;
}

export interface ApiResponse {
  result: GenerateResult;
  mbtiProfile: MbtiProfile;
}
