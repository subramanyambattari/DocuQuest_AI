'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, we'd pass the JWT token in headers
    fetch('http://localhost:8000/api/v1/documents', {
      headers: { 'Authorization': `Bearer fake-token-for-now` }
    })
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) setDocuments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DocuQuest AI Dashboard</h1>
          <Link href="/upload" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
            Upload Document
          </Link>
        </header>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-gray-600">Filename</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Status</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Date Uploaded</th>
                <th className="py-4 px-6 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">Loading documents...</td></tr>
              ) : documents.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 text-gray-500">No documents found. Upload your first PDF to begin extraction!</td></tr>
              ) : (
                documents.map((doc: any) => (
                  <tr key={doc.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">{doc.filename}</td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        doc.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                        doc.status === 'PROCESSING' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">{new Date(doc.createdAt).toLocaleDateString()}</td>
                    <td className="py-4 px-6">
                      <Link href={`/document/${doc.id}`} className="text-blue-600 hover:text-blue-800 font-medium">Review</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
