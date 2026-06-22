import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getAdminFromRequest } from '@/lib/auth';

const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isCloudinaryConfigured) {
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = 'slns_portfolio';
    
    let transformationStr = '';
    
    if (!body.skipWatermark) {
      const watermark = body.customWatermark || {
        type: 'text',
        text: 'SLNS 9480038144',
        position: 'center',
        color: 'white',
        size: 30,
        opacity: 0.7
      };
      
      const encodedText = encodeURIComponent(watermark.text || 'SLNS');
      const isCenter = watermark.position === 'center';
      const opacityVal = watermark.opacity ? Math.round(watermark.opacity * 100) : 70;
      const sizeVal = watermark.size || 30;
      const colorVal = watermark.color === 'gold' ? '#AA7C11' : (watermark.color || 'white');
      
      const colorFormatted = colorVal.replace('#', 'rgb:'); 
      
      let tStr = `l_text:Arial_200_bold:${encodedText},co_${colorFormatted},o_${opacityVal}/c_scale,w_0.5,fl_relative/fl_layer_apply,g_${watermark.position || 'center'}`;
      transformationStr = tStr;
    }

    const paramsToSign: Record<string, any> = {
      timestamp,
      folder,
    };

    if (transformationStr) {
      paramsToSign.transformation = transformationStr;
    }

    const signature = cloudinary.utils.api_sign_request(paramsToSign, process.env.CLOUDINARY_API_SECRET!);

    return NextResponse.json({
      timestamp,
      signature,
      folder,
      transformation: transformationStr,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (error) {
    console.error('Signature generation failed', error);
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
