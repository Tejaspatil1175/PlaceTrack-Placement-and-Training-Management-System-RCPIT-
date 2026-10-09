import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { bulkUploadStudentsApi, downloadTemplateApi } from '../../api/students';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Info,
  Check,
  FileCheck,
  RotateCcw,
  FileText,
  Trash2,
} from 'lucide-react';

export function StudentImportPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [file, setFile] = useState(null);
  const [isDelta, setIsDelta] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const handleProcessFile = (selected) => {
    if (!selected) return;
    if (!selected.name.endsWith('.xlsx') && !selected.name.endsWith('.xls')) {
      setUploadError('Invalid file format. Please upload a valid Microsoft Excel sheet (.xlsx or .xls).');
      return;
    }
    setFile(selected);
    setUploadError('');
    setCurrentStep(2);
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    handleProcessFile(selected);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const selected = e.dataTransfer.files?.[0];
    handleProcessFile(selected);
  };

  const handlePreviewValidation = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (isDelta) {
        formData.append('isDelta', 'true');
      }

      const res = await bulkUploadStudentsApi(formData, isDelta);
      setUploadResult(res);
      setCurrentStep(3);
    } catch (err) {
      console.warn('Upload backend attempt error:', err?.response?.data || err);
      const data = err?.response?.data;
      let errMsg = data?.message || data?.error || err.message || 'Upload failed. Please check Excel headers and data format.';
      
      if (data?.details?.error) {
        errMsg = data.details.error;
      } else if (data?.details?.missingHeaders?.length) {
        errMsg = `Missing required column headers: [${data.details.missingHeaders.slice(0, 5).join(', ')}${data.details.missingHeaders.length > 5 ? '...' : ''}]`;
      } else if (data?.details?.unknownHeaders?.length) {
        errMsg = `Unrecognized column headers found: [${data.details.unknownHeaders.join(', ')}]`;
      }

      setUploadError(errMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = () => {
    setCurrentStep(4);
    setTimeout(() => {
      navigate('/upload-logs');
    }, 1200);
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await downloadTemplateApi();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'PlaceTrack_Student_Template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      console.error('Failed to download official template:', err);
    }
  };

  // Extract result payload
  const resultData = uploadResult?.data || uploadResult || {};
  const totalRows = resultData.totalRows ?? 0;
  const successCount = resultData.successCount ?? 0;
  const errorCount = resultData.errorCount ?? 0;
  const errorsList = resultData.errors || [];
  const processedStudents = resultData.processedStudents || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-accent-500/10 text-accent-500 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Bulk Excel Student Data Import
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              Upload multi-semester academic spreadsheets following the PlaceTrack 44-column Data Contract.
            </p>
          </div>
        </div>
      </div>

      {/* Partial Semester Update Callout Box */}
      <div className="p-4 bg-info-100 border border-info-600/30 rounded-xl flex items-start space-x-3">
        <Info className="w-5 h-5 text-info-600 shrink-0 mt-0.5" />
        <div className="text-xs text-text-primary">
          <span className="font-bold block text-info-600 uppercase tracking-wider mb-0.5">
            Partial Semester Updates Supported
          </span>
          You don't need to re-upload existing student data to add newly released semester results. The PlaceTrack engine automatically merges newly specified semester blocks and recalculates credit-weighted CGPA & active backlogs in real time.
        </div>
      </div>

      {/* 4-Step Stepper Header */}
      <div className="grid grid-cols-4 gap-2 bg-bg-surface p-4 border border-border-subtle rounded-xl shadow-2xs text-center text-xs">
        {[
          { step: 1, label: '1. Download Template' },
          { step: 2, label: '2. Select Excel File' },
          { step: 3, label: '3. Validate Preview' },
          { step: 4, label: '4. Confirm Import' },
        ].map((s) => (
          <div
            key={s.step}
            className={`py-2 px-3 rounded-lg font-semibold transition-all ${
              currentStep === s.step
                ? 'bg-primary-900 text-white font-bold shadow-xs'
                : currentStep > s.step
                ? 'bg-success-100 text-success-600 border border-success-600/20'
                : 'bg-bg-base text-text-muted border border-border-subtle'
            }`}
          >
            {s.label}
          </div>
        ))}
      </div>

      {/* Stepper Step Content Cards */}
      <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 sm:p-8 shadow-2xs space-y-6">
        {/* Step 1: Download Template */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
          <div>
            <h3 className="font-heading text-sm font-semibold text-text-primary">
              Step 1: Download Standard Template
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              Download the official Excel sheet formatted with 12 basic student headers and 32 semester academic blocks.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-4 py-2 bg-primary-700 hover:bg-primary-900 text-white font-heading text-xs font-semibold rounded-lg inline-flex items-center space-x-2 shrink-0 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel Template (.xlsx)</span>
          </button>
        </div>

        {/* Step 2: File Upload Zone */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-heading text-sm font-semibold text-text-primary">
              Step 2: Upload Completed Excel File (.xlsx / .xls)
            </h3>
            <label className="flex items-center space-x-2 text-xs text-text-secondary cursor-pointer">
              <input
                type="checkbox"
                checked={isDelta}
                onChange={(e) => setIsDelta(e.target.checked)}
                className="rounded border-border-subtle text-primary-900 focus:ring-primary-500"
              />
              <span className="font-semibold">Delta Update Mode (Upsert new semester marks only)</span>
            </label>
          </div>

          {uploadError && (
            <div className="p-3 mb-4 bg-error-100 border border-error-600/30 text-error-600 text-xs rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            id="excelUploadInput"
            accept=".xlsx, .xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          {!file ? (
            /* Dropzone when no file is selected */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary-500 bg-primary-100/30'
                  : 'border-border-subtle hover:border-primary-500 hover:bg-bg-base/70 bg-bg-base'
              }`}
            >
              <UploadCloud className="w-12 h-12 text-primary-500 mx-auto mb-3" />
              <p className="font-heading font-bold text-sm text-text-primary mb-1">
                Drag & drop your Excel file here, or{' '}
                <span className="text-primary-600 underline">browse your device</span>
              </p>
              <p className="text-xs text-text-muted mb-4">
                Supports Microsoft Excel (.xlsx, .xls) up to 10MB
              </p>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="px-4 py-2 bg-primary-900 hover:bg-primary-700 text-white font-heading font-semibold text-xs rounded-lg shadow-sm inline-flex items-center space-x-2 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Select Excel File (.xlsx)</span>
              </button>
            </div>
          ) : (
            /* Selected File Card */
            <div className="p-4 bg-primary-100/20 border border-primary-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-primary-900 text-white flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5 text-accent-500" />
                </div>
                <div>
                  <p className="font-heading font-bold text-sm text-primary-900">{file.name}</p>
                  <p className="text-xs text-text-muted">
                    {(file.size / 1024).toFixed(1)} KB • Ready for schema verification
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-bg-surface hover:bg-bg-base border border-border-subtle text-text-primary text-xs font-semibold rounded-lg transition-colors"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setUploadResult(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1.5 text-error-600 hover:bg-error-100 rounded-lg transition-colors"
                  title="Remove selected file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {file && currentStep < 3 && (
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handlePreviewValidation}
                disabled={isUploading}
                className="px-6 py-2.5 bg-primary-900 hover:bg-primary-700 text-white font-heading font-semibold text-xs rounded-lg inline-flex items-center space-x-2 shadow-sm disabled:opacity-50 transition-all"
              >
                {isUploading ? (
                  <span>Parsing & Validating Sheet...</span>
                ) : (
                  <>
                    <span>Preview & Validate Rows</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step 3: Validation Preview Table */}
      {currentStep >= 3 && uploadResult && (
        <div className="bg-bg-surface border border-border-subtle rounded-xl p-6 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
            <div>
              <h3 className="font-heading text-sm font-semibold text-text-primary">
                Step 3: Ingestion Validation Preview
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Per-row verification results from backend transaction check.
              </p>
            </div>

            {/* Summary Pill */}
            <div className="inline-flex items-center space-x-3 px-3.5 py-1.5 bg-bg-base border border-border-subtle rounded-lg text-xs font-mono">
              <span className="text-success-600 font-bold">
                ✓ {successCount} Processed
              </span>
              <span className="text-text-muted">•</span>
              <span className="text-error-600 font-bold">
                ✕ {errorCount} Errors
              </span>
            </div>
          </div>

          {/* Validation Rows Table */}
          <div className="overflow-x-auto border border-border-subtle rounded-lg max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase sticky top-0">
                  <th className="py-2.5 px-3">Row</th>
                  <th className="py-2.5 px-3">PRN</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Details / Validation Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-primary">
                {errorsList.map((err, idx) => (
                  <tr key={`err-${idx}`} className="bg-error-100/20 hover:bg-error-100/30">
                    <td className="py-2.5 px-3 font-mono text-text-muted">Row {err.row || err.rowNumber || idx + 2}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-error-600">{err.prn || 'N/A'}</td>
                    <td className="py-2.5 px-3 font-medium">{err.name || err.studentName || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-error-100 text-error-600">
                        Error
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-error-600 font-medium">
                      {err.reason || err.error || err.message || 'Validation error'}
                    </td>
                  </tr>
                ))}

                {processedStudents.map((stud, idx) => (
                  <tr key={`ok-${idx}`} className="hover:bg-bg-base">
                    <td className="py-2.5 px-3 font-mono text-text-muted">Row {stud.row || idx + 2}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-primary-900">{stud.prn}</td>
                    <td className="py-2.5 px-3 font-medium">{stud.name}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-success-100 text-success-600">
                        Success
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-text-secondary">
                      {stud.action === 'updated' ? 'Semester marks merged & CGPA updated' : 'Student record created successfully'}
                    </td>
                  </tr>
                ))}

                {errorsList.length === 0 && processedStudents.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-text-muted text-xs">
                      {uploadResult.message || 'File parsed and validated successfully.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Step 4 Action */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setUploadResult(null);
                setCurrentStep(1);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="px-4 py-2 text-xs font-semibold text-text-secondary hover:text-text-primary border border-border-subtle rounded-lg flex items-center space-x-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Cancel / Re-upload</span>
            </button>

            <button
              type="button"
              onClick={handleConfirmImport}
              disabled={currentStep === 4}
              className="px-6 py-2.5 bg-success-600 hover:bg-success-600/90 text-white font-heading font-semibold text-xs rounded-lg shadow-sm inline-flex items-center space-x-2 transition-all disabled:opacity-60"
            >
              {currentStep === 4 ? (
                <span>Redirecting to Audit Logs...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>View Upload Audit Logs</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
