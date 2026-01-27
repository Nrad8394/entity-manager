"use client";

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { ApiClient } from '../../composition/api/types';
import { BaseEntity } from '../../primitives/types';
import { CheckCircle2, XCircle, AlertCircle, Upload, FileSpreadsheet, Eye, Download } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export interface EntityImporterProps<T extends BaseEntity = BaseEntity> {
  apiClient: ApiClient<T> | undefined;
  open: boolean;
  onClose: () => void;
  onImported?: (summary: { imported: number; errors: string[] } | null) => void;
  entityName?: string;
}

type ImportStep = 'upload' | 'preview' | 'importing' | 'result';

interface PreviewResult {
  row: number;
  data: any;
  status: 'success' | 'error' | 'pending';
  errors?: any;
}

export function EntityImporter<T extends BaseEntity = BaseEntity>({ 
  apiClient, 
  open, 
  onClose, 
  onImported, 
  entityName = 'Data' 
}: EntityImporterProps<T>) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<ImportStep>('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewData, setPreviewData] = useState<{ 
    results: PreviewResult[]; 
    total_rows: number; 
    errors: string[] 
  } | null>(null);
  const [importResult, setImportResult] = useState<{ 
    imported: number; 
    errors: string[] 
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = () => {
    setFile(null);
    setStep('upload');
    setPreviewData(null);
    setImportResult(null);
    setError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (loading) {
      const confirmed = confirm('An operation is in progress. Are you sure you want to cancel?');
      if (!confirmed) return;
    }
    resetState();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (f.size > maxSize) {
        setError('File size exceeds 10MB limit. Please upload a smaller file.');
        setFile(null);
        return;
      }
      setFile(f);
      setError(null);
      toast.success(`File "${f.name}" selected`);
    } else {
      setFile(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) {
      const validTypes = [
        'text/csv',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      if (!validTypes.includes(f.type) && !f.name.endsWith('.csv') && !f.name.endsWith('.xlsx')) {
        setError('Invalid file type. Please upload a CSV or Excel file.');
        return;
      }
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(f);
        fileInputRef.current.files = dataTransfer.files;
      }
      setFile(f);
      setError(null);
      toast.success(`File "${f.name}" selected`);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  // Try to parse file client-side to show immediate preview. If parsing fails, fallback to server preview.
  const parseFileToPreview = async (f: File) => {
    const maxPreviewRows = 200;

    // simple CSV parser (handles quoted fields)
    const parseCSV = (text: string) => {
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
      if (lines.length === 0) return null;
      const splitter = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/;
      const headers = lines[0].split(splitter).map(h => h.replace(/^\"|\"$/g, '').trim());
      const rows = lines.slice(1).slice(0, maxPreviewRows).map((line, idx) => {
        const cols = line.split(splitter).map(c => c.replace(/^\"|\"$/g, '').trim());
        const obj: Record<string, any> = {};
        headers.forEach((h, i) => { obj[h || `col_${i}`] = cols[i] ?? ''; });
        return { row: idx + 1, data: obj, status: 'success' as const };
      });
      return { headers, rows, total: Math.max(lines.length - 1, rows.length) };
    };

    // detect type by extension if mime is unreliable
    const name = f.name.toLowerCase();

    try {
      if (name.endsWith('.csv') || f.type === 'text/csv') {
        const text = await f.text();
        const parsed = parseCSV(text);
        if (parsed) return parsed;
      }

      // Try XLSX via dynamic import if available
      if (name.endsWith('.xlsx') || name.endsWith('.xls') || f.type.includes('spreadsheet')) {
        try {
          // dynamic import to avoid bundling if not installed
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const XLSX = await import('xlsx');
          const arrayBuffer = await f.arrayBuffer();
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, { defval: '' }) as Record<string, any>[];
          const headers = json.length > 0 ? Object.keys(json[0]) : [];
          const rows = json.slice(0, maxPreviewRows).map((r, idx) => ({ row: idx + 1, data: r, status: 'success' as const }));
          return { headers, rows, total: json.length };
        } catch (e) {
          // dynamic import failed or xlsx not available — fall through to server preview
        }
      }
    } catch (e) {
      // parsing failed — return null to indicate fallback needed
      return null;
    }

    return null;
  };

  const handlePreview = async () => {
    if (!file) {
      setError('Please select a file to preview');
      return;
    }

    setLoading(true);
    setError(null);
    setUploadProgress(20);

    // Attempt client-side parse first
    try {
      const parsed = await parseFileToPreview(file);
      if (parsed) {
        const results: PreviewResult[] = parsed.rows.map(r => ({ row: r.row, data: r.data, status: r.status }));
        setPreviewData({ results, total_rows: parsed.total, errors: [] });
        setStep('preview');
        toast.success('Preview generated locally');
        setUploadProgress(100);
        // ensure UI is not left in a loading state so Import becomes clickable
        setLoading(false);
        setUploadProgress(0);
        return;
      }
    } catch (e) {
      // continue to server preview on any parsing errors
      console.warn('Local parse failed, falling back to server preview', e);
    }

    // Fallback to server-side preview
    if (!apiClient || !apiClient.bulkImport) {
      setError('Import functionality is not available');
      setLoading(false);
      setUploadProgress(0);
      return;
    }

    try {
      const res = await apiClient.bulkImport(file, { preview: true });
      setUploadProgress(100);
      const data = res.data;

      if (data && data.preview) {
        setPreviewData({
          results: data.results || [],
          total_rows: (data as any).total_rows || data.results?.length || 0,
          errors: data.errors || []
        });
        setStep('preview');
        toast.success('Preview generated successfully');
      } else {
        if (data.errors && data.errors.length > 0) {
          setError(`Preview failed: ${data.errors.join(', ')}`);
        } else {
          setError("Invalid preview response from server");
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Preview failed');
      setError(message);
      toast.error('Failed to generate preview');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleImport = async () => {
    if (!apiClient || !apiClient.bulkImport) {
      setError('Import functionality is not available');
      return;
    }
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setLoading(true);
    setError(null);
    setStep('importing');
    setUploadProgress(20);

    // helper: wrap a promise with a timeout so UI doesn't hang indefinitely
    const withTimeout = <T,>(p: Promise<T>, ms: number) => {
      return Promise.race([
        p,
        new Promise<T>((_, rej) => setTimeout(() => rej(new Error('Import timed out')), ms))
      ]);
    };

    try {
      // Await the import but fail after 60s to avoid the UI staying stuck
      const res = await withTimeout(apiClient.bulkImport(file), 60000);
      setUploadProgress(100);
      const data = (res as any).data;

      setImportResult({
        imported: data.imported,
        errors: data.errors || []
      });
      setStep('result');
      onImported?.(data);
      
      if (data.imported > 0) {
        toast.success(`Successfully imported ${data.imported} records`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err ?? 'Import failed');
      setError(message);
      toast.error('Import failed');
      setStep('preview'); // Go back to preview on error (including timeout)
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const cancelImport = () => {
    if (!loading) return;
    setLoading(false);
    setUploadProgress(0);
    setStep('preview');
    toast.info('Import cancelled');
  };

  const handleDownloadTemplate = async (format: 'csv' | 'xlsx') => {
    if (!apiClient || !apiClient.bulkImportTemplate) {
      toast.error('Template download is not available');
      return;
    }

    try {
      toast.info('Generating template...');
      const blob = await apiClient.bulkImportTemplate(format);
      const ext = format === 'csv' ? 'csv' : 'xlsx';
      const baseName = entityName
        ? `${entityName}_Import_Template`
        : ((apiClient as any).__endpoint?.replace(/\//g, '_') || 'template');
      const fname = `${baseName}.${ext}`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Template downloaded successfully');
    } catch (err) {
      toast.error('Failed to download template');
    }
  };

  // Format cell values for display: pretty-print objects and format ISO datetimes
  const formatCellValue = (val: any) => {
    if (val === null || val === undefined) return '';
    if (typeof val === 'object') return JSON.stringify(val);
    const s = String(val);
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
    if (isoRegex.test(s)) {
      const d = new Date(s);
      if (!isNaN(d.getTime())) {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      }
    }
    return s;
  };

  const renderUploadStep = () => (
    <div className="space-y-6">
      <div 
        className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-accent/50 hover:border-primary/50 transition-all cursor-pointer relative group"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
          onChange={handleFileChange}
          className="hidden"
        />
        
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">
          {file ? file.name : 'Choose a file or drag it here'}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4">
          {file 
            ? `${(file.size / 1024).toFixed(1)} KB • Click to change file`
            : `Upload a CSV or Excel file to import ${entityName}`
          }
        </p>
        
        {file && (
          <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            File ready for preview
          </div>
        )}
      </div>

      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-3 text-center">Need a template?</p>
          <div className="flex gap-3 justify-center">
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={() => handleDownloadTemplate('csv')} 
            disabled={!apiClient}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            CSV Template
          </Button>
          <Button 
            type="button"
            variant="outline" 
            size="sm" 
            onClick={() => handleDownloadTemplate('xlsx')} 
            disabled={!apiClient}
            className="flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel Template
          </Button>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => {
    if (!previewData) return null;

    // derive headers from first row data
    const first = previewData.results[0];
    const headers: string[] = first && first.data && typeof first.data === 'object'
      ? Object.keys(first.data)
      : [];

    // limit columns to avoid extremely wide tables
    const maxCols = 50;
    const visibleHeaders = headers.slice(0, maxCols);

    return (
      <div className="space-y-4">
        <div className="border rounded-lg overflow-auto">
          <div className="bg-muted px-4 py-2 border-b">
            <h4 className="text-sm font-semibold">Data Preview</h4>
          </div>
          <ScrollArea className="h-[320px] overflow-auto">
            <div className="min-w-max">
            <Table className="min-w-max w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Row</TableHead>
                  {visibleHeaders.map((h) => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.results.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.row}</TableCell>
                    {visibleHeaders.map((h) => {
                      const val = row.data?.[h];
                      const display = formatCellValue(val);
                      return (
                        <TableCell key={h} className="text-xs break-words">{display}</TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </ScrollArea>
        </div>
      </div>
    );
  };

  const renderImportingStep = () => (
    <div className="space-y-6 py-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 animate-pulse">
          <Upload className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Importing Data...</h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we process your file
          </p>
        </div>
        <div className="max-w-md mx-auto">
          <Progress value={uploadProgress} className="h-2" />
        </div>
      </div>
    </div>
  );

  const renderResultStep = () => {
    if (!importResult) return null;
    const hasErrors = importResult.errors.length > 0;
    
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-3">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
            hasErrors ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
          }`}>
            {hasErrors ? (
              <AlertCircle className="w-10 h-10" />
            ) : (
              <CheckCircle2 className="w-10 h-10" />
            )}
          </div>
          <h3 className="text-2xl font-bold">
            {hasErrors ? 'Import Completed with Warnings' : 'Import Successful!'}
          </h3>
          <div className="bg-muted rounded-lg p-4 inline-block">
            <p className="text-sm text-muted-foreground mb-1">Successfully Imported</p>
            <p className="text-4xl font-bold text-green-600">{importResult.imported}</p>
            <p className="text-sm text-muted-foreground mt-1">
              record{importResult.imported !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {hasErrors && (
          <div className="border border-destructive/20 rounded-lg overflow-hidden">
            <div className="bg-destructive/10 px-4 py-3 border-b border-destructive/20">
              <h4 className="text-sm font-semibold text-destructive flex items-center">
                <XCircle className="w-4 h-4 mr-2" />
                Errors Encountered ({importResult.errors.length})
              </h4>
            </div>
            <ScrollArea className="h-[180px] bg-muted/30 p-4">
              <ul className="space-y-2">
                {importResult.errors.map((e, i) => (
                  <li key={i} className="text-sm text-destructive bg-background rounded p-2 border border-destructive/20">
                    {e}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 'upload' && (
              <>
                <Upload className="w-5 h-5" />
                Import {entityName}
              </>
            )}
            {step === 'preview' && (
              <>
                <Eye className="w-5 h-5" />
                Preview Import
              </>
            )}
            {step === 'importing' && (
              <>
                <Upload className="w-5 h-5 animate-pulse" />
                Importing...
              </>
            )}
            {step === 'result' && (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Import Complete
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Select a CSV or Excel file to begin the import process.'}
            {step === 'preview' && 'Review the data validation results before importing.'}
            {step === 'importing' && 'Processing your data. This may take a few moments.'}
            {step === 'result' && 'Your data has been imported successfully.'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-lg flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex-1 overflow-auto py-2">
          {step === 'upload' && renderUploadStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'importing' && renderImportingStep()}
          {step === 'result' && renderResultStep()}
        </div>

        <DialogFooter className="gap-2">
          {step === 'importing' && (
            <>
              <Button type="button" variant="outline" onClick={cancelImport}>
                Cancel Import
              </Button>
            </>
          )}
          {step === 'upload' && (
            <>
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button 
                type="button"
                variant="secondary" 
                onClick={handlePreview} 
                disabled={!file || loading}
                className="flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                {loading ? 'Analyzing...' : 'Preview'}
              </Button>
            </>
          )}
          {step === 'preview' && (
            <>
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setStep('upload')} 
                disabled={loading}
              >
                Back
              </Button>
              <Button 
                type="button"
                onClick={handleImport} 
                disabled={loading || !previewData || previewData.results.filter(r => r.status === 'success').length === 0}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Importing...' : `Import ${previewData?.results.filter(r => r.status === 'success').length || 0} Row(s)`}
              </Button>
            </>
          )}
          {step === 'result' && (
            <>
              <Button type="button" variant="outline" onClick={resetState}>
                Import Another File
              </Button>
              <Button type="button" onClick={handleClose}>
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EntityImporter;