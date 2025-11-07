
import React from 'react';
import type { GradingResult, FeedbackItem } from '../types';

interface GradingResultDisplayProps {
  result: GradingResult;
}

const ScoreCircle: React.FC<{ score: number, maxScore: number }> = ({ score, maxScore }) => {
    const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;

    let strokeColor = 'stroke-green-500';
    if (percentage < 70) strokeColor = 'stroke-yellow-500';
    if (percentage < 40) strokeColor = 'stroke-red-500';

    return (
        <div className="relative flex items-center justify-center w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-slate-200"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <circle
                    className={`${strokeColor} transition-all duration-1000 ease-in-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-slate-800">{score}</span>
                <span className="text-sm text-slate-500">/ {maxScore}</span>
            </div>
        </div>
    );
};

const GradingResultDisplay: React.FC<GradingResultDisplayProps> = ({ result }) => {
  return (
    <div className="space-y-8 p-4">
      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col md:flex-row items-center gap-6">
        <ScoreCircle score={result.overallScore} maxScore={result.maxPossibleScore} />
        <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold text-slate-800">Overall Grade</h2>
            <p className="mt-2 text-slate-600">{result.summary}</p>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-slate-800 mb-4">Detailed Feedback</h3>
        <div className="space-y-4">
          {result.feedbackItems.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h4 className="text-lg font-semibold text-blue-700 flex-1 pr-4">{item.criterion}</h4>
                  <span className="text-lg font-bold text-slate-700 bg-slate-100 rounded-full px-3 py-1">
                    {item.score} / {item.maxScore}
                  </span>
                </div>
                <p className="mt-3 text-slate-600 whitespace-pre-wrap">{item.feedback}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GradingResultDisplay;
