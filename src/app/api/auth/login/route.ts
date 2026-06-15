import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validUsername || !validPassword) {
      console.error('Admin credentials not set in environment variables');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (username !== validUsername || password !== validPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = signToken({ username });

    const response = NextResponse.json({ success: true }, { status: 200 });
    
    // Set cookie
    response.cookies.set({
      name: 'slns_admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
