'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertTriangle, Filter, Users, Mail } from 'lucide-react';

interface UploadResults {
  totalRows: number;
  filtered: {
    malformedEmails: number;
    tiktokRelay: number;
    genericAddresses: number;
    disposableDomains: number;
    maleNames: number;
    blockedDomains: number;
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
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[var(--admin-border)] pb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
            <Upload className="h-5 w-5 text-[var(--primary)]" />
          </div>
          <h1 className="text-2xl font-semibold text-[var(--admin-text-primary)]">Contact Acquisition</h1>
        </div>
        <p className="text-[var(--admin-text-secondary)] leading-relaxed">
          Upload Shopify customer exports to import clean contact data.
        </p>
        <div className="mt-4 flex items-center gap-6 text-sm text-[var(--admin-text-secondary)]">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Advanced email & marketing consent filtering</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Auto-deduplication & male name filtering</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Direct Supabase contact insertion</span>
          </div>
        </div>
      </div>

      {/* Source Tag Input */}
      <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center">
            <Mail className="h-4 w-4 text-[var(--primary)]" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--admin-text-primary)]">Source Tag</h3>
        </div>
        <p className="text-[var(--admin-text-secondary)] text-sm mb-4">
          Tag all imported contacts with a source identifier for tracking purposes.
        </p>
        <input
          type="text"
          value={sourceTag}
          onChange={(e) => setSourceTag(e.target.value)}
          placeholder={`Default: csv_import_${new Date().toISOString().split('T')[0]}`}
          className="w-full px-4 py-3 bg-[var(--admin-input)] border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-primary)] placeholder-[var(--admin-text-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-colors"
        />
      </div>

      {/* Main Upload Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column - Upload Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Upload Zone */}
          {uploadState === 'empty' && (
            <div className="bg-[var(--admin-card)] rounded-xl border-2 border-dashed border-[var(--admin-border)] hover:border-[var(--primary)]/30 transition-colors">
              <div
                {...getRootProps()}
                className={`p-12 text-center cursor-pointer transition-colors ${
                  isDragActive ? 'bg-[var(--primary)]/5' : ''
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-[var(--admin-hover)] flex items-center justify-center">
                  <Upload className="h-8 w-8 text-[var(--admin-text-secondary)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--admin-text-primary)] mb-3">
                  {isDragActive ? 'Drop your CSV file here' : 'Upload Customer Data'}
                </h3>
                <p className="text-[var(--admin-text-secondary)] mb-6 leading-relaxed">
                  Drag and drop your CSV file or click to browse
                </p>
                <div className="flex justify-center">
                  <button className="bg-[var(--primary)] text-white px-8 py-3 rounded-xl font-medium hover:bg-[var(--primary)]/90 transition-all duration-200 hover:scale-105 hover:shadow-lg">
                    Select CSV File
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* File Selected */}
          {uploadState === 'selected' && selectedFile && (
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mr-4">
                    <FileText className="h-6 w-6 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--admin-text-primary)]">{selectedFile.name}</h3>
                    <p className="text-[var(--admin-text-secondary)] text-sm">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready to process
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetUpload}
                  className="w-8 h-8 rounded-lg bg-[var(--admin-hover)] hover:bg-red-500/10 text-[var(--admin-text-secondary)] hover:text-red-400 transition-all duration-200 flex items-center justify-center"
                >
                  <XCircle className="h-4 w-4" />
                </button>
              </div>
              
              <div className="bg-[var(--primary)]/10 rounded-xl p-4 mb-6 border border-[var(--primary)]/20">
                <h4 className="font-medium text-[var(--admin-text-primary)] mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[var(--primary)]" />
                  Processing Preview
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-[var(--admin-text-secondary)] leading-relaxed">
                    Shopify export will be filtered for marketing consent, deduplicated against existing contacts, and inserted into Supabase.
                  </p>
                  <p className="text-[var(--admin-text-primary)] font-medium">
                    Source tag: <span className="text-[var(--primary)]">{sourceTag || `csv_import_${new Date().toISOString().split('T')[0]}`}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={resetUpload}
                  className="px-6 py-3 border border-[var(--admin-border)] rounded-xl text-[var(--admin-text-secondary)] hover:bg-[var(--admin-hover)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processUpload}
                  className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-all duration-200 font-medium hover:scale-105 hover:shadow-lg"
                >
                  Start Processing
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {uploadState === 'processing' && (
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center mr-4">
                  <Loader2 className="h-6 w-6 text-[var(--primary)] animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--admin-text-primary)]">Processing Upload</h3>
                  <p className="text-[var(--admin-text-secondary)]">Applying filters and validating contacts...</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? 'bg-green-500/20 border border-green-500/30' 
                        : 'bg-[var(--primary)]/20 border border-[var(--primary)]/30'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-3 w-3 text-green-400" />
                      ) : (
                        <Loader2 className="h-3 w-3 text-[var(--primary)] animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        step.completed 
                          ? 'text-green-400' 
                          : 'text-[var(--admin-text-primary)]'
                      }`}>
                        {step.stage}
                      </p>
                      <p className="text-sm text-[var(--admin-text-secondary)]">{step.description}</p>
                      {step.count !== undefined && (
                        <p className="text-sm font-medium text-[var(--admin-text-primary)] mt-1">
                          {step.count} contacts qualified
                        </p>
                      )}
                      {step.details && step.details.length > 0 && (
                        <ul className="mt-2 text-sm text-[var(--admin-text-secondary)] space-y-1">
                          {step.details.map((detail, i) => (
                            <li key={i}>• {detail}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error */}
          {uploadState === 'error' && (
            <div className="bg-[var(--admin-card)] rounded-xl border border-red-500/20 p-8">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mr-4">
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--admin-text-primary)]">Upload Failed</h3>
                  <p className="text-red-400">{errorMessage}</p>
                </div>
              </div>
              
              <button
                onClick={resetUpload}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 hover:scale-105"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Success Results */}
          {uploadState === 'complete' && results && (
            <div className="bg-[var(--admin-card)] rounded-xl border border-green-500/20 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mr-4">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--admin-text-primary)]">Import Complete!</h3>
                  <p className="text-green-400">
                    {results.inserted.contactsAdded} contacts added • {results.inserted.duplicatesSkipped} duplicates skipped
                  </p>
                  <p className="text-[var(--admin-text-secondary)] text-sm mt-1">
                    Source: {results.sourceTag}
                  </p>
                </div>
              </div>
              
              {/* Key Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400">{results.inserted.contactsAdded}</div>
                  <div className="text-sm text-[var(--admin-text-secondary)]">✅ Added</div>
                </div>
                <div className="bg-yellow-500/10 rounded-xl p-4 text-center border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-400">{results.inserted.duplicatesSkipped}</div>
                  <div className="text-sm text-[var(--admin-text-secondary)]">⏭️ Duplicates</div>
                </div>
                <div className="bg-red-500/10 rounded-xl p-4 text-center border border-red-500/20">
                  <div className="text-2xl font-bold text-red-400">{totalFiltered}</div>
                  <div className="text-sm text-[var(--admin-text-secondary)]">❌ Filtered</div>
                </div>
              </div>
              
              <button
                onClick={resetUpload}
                className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 transition-all duration-200 font-medium hover:scale-105"
              >
                Upload Another File
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Info & Results */}
        <div className="space-y-6">
          
          {/* Filtering Info */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
            <h4 className="font-semibold text-[var(--admin-text-primary)] mb-4 flex items-center gap-2">
              <div className="w-5 h-5 rounded bg-[var(--primary)]/10 flex items-center justify-center">
                <Filter className="h-3 w-3 text-[var(--primary)]" />
              </div>
              Smart Filtering
            </h4>
            <div className="space-y-3 text-sm text-[var(--admin-text-secondary)]">
              <div>• Email format validation & malformed detection</div>
              <div>• TikTok relay email blocking</div>
              <div>• Generic/role address filtering</div>
              <div>• Disposable email domain blocking</div>
              <div>• Male name filtering (500+ names)</div>
              <div>• CSV duplicate detection</div>
            </div>
          </div>

          {/* File Format Guide */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
            <h4 className="font-semibold text-[var(--admin-text-primary)] mb-4">Shopify CSV Format</h4>
            <div className="space-y-3 text-sm text-[var(--admin-text-secondary)] leading-relaxed">
              <div><span className="text-[var(--admin-text-primary)] font-medium">Required fields:</span> Email, First Name, Last Name, Accepts Email Marketing</div>
              <div><span className="text-[var(--admin-text-primary)] font-medium">Optional:</span> Phone, Customer ID, other Shopify export columns</div>
              <div><span className="text-[var(--admin-text-primary)] font-medium">Target table:</span> contacts at nqanmlmgpxufvglxrfef.supabase.co</div>
              <div><span className="text-[var(--admin-text-primary)] font-medium">Deduplication:</span> ON CONFLICT (email) DO NOTHING</div>
            </div>
          </div>

          {/* Detailed Results */}
          {uploadState === 'complete' && results && (
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
              <h4 className="font-semibold text-[var(--admin-text-primary)] mb-4">Filtering Breakdown</h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Malformed emails</span>
                  <span className="font-medium text-red-400">{results.filtered.malformedEmails}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">TikTok relay</span>
                  <span className="font-medium text-red-400">{results.filtered.tiktokRelay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Generic/role addresses</span>
                  <span className="font-medium text-red-400">{results.filtered.genericAddresses}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Disposable domains</span>
                  <span className="font-medium text-red-400">{results.filtered.disposableDomains}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Male names</span>
                  <span className="font-medium text-red-400">{results.filtered.maleNames}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Blocked domains</span>
                  <span className="font-medium text-red-400">{results.filtered.blockedDomains}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Duplicate within CSV</span>
                  <span className="font-medium text-yellow-400">{results.filtered.duplicateInCSV}</span>
                </div>
              </div>
              
              {results.errors.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                  <div className="flex items-center gap-2 text-yellow-400 font-medium text-sm mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings
                  </div>
                  <ul className="text-sm text-[var(--admin-text-secondary)] space-y-1">
                    {results.errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}