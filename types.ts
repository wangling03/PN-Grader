
export interface FeedbackItem {
  criterion: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface GradingResult {
  overallScore: number;
  maxPossibleScore: number;
  summary: string;
  feedbackItems: FeedbackItem[];
}
