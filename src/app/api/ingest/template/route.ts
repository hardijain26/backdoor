import { NextResponse } from 'next/server';
import { BULK_UPLOAD_TEMPLATE_CSV } from '@/engine/bulk-upload';

export const dynamic = 'force-dynamic';

export async function GET() {
  return new NextResponse(BULK_UPLOAD_TEMPLATE_CSV, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="backdoor_opportunities_template.csv"',
      'Cache-Control': 'no-store',
    },
  });
}
