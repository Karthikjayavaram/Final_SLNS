import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';

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

export type WatermarkOptions = {
  type: string;
  text: string;
  position: string;
  color: string;
};

export async function uploadMedia(buffer: Buffer, filename: string, folder = 'slns_portfolio', watermark?: WatermarkOptions): Promise<string> {
  if (isCloudinaryConfigured) {
    return new Promise((resolve, reject) => {
      let transformation: any[] = [];
      
      if (watermark) {
        if (watermark.type === 'logo') {
          transformation.push({ overlay: 'slns_logo', gravity: watermark.position, opacity: 80, width: 200, y: 20, x: 20 });
        } else {
          // encode uri component for text is required by cloudinary for text overlays
          const encodedText = encodeURIComponent(watermark.text || 'SLNS');
          transformation.push({ 
            overlay: { font_family: "Arial", font_size: 60, font_weight: "bold", text: encodedText }, 
            color: watermark.color === 'gold' ? '#AA7C11' : watermark.color, 
            gravity: watermark.position, 
            opacity: 70,
            y: 30,
            x: 30
          });
        }
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
          ...(transformation.length > 0 && { transformation })
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result?.secure_url || '');
        }
      );
      uploadStream.end(buffer);
    });
  } else {
    // Local fallback: write to public/uploads
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(filename) || '.jpg';
    const baseName = path.basename(filename, fileExt).replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueFilename = `${baseName}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    fs.writeFileSync(filePath, buffer);
    console.log(`[Local Upload Fallback] Saved file to ${filePath}`);

    return `/uploads/${uniqueFilename}`;
  }
}

export async function deleteMedia(publicUrl: string): Promise<void> {
  if (!isCloudinaryConfigured) return;

  try {
    // Extract public_id from Cloudinary URL
    const parts = publicUrl.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex >= 0) {
      const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
      const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error('[Cloudinary] Failed to delete media:', error);
  }
}
