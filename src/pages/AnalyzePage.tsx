import { useEffect, useState } from 'react';
import { analyzeResume, getApplications } from '../api/applications';
import type { AnalyzeResponse, Application } from '../types';
import AnalysisResults from '../components/AnalysisResults';

export default function AnalyzePage() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText]         = useState('');
  const [analyzing, setAnalyzing]           = useState(false);
  const [results, setResults]               = useState<AnalyzeResponse | null>(null);
  const [error, setError]                   = useState<string | null>(null);

  // For the "load from saved application" feature
  const [applications, setApplications]         = useState<Application[]>([]);
  const [selectedAppId, setSelectedAppId]       = useState<string>('');
  const [selectedCompany, setSelectedCompany]   = useState<string>('');

  // Load saved applications on mount for the dropdown
  useEffect(() => {
    getApplications()
      .then(data => setApplications(
        data.filter(a => a.jobDescriptionText && a.jobDescriptionText.trim() !== '')
      ))
      .catch(() => {}); // Silently fail — dropdown is a convenience feature
  }, []);

  // When user picks a saved application, auto-fill the JD textarea
  const handleAppSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedAppId(id);

    if (!id) {
      setJobDescription('');
      setSelectedCompany('');
      return;
    }

    const app = applications.find(a => String(a.id) === id);
    if (app) {
      setJobDescription(app.jobDescriptionText ?? '');
      setSelectedCompany(app.company);
    }
  };

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a job description.');
      return;
    }
    if (!resumeText.trim()) {
      setError('Please enter your resume text.');
      return;
    }

    setAnalyzing(true);
    setError(null);
    setResults(null);

    try {
      const data = await analyzeResume({ jobDescription, resumeText });
      setResults(data);
    } catch (err: any) {
      setError(
        err?.response?.status === 500
          ? 'The AI analysis failed. Check that your Anthropic API key is configured.'
          : 'Something went wrong. Please try again.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResults(null);
    setError(null);
    setJobDescription('');
    setResumeText('');
    setSelectedAppId('');
    setSelectedCompany('');
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          ✨ AI Resume Analyzer
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste a job description and your resume — Claude will score the match
          and suggest specific improvements
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Input panel */}
        <div className="space-y-5">

          {/* Load from saved application */}
          {applications.length > 0 && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
              <label className="text-sm font-medium text-indigo-800 block mb-2">
                📋 Load JD from a saved application
              </label>
              <select
                value={selectedAppId}
                onChange={handleAppSelect}
                className="w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">— Select an application —</option>
                {applications.map(app => (
                  <option key={app.id} value={String(app.id)}>
                    {app.company} — {app.role}
                  </option>
                ))}
              </select>
              <p className="text-xs text-indigo-600 mt-1.5">
                Only applications with a saved JD appear here
              </p>
            </div>
          )}

          {/* Job Description */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              rows={10}
              placeholder="Paste the full job description here..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-gray-400">
              {jobDescription.length} characters
            </p>
          </div>

          {/* Resume Text */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">
              Your Resume <span className="text-red-500">*</span>
            </label>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              rows={10}
              placeholder="Paste your resume text here (plain text works best)..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <p className="text-xs text-gray-400">
              {resumeText.length} characters
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <>
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Analyzing with Claude...
                </>
              ) : (
                '✨ Analyze Resume'
              )}
            </button>
            {results && (
              <button
                onClick={handleReset}
                className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

        </div>

        {/* RIGHT — Results panel */}
        <div>
          {!results && !analyzing && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-400 py-16">
                <p className="text-5xl mb-4">🤖</p>
                <p className="font-medium text-gray-500">
                  Results will appear here
                </p>
                <p className="text-sm mt-1">
                  Paste a JD and resume, then click Analyze
                </p>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center py-16">
                <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Claude is analyzing...</p>
                <p className="text-sm text-gray-400 mt-1">
                  This usually takes 5–10 seconds
                </p>
              </div>
            </div>
          )}

          {results && (
            <AnalysisResults
              results={results}
              company={selectedCompany || undefined}
            />
          )}
        </div>

      </div>
    </div>
  );
}