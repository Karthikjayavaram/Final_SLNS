import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import EventStyle from '@/models/EventStyle';
import Project from '@/models/Project';
import { getAdminFromRequest } from '@/lib/auth';
import { deleteMedia } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const styles = await EventStyle.find().sort({ name: 1 }).lean();
    
    const serialized = styles.map(s => ({
      ...s,
      _id: s._id.toString(),
    }));

    return NextResponse.json(serialized, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch event styles:', error);
    return NextResponse.json({ error: 'Failed to fetch styles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    
    if (!body.name) {
      return NextResponse.json({ error: 'Style name is required' }, { status: 400 });
    }

    const style = await EventStyle.create({ name: body.name });
    return NextResponse.json({ success: true, style }, { status: 201 });
  } catch (error) {
    console.error('Failed to create style:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    
    if (!body.id || !body.name) {
      return NextResponse.json({ error: 'Style ID and new name are required' }, { status: 400 });
    }

    const style = await EventStyle.findById(body.id);
    if (!style) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 });
    }

    const oldName = style.name;
    style.name = body.name;
    await style.save();

    // Update all projects that had the old category name
    await Project.updateMany({ category: oldName }, { $set: { category: body.name } });

    return NextResponse.json({ success: true, style }, { status: 200 });
  } catch (error) {
    console.error('Failed to update style:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = getAdminFromRequest(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Style ID is required' }, { status: 400 });
    }

    const style = await EventStyle.findById(id);
    if (!style) {
      return NextResponse.json({ error: 'Style not found' }, { status: 404 });
    }

    // Delete all projects and their media in this category
    const projects = await Project.find({ category: style.name });
    for (const project of projects) {
      for (const mediaUrl of project.mediaUrls) {
        await deleteMedia(mediaUrl);
      }
    }
    await Project.deleteMany({ category: style.name });

    // Finally delete the category
    await EventStyle.findByIdAndDelete(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete style:', error);
    return NextResponse.json({ error: 'Failed to delete style' }, { status: 500 });
  }
}
