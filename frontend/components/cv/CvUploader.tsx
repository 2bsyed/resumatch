'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import PulseBar from '../ui/PulseBar';

interface CvUploaderProps {
  onParseSubmit: (file: File | null, pastedText: string) => Promise<void>;
  isLoading: boolean;
}

export default function CvUploader({ onParseSubmit, isLoading }: CvUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setPastedText(''); // Clear pasted text if file is uploaded
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
    disabled: isLoading,
  });

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPastedText(e.target.value);
    if (file) setFile(null); // Clear file if user starts pasting text
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !pastedText.trim()) return;
    onParseSubmit(file, pastedText);
  };

  const isSubmitDisabled = (!file && !pastedText.trim()) || isLoading;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full">
      {/* 1. Upload Zone */}
      <div 
        {...getRootProps()} 
        className={`
          h-[240px] 
          border-2 
          border-dashed 
          rounded-xl 
          flex 
          flex-col 
          items-center 
          justify-center 
          cursor-pointer 
          transition-all 
          group
          bg-surface-container-lowest
          ${
            isDragActive 
              ? 'border-primary bg-surface-container-low scale-[1.01]' 
              : 'border-outline-variant hover:border-primary hover:bg-surface-container-low'
          }
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center p-6 text-center">
          {file ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#1C2333] flex items-center justify-center border border-[#374151]">
                <span className="material-symbols-outlined text-[#10B981] text-[24px]">
                  check_circle
                </span>
              </div>
              <p className="text-white text-sm font-semibold max-w-[280px] truncate">
                {file.name}
              </p>
              <p className="text-[12px] text-[#9CA3AF] font-mono">
                {formatFileSize(file.size)}
              </p>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="mt-2 text-xs text-error font-mono uppercase hover:underline tracking-wider font-semibold cursor-pointer"
              >
                [ Remove File ]
              </button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-[#1C2333] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-[#4F8EF7] text-[24px]">
                  upload_file
                </span>
              </div>
              <h3 className="font-heading font-semibold text-[18px] text-white mb-1">
                {isDragActive ? 'Drop your CV here' : 'Drop your CV here'}
              </h3>
              <p className="font-sans text-[13px] text-[#9CA3AF] mb-3">
                PDF, DOCX, or TXT · Max 5MB
              </p>
              <span className="font-mono text-label-mono text-[12px] text-[#4F8EF7] uppercase tracking-wider font-semibold">
                or browse files
              </span>
            </>
          )}
        </div>
      </div>

      {/* 2. Divider */}
      <div className="flex items-center gap-4 w-full select-none">
        <div className="flex-1 h-[1px] bg-[#374151]"></div>
        <span className="font-mono text-[14px] text-[#4B5563] uppercase">or</span>
        <div className="flex-1 h-[1px] bg-[#374151]"></div>
      </div>

      {/* 3. Paste Text */}
      <div className="flex flex-col gap-2">
        <label className="font-mono text-label-mono text-[#9CA3AF] uppercase tracking-wider">
          Paste your CV as text
        </label>
        <div className="relative">
          <textarea 
            value={pastedText}
            onChange={handleTextareaChange}
            disabled={isLoading}
            className="w-full bg-[#0F1623] border border-[#374151] rounded-[8px] p-4 text-white font-sans text-sm focus:border-[#4F8EF7] focus:ring-0 resize-none h-[180px] placeholder-[#4B5563] disabled:opacity-50" 
            placeholder="Paste your resume text here... e.g.&#10;John Doe&#10;Software Engineer&#10;EXPERIENCE:&#10;- Built web apps using React & TypeScript..."
          ></textarea>
          <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#4B5563]">
            {pastedText.length} chars
          </div>
        </div>
      </div>

      {/* 4. Submit and loading bar */}
      <div className="flex flex-col items-center gap-4 mt-2">
        {/* Animated slide bar indicator when parsing */}
        <PulseBar isActive={isLoading} className="w-full" />

        <button 
          className="w-full py-4 bg-[#4F8EF7] text-white font-mono text-data-mono uppercase rounded-[6px] font-bold primary-glow transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer" 
          type="submit"
          disabled={isSubmitDisabled}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Parsing CV...
            </>
          ) : (
            <>
              Parse My CV with AI
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </>
          )}
        </button>
        <p className="font-sans text-[13px] text-[#9CA3AF] flex items-center gap-1">
          <span>⚡</span> Takes about 15–30 seconds · Powered by Gemini
        </p>
      </div>
    </form>
  );
}
