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
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center gap-3 mb-2">
          <Upload className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Contact Acquisition</h1>
        </div>
        <p className="text-lg text-gray-600">
          Upload customer data and automatically enroll qualified contacts in campaigns.
        </p>
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
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
            <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 transition-colors">
              <div
                {...getRootProps()}
                className={`p-12 text-center cursor-pointer ${
                  isDragActive ? 'bg-blue-50' : ''
                }`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-16 w-16 text-gray-400 mb-6" />
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">
                  {isDragActive ? 'Drop your CSV file here' : 'Upload Customer Data'}
                </h3>
                <p className="text-gray-600 text-lg mb-4">
                  Drag and drop your CSV file or click to browse
                </p>
                <div className="flex justify-center">
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Select CSV File
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* File Selected */}
          {uploadState === 'selected' && selectedFile && (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FileText className="h-12 w-12 text-blue-500 mr-4" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedFile.name}</h3>
                    <p className="text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Ready to process
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetUpload}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">Processing Preview</h4>
                <p className="text-blue-800 text-sm">
                  This file will be filtered for female customers, deduplicated against existing contacts,
                  and new contacts will be enrolled in the active campaign.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={resetUpload}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={processUpload}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Processing
                </button>
              </div>
            </div>
          )}

          {/* Processing */}
          {uploadState === 'processing' && (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mr-4" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Processing Upload</h3>
                  <p className="text-gray-600">Applying filters and validating contacts...</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {processingSteps.map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center ${
                      step.completed ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      {step.completed ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${step.completed ? 'text-green-900' : 'text-blue-900'}`}>
                        {step.stage}
                      </p>
                      <p className="text-sm text-gray-600">{step.description}</p>
                      {step.count !== undefined && (
                        <p className="text-sm font-medium text-gray-900 mt-1">
                          {step.count} contacts qualified
                        </p>
                      )}
                      {step.details && step.details.length > 0 && (
                        <ul className="mt-2 text-sm text-gray-500 space-y-1">
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
            <div className="bg-red-50 rounded-xl border border-red-200 p-8">
              <div className="flex items-center mb-4">
                <XCircle className="h-12 w-12 text-red-500 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold text-red-900">Upload Failed</h3>
                  <p className="text-red-700">{errorMessage}</p>
                </div>
              </div>
              
              <button
                onClick={resetUpload}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Success Results */}
          {uploadState === 'complete' && results && (
            <div className="bg-white rounded-xl border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <CheckCircle className="h-12 w-12 text-green-500 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Upload Complete!</h3>
                  <p className="text-green-700 text-lg">
                    {results.inserted.newContacts} new contacts added and enrolled in campaign
                  </p>
                </div>
              </div>
              
              {/* Key Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{results.totalRows}</div>
                  <div className="text-sm text-gray-600">Total Rows</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{results.inserted.newContacts}</div>
                  <div className="text-sm text-gray-600">New Contacts</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{totalFiltered}</div>
                  <div className="text-sm text-gray-600">Filtered Out</div>
                </div>
              </div>
              
              <button
                onClick={resetUpload}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Upload Another File
              </button>
            </div>
          )}
        </div>

        {/* Right Column - Info & Results */}
        <div className="space-y-6">
          
          {/* Filtering Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5 text-blue-600" />
              Smart Filtering
            </h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div>• Email validation & junk detection</div>
              <div>• Blocked domains (competitors)</div>
              <div>• Male name filtering (500+ names)</div>
              <div>• Geographic area code blocking</div>
              <div>• Duplicate contact detection</div>
              <div>• Campaign enrollment checking</div>
            </div>
          </div>

          {/* File Format Guide */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Supported Formats</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <div><strong>Shopify Exports:</strong> Customer data with all standard fields</div>
              <div><strong>Standard CSV:</strong> Email, First Name, Last Name, Phone columns</div>
              <div><strong>Delimiter:</strong> Auto-detects commas or tabs</div>
              <div><strong>Encoding:</strong> UTF-8, handles special characters</div>
            </div>
          </div>

          {/* Detailed Results */}
          {uploadState === 'complete' && results && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Filtering Breakdown</h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Invalid emails</span>
                  <span className="font-medium text-red-600">{results.filtered.invalidEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blocked domains</span>
                  <span className="font-medium text-red-600">{results.filtered.blockedDomain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blocked names</span>
                  <span className="font-medium text-red-600">{results.filtered.blockedName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Male names</span>
                  <span className="font-medium text-red-600">{results.filtered.maleNames}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Blocked area codes</span>
                  <span className="font-medium text-red-600">{results.filtered.blockedAreaCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CSV duplicates</span>
                  <span className="font-medium text-yellow-600">{results.filtered.duplicateInCSV}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Database duplicates</span>
                  <span className="font-medium text-yellow-600">{results.filtered.duplicateInDB}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Already in campaign</span>
                  <span className="font-medium text-blue-600">{results.filtered.alreadyInCampaign}</span>
                </div>
              </div>
              
              {results.errors.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-800 font-medium text-sm mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
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