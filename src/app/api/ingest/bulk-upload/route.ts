import { NextRequest, NextResponse } from 'next/server';
import {
  parseRFC4180Csv,
  validateBulkUploadGrid,
  executeBulkUpload,
  MAX_BULK_UPLOAD_ROWS,
} from '@/engine/bulk-upload';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let fileContent = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file');

      if (!file) {
        return NextResponse.json(
          { success: false, error: 'No file uploaded in form field "file".' },
          { status: 400 }
        );
      }

      if (typeof file === 'string') {
        fileContent = file;
      } else if (file instanceof Blob) {
        const fileName = (file as { name?: string }).name || '';
        if (fileName.endsWith('.xlsx')) {
          // For xlsx files, check if text/csv or buffer
          const text = await file.text();
          fileContent = text;
        } else {
          fileContent = await file.text();
        }
      }
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      fileContent = body.csvContent || body.content || body.csv || '';
    } else {
      fileContent = await req.text();
    }

    if (!fileContent || !fileContent.trim()) {
      return NextResponse.json(
        { success: false, error: 'Uploaded file is completely empty.' },
        { status: 400 }
      );
    }

    // Parse CSV grid with RFC 4180 rules
    const grid = parseRFC4180Csv(fileContent);

    // Validate 6-column schema and constraints
    const validation = validateBulkUploadGrid(grid);

    // 50-Row Hard Cap Enforcement
    if (!validation.valid && validation.errors.some((e) => e.column === 'batch_limit')) {
      return NextResponse.json(
        {
          success: false,
          error: `Upload exceeds maximum batch limit of ${MAX_BULK_UPLOAD_ROWS} rows`,
        },
        { status: 400 }
      );
    }

    // Pre-Validation Error Reporting (Missing required fields / invalid workplace_type / invalid URL)
    if (!validation.valid || validation.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          errors: validation.errors,
        },
        { status: 422 }
      );
    }

    // Execute deduplication, insertion, Module 3 scoring, and audit logging
    const result = executeBulkUpload(validation.rows);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json(
      { success: false, error: `Bulk upload processing failed: ${message}` },
      { status: 500 }
    );
  }
}

