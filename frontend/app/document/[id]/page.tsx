'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function DocumentReviewPage() {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:8000/api/v1/questions/document/${id}`, {
      headers: { 'Authorization': `Bearer fake-token-for-now` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setQuestions(data);
        setLoading(false);
      });
  }, [id]);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Extracted Questions</h1>
          <p className="text-gray-500 mt-2">Review and verify the AI-extracted questions below.</p>
        </header>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading extracted questions...</div>
        ) : questions.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm text-gray-500">
            No questions found. The document might still be processing.
          </div>
        ) : (
          <div className="space-y-6">
            {questions.map((q: any, index: number) => (
              <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-gray-900">
                    <span className="text-blue-600 mr-2">Q{q.questionNumber || index + 1}.</span> 
                    {q.questionText}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-bold rounded ${q.confidence > 0.8 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {(q.confidence * 100).toFixed(0)}% Confidence
                  </span>
                </div>
                
                <div className="space-y-2 mt-4 ml-6">
                  {q.options.map((opt: any) => (
                    <div key={opt.id} className="flex items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                      <span className="font-bold text-gray-700 w-8">{opt.optionKey})</span>
                      <span className="text-gray-600">{opt.optionText}</span>
                    </div>
                  ))}
                </div>

                {q.status === 'NEEDS_REVIEW' && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 font-medium mb-3">⚠️ AI flagged this question for human review.</p>
                    <div className="flex gap-3">
                      <button className="bg-green-600 text-white px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-green-700">Approve As-Is</button>
                      <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded shadow-sm text-sm font-medium hover:bg-gray-50">Edit Text</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
