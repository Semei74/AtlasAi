import { useMutation } from '@tanstack/react-query';
import { DocumentPipeline } from '../documents/DocumentPipeline';
import { parsers } from '../documents/parsers';
import { OCRInterface } from '../documents/OCRInterface';
import type { DocumentFormat, DocumentProcessingResult } from '../documents';

const pipeline = new DocumentPipeline();

parsers.forEach((parser) => {
  ['pdf', 'docx', 'pptx', 'txt', 'markdown', 'html', 'csv', 'json'].forEach((fmt) => {
    if (parser.canParse(fmt as DocumentFormat)) {
      pipeline.registerParser(fmt as DocumentFormat, parser);
    }
  });
});

pipeline.registerOCR(new OCRInterface());

export function useProcessDocument() {
  return useMutation({
    mutationFn: ({
      content,
      documentId,
      format,
    }: {
      content: string | ArrayBuffer;
      documentId: string;
      format: DocumentFormat;
    }): Promise<DocumentProcessingResult> => {
      return pipeline.process(content, documentId, format);
    },
  });
}

export { pipeline as documentPipeline };
