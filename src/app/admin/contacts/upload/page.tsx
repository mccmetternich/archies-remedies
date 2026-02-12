'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

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

type UploadState = 'empty' | 'selected' | 'processing' | 'complete' | 'error';

export default function ContactUploadPage() {
  const [uploadState, setUploadState] = useState<UploadState>('empty');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [results, setResults] = useState<UploadResults | null>(null);
  const [currentStage, setCurrentStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file);
      setUploadState('selected');
      setResults(null);
      setErrorMessage('');
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

  const processUpload = async () => {
    if (!selectedFile) return;

    setUploadState('processing');
    setCurrentStage('Uploading file...');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      setCurrentStage('Parsing CSV...');
      
      const response = await fetch('/api/admin/contacts/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      setCurrentStage('Processing complete!');
      const data = await response.json();
      setResults(data.results);
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
    setCurrentStage('');
  };

  const totalFiltered = results ? Object.values(results.filtered).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">CSV Contact Upload</h1>
        <p className="mt-2 text-gray-600">
          Upload Shopify customer exports or any CSV with contact data. 
          New contacts will be auto-enrolled in the active campaign.
        </p>
      </div>

      {/* Upload Zone */}
      {uploadState === 'empty' && (
        <div className="w-full">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isDragActive ? 'Drop CSV file here' : 'Upload CSV file'}
            </h3>
            <p className="text-gray-600">
              Drag and drop your CSV file here, or click to select
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Supports Shopify customer exports and standard contact CSVs
            </p>
          </div>
        </div>
      )}

      {/* File Selected */}
      {uploadState === 'selected' && selectedFile && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">{selectedFile.name}</h3>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              onClick={resetUpload}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={resetUpload}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={processUpload}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Process Upload
            </button>
          </div>
        </div>
      )}

      {/* Processing */}
      {uploadState === 'processing' && (
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Processing Upload</h3>
              <p className="text-sm text-gray-600">{currentStage}</p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Parsing CSV...</span>
              <span>✓</span>
            </div>
            <div className="flex justify-between">
              <span>Applying filters...</span>
              <span>⏳</span>
            </div>
            <div className="flex justify-between">
              <span>Checking duplicates...</span>
              <span>⏳</span>
            </div>
            <div className="flex justify-between">
              <span>Inserting contacts...</span>
              <span>⏳</span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {uploadState === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <XCircle className="h-8 w-8 text-red-500 mr-3" />
            <div>
              <h3 className="font-medium text-red-900">Upload Failed</h3>
              <p className="text-red-700">{errorMessage}</p>
            </div>
          </div>
          
          <button
            onClick={resetUpload}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {uploadState === 'complete' && results && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white border rounded-lg p-6">
            <div className="flex items-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
              <div>
                <h3 className="font-medium text-gray-900">Upload Complete</h3>
                <p className="text-green-700">
                  {results.inserted.newContacts} new contacts added and enrolled in campaign
                </p>
              </div>
            </div>
            
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Upload Another File
            </button>
          </div>

          {/* Detailed Breakdown */}
          <div className="bg-white border rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-4">Filtering Breakdown</h4>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Invalid email addresses</span>
                <span className="font-medium">{results.filtered.invalidEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blocked domains</span>
                <span className="font-medium">{results.filtered.blockedDomain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blocked names</span>
                <span className="font-medium">{results.filtered.blockedName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Male first names</span>
                <span className="font-medium">{results.filtered.maleNames}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Blocked area codes</span>
                <span className="font-medium">{results.filtered.blockedAreaCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Duplicates within CSV</span>
                <span className="font-medium">{results.filtered.duplicateInCSV}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Already in database</span>
                <span className="font-medium">{results.filtered.duplicateInDB}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Already in campaign</span>
                <span className="font-medium">{results.filtered.alreadyInCampaign}</span>
              </div>
            </div>
          </div>

          {/* Errors */}
          {results.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                <h4 className="font-medium text-yellow-900">Warnings</h4>
              </div>
              <ul className="space-y-1 text-sm text-yellow-800">
                {results.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}