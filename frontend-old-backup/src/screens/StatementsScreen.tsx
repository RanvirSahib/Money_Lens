'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Shield, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
  Eye,
  Info
} from 'lucide-react';
import { StatementSummary } from '@/types';
import { uploadStatement } from '@/lib/api/statements';
import { formatINR } from '@/lib/utils/currency';

interface StatementsScreenProps {
  onNavigateToSpending?: () => void;
  onNavigateToProfile?: () => void;
}

export const StatementsScreen: React.FC<StatementsScreenProps> = ({
  onNavigateToSpending,
  onNavigateToProfile,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [saveRawConsent, setSaveRawConsent] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'analyzing' | 'success' | 'error'>('idle');
  const [summary, setSummary] = useState<StatementSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setIsConsentModalOpen(true);
    }
  };

  const processUpload = async (saveRaw: boolean) => {
    if (!selectedFile) return;
    setSaveRawConsent(saveRaw);
    setIsConsentModalOpen(false);
    setUploadState('uploading');
    setErrorMessage(null);

    try {
      // Small simulated step to show telemetry analysis transition
      setTimeout(() => setUploadState('analyzing'), 600);
      const res = await uploadStatement(selectedFile, saveRaw);
      setSummary(res);
      setUploadState('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process statement.');
      setUploadState('error');
    }
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setSummary(null);
    setUploadState('idle');
    setErrorMessage(null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
              Privacy-First Ingestion
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-2">
            Bank Statement Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Upload PDF or CSV statements. Extract spending categories, recurring debits, and compare against your baseline profile. You control whether raw files are retained.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200 px-3.5 py-2 rounded-xl text-xs text-emerald-800 self-start md:self-auto font-medium">
          <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Encrypted In-Memory Processing Option</span>
        </div>
      </div>

      {/* Upload Box / Processing Area */}
      {uploadState === 'idle' && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 sm:p-12 text-center shadow-xs hover:border-emerald-500 transition-colors">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-900">
                Upload your bank statement
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Supports standard CSV and PDF formats from all major banks.
              </p>
            </div>

            <label className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Select Statement File</span>
              <input
                type="file"
                accept=".csv,.pdf,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            <p className="text-[11px] text-slate-400">
              We will ask how you want your raw statement handled before any parsing occurs.
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(uploadState === 'uploading' || uploadState === 'analyzing') && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs space-y-4">
          <div className="w-12 h-12 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <h2 className="text-base font-bold text-slate-900">
            {uploadState === 'uploading' ? 'Parsing Statement Structure...' : 'Classifying Categories & Reconciling Outflows...'}
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {selectedFile?.name} ({saveRawConsent ? 'Storage Permitted' : 'Ephemeral Processing Active'})
          </p>
        </div>
      )}

      {/* Error State */}
      {uploadState === 'error' && (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center shadow-xs space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
          <div>
            <h2 className="text-base font-bold text-slate-900">Processing Failed</h2>
            <p className="text-xs text-rose-600 mt-1">{errorMessage}</p>
          </div>
          <button
            onClick={resetUpload}
            className="px-5 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl cursor-pointer"
          >
            Try Another File
          </button>
        </div>
      )}

      {/* Success & Statement Insights Report */}
      {uploadState === 'success' && summary && (
        <div className="space-y-6">
          {/* Top Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Statement Successfully Analyzed
                </h2>
                <p className="text-xs text-slate-500">
                  {summary.filename} • {summary.transaction_count} Transactions Extracted • {summary.save_raw ? 'Raw file stored securely' : 'Raw file deleted immediately after parsing'}
                </p>
              </div>
            </div>

            <button
              onClick={resetUpload}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer self-start md:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Upload Another</span>
            </button>
          </div>

          {/* Vitals */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Inflows (Credits)</span>
              <div className="text-2xl font-bold text-emerald-600 tracking-tight font-mono">
                {formatINR(summary.total_credits)}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Total Outflows (Debits)</span>
              <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
                {formatINR(summary.total_debits)}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Net Monthly Cash Flow</span>
              <div className={`text-2xl font-bold tracking-tight font-mono ${summary.net_cashflow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatINR(summary.net_cashflow)}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs text-slate-500 font-medium">Recurring Commitments</span>
              <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
                {formatINR(summary.recurring_spending)}
              </div>
            </div>
          </div>

          {/* Observations & Category Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Extracted Observations</span>
              </h3>
              <div className="space-y-2.5">
                {summary.observations.map((obs, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                    <span>{obs}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Category Outflow Summary</span>
              </h3>
              <div className="space-y-2">
                {Object.entries(summary.category_breakdown)
                  .filter(([_, amt]) => amt > 0)
                  .map(([cat, amt], i) => (
                    <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-0">
                      <span className="font-medium text-slate-700">{cat}</span>
                      <span className="font-bold text-slate-900 font-mono">{formatINR(amt)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explicit Privacy Consent Dialog */}
      <AnimatePresence>
        {isConsentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                <Lock className="w-6 h-6" />
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-lg font-bold text-slate-900">
                  How should Money Lens handle this statement?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                  You are in complete control of your financial records. Choose your preferred data retention policy for <span className="font-medium text-slate-900 font-mono">{selectedFile?.name}</span>.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => processUpload(false)}
                  className="w-full p-4 rounded-2xl border-2 border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-950">
                      DON&apos;T SAVE MY STATEMENT (Ephemeral)
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md">
                      Recommended
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1">
                    Process in-memory, extract categorized analytics, then delete the raw file immediately.
                  </p>
                </button>

                <button
                  onClick={() => processUpload(true)}
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all cursor-pointer"
                >
                  <span className="text-sm font-bold text-slate-900">
                    SAVE MY STATEMENT
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Securely retain encrypted raw statement for permitted historical comparisons.
                  </p>
                </button>
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={() => {
                    setIsConsentModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 font-medium cursor-pointer"
                >
                  Cancel Upload
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
