'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertTriangle, Filter, Users, Mail } from 'lucide-react';
import AcquisitionMetrics from '@/components/admin/acquisition-metrics';
import SystemHealth from '@/components/admin/system-health';

interface UploadResults {
  totalRows: number;
  filtered: {
    malformedEmails: number;
    tiktokRelay: number;
    genericAddresses: number;
    disposableDomains: number;
    maleNames: number;
    blockedDomains: number;
    blockedSurnames: number;
    blockedAreaCodes: number;
    duplicateInCSV: number;
  };
  inserted: {
    contactsAdded: number;
    duplicatesSkipped: number;
  };
  errors: string[];
  sourceTag: string;
}

interface ProcessingStep {
  stage: string;
  description: string;
  count?: number;
  details?: string[];
  completed: boolean;
}

type UploadState = 'empty' | 'selected' | 'processing' | 'complete' | 'error';

export default function AcquisitionPage() {
  const [uploadState, setUploadState] = useState<UploadState>('empty');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourceTag, setSourceTag] = useState('');
  const [results, setResults] = useState<UploadResults | null>(null);
  const [processingSteps, setProcessingSteps] = useState<ProcessingStep[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setUploadState('selected');
      setResults(null);
      setErrorMessage('');
      setProcessingSteps([]);
    } else {
      setErrorMessage('Please upload a CSV file only');
      setUploadState('error');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    multiple: false
  });

  const addProcessingStep = (stage: string, description: string, count?: number, details?: string[]) => {
    setProcessingSteps(prev => [
      ...prev.map(step => ({ ...step, completed: true })),
      { stage, description, count, details, completed: false }
    ]);
  };

  const processUpload = async () => {
    if (!selectedFile) return;

    setUploadState('processing');
    setProcessingSteps([]);

    try {
      addProcessingStep('Parsing CSV', 'Reading and parsing CSV file structure...');
      
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('sourceTag', sourceTag || `csv_import_${new Date().toISOString().split('T')[0]}`);

      const response = await fetch('/api/admin/acquisition/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      setResults(data.results);
      
      // Show completion steps  
      const totalFiltered = Object.values(data.results.filtered).reduce((a, b) => (a as number) + (b as number), 0);
      
      addProcessingStep(
        'Import Complete', 
        `Processed ${data.results.totalRows} rows, filtered out ${totalFiltered} contacts`,
        data.results.inserted.contactsAdded,
        [
          `Malformed emails: ${data.results.filtered.malformedEmails}`,
          `TikTok relay: ${data.results.filtered.tiktokRelay}`,
          `Generic addresses: ${data.results.filtered.genericAddresses}`,
          `Disposable domains: ${data.results.filtered.disposableDomains}`,
          `Male names: ${data.results.filtered.maleNames}`,
          `Blocked domains: ${data.results.filtered.blockedDomains}`,
          `Blocked surnames: ${data.results.filtered.blockedSurnames}`,
          `Blocked area codes: ${data.results.filtered.blockedAreaCodes}`,
          `CSV duplicates: ${data.results.filtered.duplicateInCSV}`
        ]
      );
      
      setProcessingSteps(prev => prev.map(step => ({ ...step, completed: true })));
      setUploadState('complete');
      
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
      setUploadState('error');
    }
  };

  const resetUpload = () => {
    setUploadState('empty');
    setSelectedFile(null);
    setResults(null);
    setErrorMessage('');
    setProcessingSteps([]);
  };

  const totalFiltered = results ? Object.values(results.filtered).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-6">
      {/* Simplified Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--admin-text-primary)] mb-2">Contact Acquisition</h1>
        <p className="text-[var(--admin-text-secondary)]">Import and filter customer contacts from CSV exports</p>
      </div>

      {/* KPI Metrics Dashboard */}
      <AcquisitionMetrics />

      {/* System Health */}
      <SystemHealth />

      {/* Upload Section */}
      <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border-light)] p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">Import Contacts</h2>
          <div className="flex items-center gap-4 text-sm text-[var(--admin-text-secondary)]">
            <input
              type="text"
              value={sourceTag}
              onChange={(e) => setSourceTag(e.target.value)}
              placeholder={`Source tag (default: csv_import_${new Date().toISOString().split('T')[0]})`}
              className="flex-1 px-3 py-2 bg-[var(--admin-input)] border border-[var(--admin-border-light)] rounded-lg text-[var(--admin-text-primary)] placeholder-[var(--admin-text-secondary)] focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        {/* Upload Area */}
        {uploadState === 'empty' && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed border-[var(--admin-border-light)] rounded-xl p-8 text-center cursor-pointer transition-all hover:border-[var(--primary)]/50 hover:bg-[var(--admin-hover)]/30 ${
              isDragActive ? 'border-[var(--primary)] bg-[var(--primary)]/5' : ''
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-[var(--admin-text-muted)]" />
            <h3 className="text-lg font-medium text-[var(--admin-text-primary)] mb-2">
              {isDragActive ? 'Drop CSV file here' : 'Upload CSV File'}
            </h3>
            <p className="text-sm text-[var(--admin-text-secondary)] mb-4">
              Drag & drop or click to browse
            </p>
            <button className="bg-[var(--primary)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--primary)]/90 transition-colors">
              Choose File
            </button>
          </div>
        )}

        {/* File Selected */}
        {uploadState === 'selected' && selectedFile && (
          <div className="border border-[var(--admin-border-light)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-[var(--primary)]" />
                <div>
                  <p className="font-medium text-[var(--admin-text-primary)]">{selectedFile.name}</p>
                  <p className="text-sm text-[var(--admin-text-secondary)]">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={resetUpload}
                className="p-2 hover:bg-[var(--admin-hover)] rounded-lg transition-colors"
              >
                <XCircle className="h-4 w-4 text-[var(--admin-text-muted)]" />
              </button>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={resetUpload}
                className="px-4 py-2 text-[var(--admin-text-secondary)] hover:text-[var(--admin-text-primary)] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processUpload}
                className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
              >
                Process
              </button>
            </div>
          </div>
        )}

        {/* Processing */}
        {uploadState === 'processing' && (
          <div className="border border-[var(--admin-border-light)] rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Loader2 className="h-5 w-5 text-[var(--primary)] animate-spin" />
              <div>
                <p className="font-medium text-[var(--admin-text-primary)]">Processing...</p>
                <p className="text-sm text-[var(--admin-text-secondary)]">Filtering and importing contacts</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {processingSteps.map((step, index) => (
                <div key={index} className="flex items-center gap-3 text-sm">
                  {step.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                  ) : (
                    <Loader2 className="h-4 w-4 text-[var(--primary)] animate-spin shrink-0" />
                  )}
                  <span className={step.completed ? 'text-green-400' : 'text-[var(--admin-text-primary)]'}>
                    {step.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {uploadState === 'error' && (
          <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="h-5 w-5 text-red-400" />
              <div>
                <p className="font-medium text-red-400">Upload Failed</p>
                <p className="text-sm text-red-300">{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success Results */}
        {uploadState === 'complete' && results && (
          <div className="border border-green-500/20 bg-green-500/5 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <div>
                <p className="font-medium text-green-400">Import Complete</p>
                <p className="text-sm text-[var(--admin-text-secondary)]">
                  {results.inserted.contactsAdded} added • {results.inserted.duplicatesSkipped} duplicates • {totalFiltered} filtered
                </p>
              </div>
            </div>
            
            <button
              onClick={resetUpload}
              className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors"
            >
              Upload Another
            </button>
          </div>
        )}
      </div>
    </div>
  );
}