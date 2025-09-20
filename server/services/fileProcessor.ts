import { UploadedFile } from "@shared/schema";

export async function processTextFile(file: UploadedFile, content: Buffer): Promise<string> {
  // For CSV, JSON, and text files, simply convert buffer to string
  if (file.type === 'worklog' || file.type === 'license') {
    return content.toString('utf8');
  }
  
  // For contracts (PDF/DOC), we would normally use pdf-parse or similar
  // For now, return as text (in production, implement PDF parsing)
  return content.toString('utf8');
}

export function validateFileType(filename: string, type: string): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  
  switch (type) {
    case 'contract':
      return ['pdf', 'doc', 'docx', 'txt'].includes(ext || '');
    case 'worklog':
      return ['csv', 'json', 'txt'].includes(ext || '');
    case 'license':
      return ['csv', 'xlsx', 'xls', 'json', 'txt'].includes(ext || '');
    default:
      return false;
  }
}

export function getFileIcon(type: string): string {
  switch (type) {
    case 'contract':
      return '📄';
    case 'worklog':
      return '📊';
    case 'license':
      return '🔑';
    default:
      return '📁';
  }
}
