'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertTriangle, Filter, Users, Mail } from 'lucide-react';

interface UploadResults {
  totalRows: number;
  filtered: {
    invalidEmail: number;
    blockedDomain: number;
    blockedName: number;
    maleNames: number;
    blockedAreaCode: number;
    duplicateInCSV: number;
    duplicateInDB: number;
    alreadyInCampaign: number;
  };
  inserted: {
    newContacts: number;
    campaignEnrollments: number;
  };
  errors: string[];
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
        'Filtering Complete', 
        `Processed ${data.results.totalRows} rows, filtered out ${totalFiltered} contacts`,
        data.results.inserted.newContacts,
        [
          `Invalid emails: ${data.results.filtered.invalidEmail}`,
          `Blocked domains: ${data.results.filtered.blockedDomain}`,
          `Blocked names: ${data.results.filtered.blockedName}`,
          `Male names: ${data.results.filtered.maleNames}`,
          `Blocked area codes: ${data.results.filtered.blockedAreaCode}`,
          `CSV duplicates: ${data.results.filtered.duplicateInCSV}`,
          `Database duplicates: ${data.results.filtered.duplicateInDB}`,
          `Already in campaign: ${data.results.filtered.alreadyInCampaign}`
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
          Upload customer data and automatically enroll qualified contacts in campaigns.
        </p>
        <div className="mt-4 flex items-center gap-6 text-sm text-[var(--admin-text-secondary)]">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>Advanced filtering for female customers</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Auto-enrollment in active campaigns</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Supports Shopify & standard CSV formats</span>
          </div>
        </div>
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
                <p className="text-[var(--admin-text-secondary)] text-sm leading-relaxed">
                  This file will be filtered for female customers, deduplicated against existing contacts,
                  and new contacts will be enrolled in the active campaign.
                </p>
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
                  <h3 className="text-lg font-semibold text-[var(--admin-text-primary)]">Upload Complete!</h3>
                  <p className="text-green-400">
                    {results.inserted.newContacts} new contacts added and enrolled in campaign
                  </p>
                </div>
              </div>
              
              {/* Key Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-[var(--admin-hover)] rounded-xl p-4 text-center border border-[var(--admin-border)]">
                  <div className="text-2xl font-bold text-[var(--admin-text-primary)]">{results.totalRows}</div>
                  <div className="text-sm text-[var(--admin-text-secondary)]">Total Rows</div>
                </div>
                <div className="bg-green-500/10 rounded-xl p-4 text-center border border-green-500/20">
                  <div className="text-2xl font-bold text-green-400">{results.inserted.newContacts}</div>
                  <div className="text-sm text-[var(--admin-text-secondary)]">New Contacts</div>
                </div>
                <div className="bg-yellow-500/10 rounded-xl p-4 text-center border border-yellow-500/20">
                  <div className="text-2xl font-bold text-yellow-400">{totalFiltered}</div>
                  <div className="text-sm text-[var(--admin-text-secondary)]">Filtered Out</div>
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
              <div>• Email validation & junk detection</div>
              <div>• Blocked domains (competitors)</div>
              <div>• Male name filtering (500+ names)</div>
              <div>• Geographic area code blocking</div>
              <div>• Duplicate contact detection</div>
              <div>• Campaign enrollment checking</div>
            </div>
          </div>

          {/* File Format Guide */}
          <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
            <h4 className="font-semibold text-[var(--admin-text-primary)] mb-4">Supported Formats</h4>
            <div className="space-y-3 text-sm text-[var(--admin-text-secondary)] leading-relaxed">
              <div><span className="text-[var(--admin-text-primary)] font-medium">Shopify Exports:</span> Customer data with all standard fields</div>
              <div><span className="text-[var(--admin-text-primary)] font-medium">Standard CSV:</span> Email, First Name, Last Name, Phone columns</div>
              <div><span className="text-[var(--admin-text-primary)] font-medium">Delimiter:</span> Auto-detects commas or tabs</div>
              <div><span className="text-[var(--admin-text-primary)] font-medium">Encoding:</span> UTF-8, handles special characters</div>
            </div>
          </div>

          {/* Detailed Results */}
          {uploadState === 'complete' && results && (
            <div className="bg-[var(--admin-card)] rounded-xl border border-[var(--admin-border)] p-6">
              <h4 className="font-semibold text-[var(--admin-text-primary)] mb-4">Filtering Breakdown</h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Invalid emails</span>
                  <span className="font-medium text-red-400">{results.filtered.invalidEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Blocked domains</span>
                  <span className="font-medium text-red-400">{results.filtered.blockedDomain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Blocked names</span>
                  <span className="font-medium text-red-400">{results.filtered.blockedName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Male names</span>
                  <span className="font-medium text-red-400">{results.filtered.maleNames}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Blocked area codes</span>
                  <span className="font-medium text-red-400">{results.filtered.blockedAreaCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">CSV duplicates</span>
                  <span className="font-medium text-yellow-400">{results.filtered.duplicateInCSV}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Database duplicates</span>
                  <span className="font-medium text-yellow-400">{results.filtered.duplicateInDB}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--admin-text-secondary)]">Already in campaign</span>
                  <span className="font-medium text-[var(--primary)]">{results.filtered.alreadyInCampaign}</span>
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