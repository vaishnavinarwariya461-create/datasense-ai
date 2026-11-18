import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { uploadFile } from '../../utils/api';
import { useDataStore, DEMO_DATASET } from '../../store/useDataStore';
import LoadingSpinner from '../Common/LoadingSpinner';

export default function DropZone({ onUploadSuccess, className = '' }) {
  const { setCurrentDataset } = useDataStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState('idle'); // 'idle' | 'uploading' | 'success' | 'error'

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      toast.error('Unsupported file format. Please upload CSV, Excel (.xlsx, .xls), or JSON.');
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      setUploadState('selected');
      toast.success(`Selected "${file.name}"`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
    multiple: false,
  });

  const handleStartUpload = async () => {
    if (!selectedFile) return;

    setUploadState('uploading');
    setUploadProgress(10);

    try {
      // Track upload progression
      const progressTimer = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 85) {
            clearInterval(progressTimer);
            return 85;
          }
          return prev + 15;
        });
      }, 150);

      const parsedDataset = await uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      clearInterval(progressTimer);
      setUploadProgress(100);
      setUploadState('success');
      
      setCurrentDataset(parsedDataset);
      toast.success('Dataset parsed & AI profiling complete!');

      if (onUploadSuccess) {
        setTimeout(() => {
          onUploadSuccess(parsedDataset);
        }, 800);
      }
    } catch (err) {
      setUploadState('error');
      toast.error(err.message || 'Failed to process dataset file');
    }
  };

  const handleReset = (e) => {
    e?.stopPropagation();
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadState('idle');
  };

  const handleLoadSample = (e) => {
    e?.stopPropagation();
    setCurrentDataset(DEMO_DATASET);
    toast.success('Loaded Global SaaS 2024 sample dataset!');
    if (onUploadSuccess) {
      onUploadSuccess(DEMO_DATASET);
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FileSpreadsheet className="w-8 h-8 text-purple-400" />;
    if (fileName.endsWith('.json')) return <FileCode className="w-8 h-8 text-cyan-400" />;
    if (fileName.endsWith('.csv')) return <FileSpreadsheet className="w-8 h-8 text-purple-400" />;
    return <FileText className="w-8 h-8 text-emerald-400" />;
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        {...getRootProps()}
        className={`
          relative rounded-3xl border-2 border-dashed p-8 md:p-12 text-center
          transition-all duration-300 cursor-pointer overflow-hidden backdrop-blur-xl
          ${
            isDragActive
              ? 'border-cyan-400 bg-cyan-950/20 shadow-glow-cyan scale-[1.01]'
              : 'border-white/15 bg-white/[0.02] hover:border-purple-500/50 hover:bg-white/[0.04]'
          }
        `}
      >
        <input {...getInputProps()} />

        {/* Ambient background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {uploadState === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center gap-4 relative z-10"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shadow-glow-sm-purple">
                <UploadCloud className="w-8 h-8 text-purple-300" />
              </div>

              <div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-1">
                  Drag & Drop your dataset here
                </h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Supports <span className="text-purple-300 font-medium">CSV</span>,{' '}
                  <span className="text-cyan-300 font-medium">Excel (.xlsx)</span>, or{' '}
                  <span className="text-emerald-300 font-medium">JSON</span> up to 50MB.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <span className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 shadow-glow-sm-purple transition-all">
                  Browse Files
                </span>
                
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 flex items-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Try Sample Data</span>
                </button>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-300 pt-2">
                <span>✓ Instant EDA</span>
                <span>•</span>
                <span>✓ Data Quality Scoring</span>
                <span>•</span>
                <span>✓ AI Story Generation</span>
              </div>
            </motion.div>
          )}

          {uploadState === 'selected' && selectedFile && (
            <motion.div
              key="selected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="flex flex-col items-center gap-5 relative z-10"
            >
              <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 flex items-center gap-4 max-w-md w-full">
                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  {getFileIcon(selectedFile.name)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for AI profiling
                  </p>
                </div>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleStartUpload}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-glow-purple transition-all"
                >
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Run Autonomous EDA</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {uploadState === 'uploading' && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 relative z-10 max-w-sm mx-auto"
            >
              <LoadingSpinner
                size="md"
                text="Parsing & Profiling Dataset..."
                subtext="Calculating health score, correlations, and executive story"
              />

              <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ ease: 'easeInOut', duration: 0.2 }}
                />
              </div>

              <span className="text-xs text-purple-300 font-mono">
                {uploadProgress}% Completed
              </span>
            </motion.div>
          )}

          {uploadState === 'success' && (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3 relative z-10"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Dataset Ready & Analyzed
              </h3>
              <p className="text-xs text-slate-300">
                Opening dashboard telemetry and charts...
              </p>
            </motion.div>
          )}

          {uploadState === 'error' && (
            <motion.div
              key="error"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center gap-3 relative z-10"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-white">Upload Interrupted</h3>
              <p className="text-xs text-slate-400 max-w-xs">
                Could not read dataset format. Check file headers and structure.
              </p>
              <button
                onClick={handleReset}
                className="mt-2 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/10 hover:bg-white/20 transition-colors"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
