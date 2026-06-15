import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Project from '@/models/Project';
import { getAdminFromRequest } from '@/lib/auth';
import { deleteMedia } from '@/lib/cloudinary';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit');
    const category = url.searchParams.get('category');
    const sort = url.searchParams.get('sort'); // 'newest' | 'oldest'

    let queryObj: any = {};
    // By default, admin might fetch all, but public needs visibility: true
    // the frontend can pass a query param 'public=true'
    if (url.searchParams.get('public') === 'true') {
      queryObj.visibility = true;
    }
    if (category && category !== 'All') {
      queryObj.category = category;
    }
    
    let query = Project.find(queryObj);

    if (sort === 'oldest') {
      query = query.sort({ createdAt: 1, uploadDate: 1 });
    } else {
      // Newest first (default)
      query = query.sort({ createdAt: -1, uploadDate: -1 });
    }

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }
    
    const projects = await query.lean();
    
    // Convert _id to string for JSON serialization
    const serialized = projects.map(p => ({
      ...p,
      _id: p._id.toString(),
    }));

    return NextResponse.json(serialized, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
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
    
    const project = await Project.create({
      category: body.category,
      orientation: body.orientation || 'portrait',
      mediaUrls: body.mediaUrls,
      mediaType: body.mediaType || 'image',
      visibility: body.visibility !== undefined ? body.visibility : true,
      title: body.category || 'Untitled',
      description: body.category || 'No description',
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error('Failed to create project:', error);
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
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await Project.findById(id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Attempt to delete media
    for (const mediaUrl of project.mediaUrls) {
      await deleteMedia(mediaUrl);
    }

    await Project.findByIdAndDelete(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Failed to delete project:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
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
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await Project.findByIdAndUpdate(id, { $set: updateData }, { new: true });
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project }, { status: 200 });
  } catch (error) {
    console.error('Failed to update project:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}
