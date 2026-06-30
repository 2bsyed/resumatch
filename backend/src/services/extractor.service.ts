import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';

export async function extractFromPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const textResult = await parser.getText();
  await parser.destroy();
  return textResult.text || '';
}

export async function extractFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || '';
}

export function extractFromTxt(buffer: Buffer): string {
  return buffer.toString('utf-8');
}

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  const cleanMime = mimeType.toLowerCase();
  
  if (cleanMime === 'application/pdf') {
    return extractFromPdf(buffer);
  }
  
  if (
    cleanMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    cleanMime === 'application/msword'
  ) {
    return extractFromDocx(buffer);
  }
  
  // Default fallback is plain text
  return extractFromTxt(buffer);
}
