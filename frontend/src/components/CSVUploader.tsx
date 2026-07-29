import React, { useRef, useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, CheckCircle, X, Users, AlertCircle } from 'lucide-react';

interface CSVUploaderProps {
  onEmailsExtracted: (emails: string[]) => void;
  detectedCount: number;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onEmailsExtracted, detectedCount }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv') && !file.type.includes('csv') && !file.type.includes('text/plain')) {
      setErrorMsg('Please upload a valid .csv file.');
      return;
    }

    setErrorMsg(null);
    setFileName(file.name);

    Papa.parse(file, {
      complete: (results) => {
        const textContent = JSON.stringify(results.data);
        const matches = textContent.match(EMAIL_REGEX) || [];
        const uniqueEmails = Array.from(new Set(matches.map((e) => e.toLowerCase())));

        if (uniqueEmails.length === 0) {
          setErrorMsg('No valid email addresses found in the CSV file.');
        } else {
          onEmailsExtracted(uniqueEmails);
        }
      },
      error: (err) => {
        setErrorMsg(`Failed to parse CSV: ${err.message}`);
      },
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setErrorMsg(null);
    onEmailsExtracted([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
          Upload Recipients via CSV
        </label>
        {detectedCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Users className="w-3.5 h-3.5" />
            {detectedCount} detected
          </span>
        )}
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10'
            : fileName
            ? 'border-emerald-500/40 bg-emerald-500/5'
            : 'border-slate-700/80 bg-slate-900/40 hover:border-indigo-500/50 hover:bg-slate-900/80'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />

        {fileName ? (
          <div className="flex items-center justify-between text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{fileName}</p>
                <p className="text-[11px] text-emerald-400 font-medium">
                  {detectedCount} valid recipient address{detectedCount === 1 ? '' : 'es'} imported
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Remove File"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-2">
            <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center text-indigo-400 mb-2 ring-1 ring-slate-700">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-200">
              <span className="text-indigo-400 font-semibold">Click to upload</span> or drag and drop CSV file
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Supports any CSV containing email address columns</p>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
