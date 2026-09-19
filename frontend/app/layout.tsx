import './globals.css';
import { Sidebar, Header } from '../components/UI';

export const metadata = {
  title: 'DocuQuest AI - Intelligence Extraction',
  description: 'Scalable AI Document Processing',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-slate-50 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
          
          <Header />
          
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
