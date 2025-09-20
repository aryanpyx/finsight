import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface FileUploadProps {
  type: "contract" | "worklog" | "license";
  title: string;
  description: string;
  acceptedFormats: string;
  icon: React.ReactNode;
  onUpload: (file: File) => Promise<void>;
}

export function FileUpload({ 
  type, 
  title, 
  description, 
  acceptedFormats, 
  icon, 
  onUpload 
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    setError(null);
    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      await onUpload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadedFile(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: getAcceptTypes(type) as any,
  });

  function getAcceptTypes(fileType: string) {
    switch (fileType) {
      case "contract":
        return {
          "application/pdf": [".pdf"],
          "application/msword": [".doc"],
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
          "text/plain": [".txt"],
        };
      case "worklog":
        return {
          "text/csv": [".csv"],
          "application/json": [".json"],
          "text/plain": [".txt"],
        };
      case "license":
        return {
          "text/csv": [".csv"],
          "application/vnd.ms-excel": [".xls"],
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
          "application/json": [".json"],
        };
      default:
        return {};
    }
  }

  return (
    <Card className="p-6 bg-card shadow-md" data-testid={`card-upload-${type}`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center" data-testid={`text-title-${type}`}>
        {icon}
        {title}
      </h3>
      
      <motion.div
        {...getRootProps()}
        className={`upload-zone p-8 rounded-lg text-center cursor-pointer ${
          isDragActive ? "dragover" : ""
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        data-testid={`zone-upload-${type}`}
      >
        <input {...getInputProps()} data-testid={`input-file-${type}`} />
        
        {uploading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <Upload className="w-12 h-12 text-primary mx-auto animate-bounce" />
            <p className="text-muted-foreground" data-testid={`text-uploading-${type}`}>
              Uploading...
            </p>
          </motion.div>
        ) : uploadedFile ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <p className="text-green-600 font-medium" data-testid={`text-success-${type}`}>
              ✓ {uploadedFile} uploaded
            </p>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-red-500" data-testid={`text-error-${type}`}>
              {error}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground mb-2" data-testid={`text-description-${type}`}>
              {description}
            </p>
            <Button 
              variant="link" 
              className="text-primary hover:text-primary/80 font-medium"
              data-testid={`button-browse-${type}`}
            >
              or click to browse
            </Button>
          </motion.div>
        )}
      </motion.div>

      <div className="mt-4">
        <Progress value={uploadProgress} className="h-2" data-testid={`progress-${type}`} />
        <p className="text-sm text-muted-foreground mt-2" data-testid={`text-formats-${type}`}>
          {acceptedFormats}
        </p>
      </div>
    </Card>
  );
}
