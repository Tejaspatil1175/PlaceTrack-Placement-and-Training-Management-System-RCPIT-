import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-info-100 text-info-600 flex items-center justify-center mb-6 shadow-sm">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="font-heading text-3xl font-bold text-text-primary mb-2">
        404 — Page Not Found
      </h1>
      <p className="text-text-secondary text-sm max-w-md mb-8 leading-relaxed">
        The route you requested does not exist or has been moved.
      </p>
      <Link
        to="/dashboard"
        className="inline-flex items-center space-x-2 px-5 py-2.5 bg-primary-900 hover:bg-primary-700 text-white font-heading font-medium text-sm rounded-lg shadow-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
