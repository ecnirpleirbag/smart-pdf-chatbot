import React, { useCallback } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    loading: boolean;
    error: string | null;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, loading, error }) => {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onFileSelect(acceptedFiles[0]);
        }
    }, [onFileSelect]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        disabled: loading
    });

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={`bg-white/5 backdrop-blur-sm rounded-2xl p-8 border-2 border-dashed transition-all duration-200
                    ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20'}
                    ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <input {...getInputProps()} />
                <div className="text-center">
                    <div className="mb-6">
                        {loading ? (
                            <Loader2 className="w-16 h-16 mx-auto text-blue-400 mb-4 animate-spin" />
                        ) : (
                            <FileText className="w-16 h-16 mx-auto text-blue-400 mb-4" />
                        )}
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {loading ? 'Processing PDF...' : 'Upload Your PDF'}
                        </h2>
                        <p className="text-white/60">
                            {isDragActive
                                ? 'Drop your PDF here'
                                : 'Drag and drop your PDF file here, or click to select'}
                        </p>
                    </div>

                    {!loading && (
                        <button
                            type="button"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                            <Upload size={20} />
                            Choose PDF File
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                    {error}
                </div>
            )}
        </div>
    );
}; 