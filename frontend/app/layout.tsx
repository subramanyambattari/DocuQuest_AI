import './globals.css';
import Link from 'next/link';

export const metadata = {
  title: 'DocuQuest AI - Intelligence Extraction',
  description: 'Scalable AI Document Processing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-slate-50 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20 hidden md:flex">
          <div className="h-16 flex items-center px-6 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">
              <svg className="w-6 h-6 text-indigo-400" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
              DocuQuest AI
            </div>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link href="/" className="flex items-center gap-3 px-4 py-3 bg-indigo-600/10 text-indigo-400 rounded-xl font-medium transition-all hover:bg-indigo-600/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
              Dashboard
            </Link>
            <Link href="/upload" className="flex items-center gap-3 px-4 py-3 text-slate-400 rounded-xl font-medium transition-all hover:bg-slate-800 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              Process Document
            </Link>
          </nav>
          <div className="p-4 border-t border-slate-800">
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold shadow-lg">AD</div>
              <div className="text-sm">
                <p className="font-medium">Admin User</p>
                <p className="text-slate-400 text-xs">admin@docuquest.ai</p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
          <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center px-8 z-10 sticky top-0">
            <h2 className="text-slate-800 font-semibold text-lg">Workspace Overview</h2>
          </header>
          
          <main className="flex-1 overflow-y-auto bg-slate-50 p-8 scroll-smooth">
            <div className="max-w-6xl mx-auto pb-12">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
