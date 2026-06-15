import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { getAdminFromRequest } from '@/lib/auth';
import { deleteMedia } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { action, ids, updateData } = body;

    if (!action || !ids || !Array.isArray(ids)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (action === 'delete') {
      // Find all to delete media
      const projects = await Project.find({ _id: { $in: ids } });
      for (const project of projects) {
        for (const mediaUrl of project.mediaUrls) {
          await deleteMedia(mediaUrl);
        }
      }
      await Project.deleteMany({ _id: { $in: ids } });
    } else if (action === 'update') {
      await Project.updateMany({ _id: { $in: ids } }, { $set: updateData });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to perform bulk action:', error);
    return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 });
  }
}
