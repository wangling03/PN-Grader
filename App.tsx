
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import LoadingSpinner from './components/LoadingSpinner';
import GradingResultDisplay from './components/GradingResultDisplay';
import { gradePatientNote } from './services/geminiService';
import type { GradingResult } from './types';
import { ClipboardIcon, ChecklistIcon, SparklesIcon, ErrorIcon } from './components/IconComponents';

const DEFAULT_NOTE = `Patient: John Doe, 45M
CC: Chest Pain
HPI: Patient is a 45-year-old male with a history of hypertension who presents with a 2-hour history of substernal chest pain. He describes the pain as a "pressure" that radiates to his left arm. It started while he was mowing the lawn. He rates the pain as 8/10. He took one sublingual nitroglycerin tablet at home with partial relief. He denies shortness of breath, nausea, or diaphoresis.
ROS: All other systems reviewed and are negative.
PMH: Hypertension, diagnosed 5 years ago.
Medications: Lisinopril 10mg daily.
Allergies: No known drug allergies.
SH: Smokes 1 pack of cigarettes per day for 25 years. Drinks alcohol socially.
FH: Father had a myocardial infarction at age 55.
PE:
Vitals: BP 150/90, HR 95, RR 18, T 98.6°F, SpO2 98% on RA.
Gen: Alert and oriented, in mild distress due to pain.
CV: Regular rate and rhythm, no murmurs.
Lungs: Clear to auscultation bilaterally.
A/P: Acute coronary syndrome is suspected. Will obtain EKG, cardiac enzymes. Administer aspirin. Consult cardiology.`;

const DEFAULT_RUBRIC = `SOAP Note Evaluation Rubric:

1. Subjective (Max 10 points):
   - Chief Complaint (CC): Clearly stated (2 pts)
   - History of Present Illness (HPI): Includes location, quality, severity, duration, timing, context, modifying factors, associated signs/symptoms (OLD CARTS) (5 pts)
   - Review of Systems (ROS): Relevant systems addressed (3 pts)

2. Objective (Max 10 points):
   - Physical Exam (PE): Includes relevant systems and findings (5 pts)
   - Vitals: Complete set of vital signs included (3 pts)
   - Results: Mentions relevant labs/imaging if available (2 pts)

3. Assessment (Max 5 points):
   - Primary Diagnosis/Problem: Clearly stated and justified by S & O data (3 pts)
   - Differential Diagnoses: At least one other possibility considered (2 pts)

4. Plan (Max 5 points):
   - Diagnostic Plan: Further tests or imaging ordered (2 pts)
   - Therapeutic Plan: Treatments or medications prescribed (3 pts)
`;


const App: React.FC = () => {
  const [patientNote, setPatientNote] = useState<string>(DEFAULT_NOTE);
  const [rubric, setRubric] = useState<string>(DEFAULT_RUBRIC);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGrade = useCallback(async () => {
    if (!patientNote.trim() || !rubric.trim()) {
      setError("Patient note and rubric cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setGradingResult(null);

    try {
      const result = await gradePatientNote(patientNote, rubric);
      setGradingResult(result);
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [patientNote, rubric]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 sm:px-0">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <label htmlFor="patient-note" className="flex items-center text-xl font-semibold text-gray-800 mb-3">
                <ClipboardIcon className="w-6 h-6 mr-2 text-blue-600" />
                Patient Note
              </label>
              <textarea
                id="patient-note"
                rows={15}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm font-mono"
                value={patientNote}
                onChange={(e) => setPatientNote(e.target.value)}
                placeholder="Paste the patient's note here..."
              />
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <label htmlFor="rubric" className="flex items-center text-xl font-semibold text-gray-800 mb-3">
                <ChecklistIcon className="w-6 h-6 mr-2 text-blue-600" />
                Grading Rubric
              </label>
              <textarea
                id="rubric"
                rows={10}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out text-sm"
                value={rubric}
                onChange={(e) => setRubric(e.target.value)}
                placeholder="Paste the grading rubric here..."
              />
            </div>
            <button
              onClick={handleGrade}
              disabled={isLoading}
              className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Grading...' : 'Grade Note with AI'}
            </button>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-xl shadow-md min-h-[30rem]">
            <div className="flex items-center text-xl font-semibold text-gray-800 p-6 border-b border-gray-200">
                <SparklesIcon className="w-6 h-6 mr-2 text-blue-600" />
                Grading Results
            </div>
            <div className="p-2">
                {isLoading && <LoadingSpinner />}
                {error && (
                    <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start">
                        <ErrorIcon className="w-5 h-5 mr-3 mt-1 flex-shrink-0"/>
                        <div>
                            <h4 className="font-bold">Error</h4>
                            <p>{error}</p>
                        </div>
                    </div>
                )}
                {gradingResult && <GradingResultDisplay result={gradingResult} />}
                {!isLoading && !error && !gradingResult && (
                    <div className="text-center p-10 text-slate-500">
                        <h3 className="text-lg font-medium">Ready to Grade</h3>
                        <p className="mt-1">Enter a patient note and a rubric, then click the "Grade Note" button to see the AI's evaluation.</p>
                    </div>
                )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
