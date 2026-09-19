'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setErrorMsg(null);

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/api/v1/documents', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer fake-token-for-now' },
        body: formData
      });

      if (res.ok) {
        router.push('/');
      } else {
        const errData = await res.json().catch(() => null);
        setErrorMsg(errData?.error?.message || 'Upload failed due to a server error. Check if MinIO and Redis are running.');
      }
    } catch (err) {
      setErrorMsg('Network error. Is the backend running on port 8000?');
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Document</h1>
        <form onSubmit={handleUpload} className="space-y-6">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
            <input 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button 
            type="submit" 
            disabled={!file || uploading}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Processing...' : 'Start AI Extraction'}
          </button>
        </form>
          {errorMsg && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-medium">{errorMsg}</div>}
      </div>
    </main>
  );
}
