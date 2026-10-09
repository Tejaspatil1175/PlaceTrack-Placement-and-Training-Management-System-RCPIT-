import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../store/authStore';
import { getUploadLogsApi } from '../../api/students';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  History,
  FileSpreadsheet,
  Download,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
} from 'lucide-react';

export function UploadLogsPage() {
  const { user, role } = useAuth();
  const isOfficer = role === 'tpo' || role === 'officer';

  const [selectedLog, setSelectedLog] = useState(null);

  // TanStack Query to fetch live upload logs
  const { data, isLoading } = useQuery({
    queryKey: ['uploadLogs', role],
    queryFn: async () => {
      try {
        return await getUploadLogsApi();
      } catch (err) {
        return null;
      }
    },
  });

  const rawLogs = data?.data || (Array.isArray(data) ? data : []);

  const logsList = rawLogs.map((log) => {
    let parsedErrors = [];
    if (log.errorsJson) {
      if (typeof log.errorsJson === 'string') {
        try {
          parsedErrors = JSON.parse(log.errorsJson);
        } catch (e) {
          parsedErrors = [];
        }
      } else if (Array.isArray(log.errorsJson)) {
        parsedErrors = log.errorsJson;
      }
    } else if (Array.isArray(log.errorsList)) {
      parsedErrors = log.errorsList;
    }

    return {
      id: log.id,
      batchId: log.fileName || `BATCH_${log.id}`,
      uploadedBy: log.uploader?.name || log.uploadedBy || 'T&P Officer',
      department: log.department || 'College-wide',
      date: log.createdAt ? new Date(log.createdAt).toLocaleString() : (log.date || 'N/A'),
      totalRows: log.totalRows || 0,
      successCount: log.successCount || 0,
      errorCount: log.errorCount || 0,
      status: (log.errorCount || 0) === 0 ? 'Success' : 'Completed with Warnings',
      errorsList: parsedErrors,
    };
  });

  const handleDownloadErrorsCsv = (log) => {
    if (!log.errorsList || log.errorsList.length === 0) return;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'RowNumber,PRN,StudentName,ErrorReason\n' +
      log.errorsList.map((err) => `${err.row || err.rowNumber || 'N/A'},${err.prn || 'N/A'},"${err.name || err.studentName || 'N/A'}","${err.reason || err.error || err.message || 'Validation Error'}"`).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Upload_Errors_${log.batchId.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-surface p-6 rounded-xl border border-border-subtle shadow-2xs">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-900 flex items-center justify-center shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-text-primary">
              Excel Data Upload Audit Logs
            </h1>
            <p className="text-text-secondary text-sm mt-0.5">
              Audit trail of bulk student imports, row-level validation statistics, & error breakdowns.
            </p>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : logsList.length === 0 ? (
        <EmptyState
          title="No data upload logs found"
          description="Excel batch upload audit records and validation breakdowns will appear here once student data sheets are imported."
          icon={History}
        />
      ) : (
        <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Batch ID / File</th>
                  <th className="py-3 px-4">Uploaded By</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Total Rows</th>
                  <th className="py-3 px-4">Success</th>
                  <th className="py-3 px-4">Errors</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle text-text-primary">
                {logsList.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-bg-base cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-primary-900">{log.batchId}</td>
                    <td className="py-3.5 px-4 font-semibold">{log.uploadedBy}</td>
                    <td className="py-3.5 px-4 text-text-secondary">{log.department}</td>
                    <td className="py-3.5 px-4 text-text-muted">{log.date}</td>
                    <td className="py-3.5 px-4 font-mono font-medium">{log.totalRows}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-success-600">{log.successCount}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-error-600">{log.errorCount}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.errorCount === 0
                            ? 'bg-success-100 text-success-600'
                            : 'bg-warning-100 text-warning-600'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="px-2.5 py-1 bg-primary-100 text-primary-900 font-semibold rounded text-[11px] hover:bg-primary-900 hover:text-white transition-colors"
                      >
                        View Breakdown
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Row-level Error Breakdown Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-primary-900/60 backdrop-blur-xs" onClick={() => setSelectedLog(null)}></div>
          <div className="relative w-full max-w-2xl bg-bg-surface rounded-2xl shadow-2xl border border-border-subtle p-6 space-y-4 z-10">
            <div className="flex items-start justify-between border-b border-border-subtle pb-3">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-primary-100 text-primary-900">
                  {selectedLog.batchId}
                </span>
                <h3 className="font-heading text-lg font-bold text-text-primary mt-1">
                  Upload Ingestion Breakdown & Errors
                </h3>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-text-muted hover:text-text-primary p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs bg-bg-base p-3 rounded-lg border border-border-subtle font-mono">
              <div>Total: <strong>{selectedLog.totalRows}</strong></div>
              <div className="text-success-600 font-bold">Success: {selectedLog.successCount}</div>
              <div className="text-error-600 font-bold">Errors: {selectedLog.errorCount}</div>
            </div>

            {selectedLog.errorCount === 0 ? (
              <div className="p-6 text-center text-xs text-success-600 font-semibold bg-success-100/50 rounded-xl">
                ✓ All {selectedLog.totalRows} student rows imported cleanly with zero validation errors!
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading text-xs font-bold text-text-primary uppercase tracking-wider">
                    Row-level Validation Failure Reasons ({selectedLog.errorCount})
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleDownloadErrorsCsv(selectedLog)}
                    className="px-3 py-1 bg-error-100 text-error-600 hover:bg-error-600 hover:text-white font-semibold text-xs rounded inline-flex items-center space-x-1 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Errors CSV</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-border-subtle rounded-lg max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-bg-base border-b border-border-subtle text-text-muted font-bold uppercase">
                        <th className="py-2.5 px-3">Row</th>
                        <th className="py-2.5 px-3">PRN</th>
                        <th className="py-2.5 px-3">Student Name</th>
                        <th className="py-2.5 px-3">Validation Failure Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle text-text-primary">
                      {selectedLog.errorsList.map((err, idx) => (
                        <tr key={idx} className="hover:bg-bg-base">
                          <td className="py-2.5 px-3 font-mono text-text-muted">Row {err.row}</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-primary-900">{err.prn}</td>
                          <td className="py-2.5 px-3 font-medium">{err.name}</td>
                          <td className="py-2.5 px-3 text-error-600 font-semibold">{err.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
