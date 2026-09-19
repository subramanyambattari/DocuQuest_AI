'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto pt-8">
      
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Review Extraction</h1>
          <p className="text-slate-500 mt-1">Verify and edit the AI-extracted multiple choice questions.</p>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-24 text-center rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <svg className="animate-spin h-8 w-8 text-indigo-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p className="text-slate-500 font-medium">Fetching structural extraction...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white p-24 text-center rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
           <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
           </div>
          <h3 className="text-lg font-semibold text-slate-900">No Questions Found</h3>
          <p className="text-slate-500 mt-2 max-w-sm">The document might still be processing through the AI pipeline, or it did not contain any recognizable multiple choice questions.</p>
        </div>
      ) : (
        <div className="space-y-6 pb-12">
          {questions.map((q: any, index: number) => (
            <div key={q.id} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
              
              {/* Confidence Indicator Line */}
              <div className={`absolute top-0 left-0 w-1.5 h-full ${q.confidence > 0.8 ? 'bg-emerald-500' : 'bg-amber-400'}`}></div>

              <div className="flex justify-between items-start mb-6">
                <h3 className="font-bold text-xl text-slate-900 leading-snug max-w-2xl">
                  <span className="text-indigo-600 mr-2 opacity-60">Q{q.questionNumber || index + 1}.</span> 
                  {q.questionText}
                </h3>
                
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${q.confidence > 0.8 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/></svg>
                    {(q.confidence * 100).toFixed(0)}% Match
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 mt-4 ml-8">
                {q.options.map((opt: any) => (
                  <div key={opt.id} className="flex items-center p-3.5 bg-slate-50 border border-slate-100 rounded-xl hover:bg-slate-100 hover:border-slate-200 transition-colors cursor-default">
                    <span className="font-bold text-slate-400 w-10 shrink-0 bg-white shadow-sm border border-slate-200 rounded-md py-1 text-center mr-4">{opt.optionKey}</span>
                    <span className="text-slate-700 font-medium">{opt.optionText}</span>
                  </div>
                ))}
              </div>

              {q.status === 'NEEDS_REVIEW' && (
                <div className="mt-8 p-5 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-start justify-between">
                  <div>
                    <p className="text-sm text-amber-900 font-semibold mb-1 flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      Needs Human Verification
                    </p>
                    <p className="text-sm text-amber-700/80">The AI model flagged this extraction with low confidence. Please verify the OCR output.</p>
                  </div>
                  <div className="flex gap-3 shrink-0 ml-6">
                    <button className="bg-white border-2 border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                      Edit Text
                    </button>
                    <button className="bg-amber-500 text-white px-5 py-2.5 rounded-xl shadow-sm text-sm font-bold hover:bg-amber-600 shadow-amber-200 transition-colors">
                      Approve
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
