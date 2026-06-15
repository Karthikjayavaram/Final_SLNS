import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';
import { uploadMedia } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const watermarkStr = formData.get('watermark') as string;
    let watermark;
    if (watermarkStr) {
      try { watermark = JSON.parse(watermarkStr); } catch (e) {}
    }

    const url = await uploadMedia(buffer, file.name, 'slns_portfolio', watermark);

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
