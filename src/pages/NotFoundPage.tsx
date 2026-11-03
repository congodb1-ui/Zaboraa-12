import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Cpu, BookOpen } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <>
      {/* React 19 native head tag hoisting */}
      <title>Page Not Found — Zaboraa</title>
      <meta name="description" content="The requested page could not be found on Zaboraa." />
      <meta name="robots" content="noindex" />

      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-cyan-400 mx-auto flex items-center justify-center shadow-xl">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
              HTTP 404 // ROUTE NOT FOUND
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Page Not Found
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              The requested architecture resource, case study, or tool path does not exist or has been relocated.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold transition-all shadow-md"
            >
              <Home className="w-4 h-4" />
              <span>Return Home</span>
            </Link>
            <Link
              to="/case-studies"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Case Studies</span>
            </Link>
            <Link
              to="/tools"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium transition-colors"
            >
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>Workbench Tools</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
