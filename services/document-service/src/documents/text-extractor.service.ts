import { Injectable, UnprocessableEntityException, Logger } from '@nestjs/common';
import { readFile } from 'fs/promises';
import { extname } from 'path';
import pdfParse from 'pdf-parse';
import * as mammoth from 'mammoth';

export interface ExtractResult {
  text: string;
  charCount: number;
  lineCount: number;
  sourceType: string;
}

@Injectable()
export class TextExtractorService {
  private readonly logger = new Logger(TextExtractorService.name);

  async extract(filePath: string, fileName: string): Promise<ExtractResult> {
    const ext = extname(fileName).toLowerCase();
    let buffer: Buffer;

    try {
      buffer = await readFile(filePath);
    } catch (error) {
      this.logger.error(`Cannot read file at: ${filePath}`, error);
      throw new UnprocessableEntityException(`Không thể đọc file tại đường dẫn: ${filePath}`);
    }

    let text = '';
    let sourceType = '';

    try {
      if (ext === '.pdf') {
        sourceType = 'PDF';
        const pdfData = await pdfParse(buffer, { pagerender: undefined });
        text = pdfData.text;
      } else if (ext === '.docx') {
        sourceType = 'DOCX';
        const docxData = await mammoth.extractRawText({ buffer });
        text = docxData.value;
      } else if (ext === '.txt') {
        sourceType = 'TXT';
        text = buffer.toString('utf8');
      } else {
        throw new UnprocessableEntityException(`Định dạng không hỗ trợ: ${ext}`);
      }

      // Cleanup text
      const cleanText = text.replace(/\r\n/g, '\n').trim();
      
      return {
        text: cleanText,
        charCount: cleanText.length,
        lineCount: cleanText.split('\n').length,
        sourceType,
      };
    } catch (error) {
      this.logger.error(`Error parsing ${sourceType} file: ${fileName}`, error);
      throw new UnprocessableEntityException(`Lỗi khi trích xuất văn bản từ file ${sourceType}`);
    }
  }
}
