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
    
    const skipWatermark = formData.get('skipWatermark') === 'true';
    const customWatermarkStr = formData.get('customWatermark') as string | null;
    
    let watermark;
    if (skipWatermark) {
      watermark = undefined;
    } else if (customWatermarkStr) {
      try {
        watermark = JSON.parse(customWatermarkStr);
      } catch (e) {
        console.error('Failed to parse custom watermark', e);
      }
    }
    
    if (watermark === undefined && !skipWatermark) {
      // Default watermark applied to all uploads automatically
      watermark = {
        type: 'text',
        text: 'SLNS 9480038144',
        position: 'center',
        color: 'white'
      };
    }

    const url = await uploadMedia(buffer, file.name, 'slns_portfolio', watermark);

    return NextResponse.json({ url }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
