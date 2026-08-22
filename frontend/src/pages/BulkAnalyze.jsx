import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiOutlineDocumentReport,
  HiOutlineUpload,
  HiOutlineDownload,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineSparkles
} from 'react-icons/hi';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

import PageTransition from '../components/PageTransition';
import LoadingSpinner from '../components/LoadingSpinner';
import { analyzeBulk } from '../services/api';
import ResultCard from '../components/ResultCard';

export default function BulkAnalyze() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError('');
    setResult(null);
    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      toast.error('Invalid file type');
      return;
    }
    // Limit to 5MB for example
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File is too large. Maximum size is 5MB.');
      toast.error('File too large');
      return;
    }
    setFile(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processBulk = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await analyzeBulk(file);
      setResult(data);
      toast.success(`Successfully processed ${data.processed_count} tickets!`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to process bulk analysis. Check if backend is running.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const downloadResults = () => {
    if (!result || !result.results || result.results.length === 0) return;

    const csvData = Papa.unparse(result.results);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `smartdesk_bulk_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Downloaded results successfully!');
  };

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Bulk Analyze
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Upload a CSV file containing your customer support tickets for batch processing.
          </p>
        </motion.div>

        {/* Upload Zone */}
        {!result && !loading && (
          <motion.div
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
              isDragging
                ? 'border-cyan-400 bg-cyan-400/10'
                : 'border-white/10 bg-white/5 hover:border-cyan-400/50 hover:bg-white/10'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <input
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'rgba(0,212,255,0.1)',
                  color: '#00d4ff',
                }}
              >
                {file ? (
                  <HiOutlineDocumentReport className="w-8 h-8" />
                ) : (
                  <HiOutlineUpload className="w-8 h-8" />
                )}
              </div>

              {file ? (
                <div className="text-center">
                  <p className="text-white font-semibold text-lg">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                  <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                      onClick={clearFile}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
                      style={{ background: 'rgba(255,255,255,0.05)' }}
                    >
                      Remove
                    </button>
                    <button
                      onClick={processBulk}
                      className="flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                      style={{
                        background: 'linear-gradient(135deg, #00d4ff 0%, #00b8db 100%)',
                        color: '#0a0f1e',
                        boxShadow: '0 0 20px rgba(0,212,255,0.25)',
                      }}
                    >
                      <HiOutlineSparkles className="w-4 h-4" />
                      Process File
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium text-lg mb-1">
                    Drag & Drop your CSV file here
                  </p>
                  <p className="text-gray-400 text-sm mb-4">
                    File must contain a column named "text", "ticket", or "message".
                  </p>
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="px-6 py-2.5 rounded-lg text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-400/10"
                    style={{ border: '1px solid rgba(0,212,255,0.3)' }}
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Error state */}
        <AnimatePresence>
          {error && !loading && (
            <motion.div
              className="glass-card p-5 mt-6 flex items-start gap-3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ borderColor: 'rgba(239,68,68,0.3)' }}
            >
              <HiOutlineExclamationCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-red-400 text-sm font-medium">Upload Failed</p>
                <p className="text-red-400/70 text-xs mt-1">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12"
            >
              <LoadingSpinner text={`Processing ${file?.name}… This may take a moment.`} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results summary */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="glass-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-cyan-400/30 bg-cyan-400/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400">
                    <HiOutlineCheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Analysis Complete</h2>
                    <p className="text-sm text-gray-400">
                      Successfully processed <span className="text-cyan-400 font-semibold">{result.processed_count}</span> tickets
                      in <span className="text-cyan-400 font-semibold">{(result.response_time_ms / 1000).toFixed(2)}s</span>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={downloadResults}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:-translate-y-1"
                  style={{
                    background: 'linear-gradient(135deg, #00ff88 0%, #00d4ff 100%)',
                    color: '#0a0f1e',
                    boxShadow: '0 0 20px rgba(0,255,136,0.25)',
                  }}
                >
                  <HiOutlineDownload className="w-5 h-5" />
                  Download Results (CSV)
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={clearFile}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Analyze another file
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </PageTransition>
  );
}
