import { NextRequest, NextResponse } from 'next/server';
import { checkAuth } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    const user = await checkAuth(request);

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    await connectToDatabase();
    const dbUser = await User.findById(user.userId).lean();

    if (!dbUser) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: dbUser._id.toString(),
        username: dbUser.username,
        email: dbUser.email,
        displayName: dbUser.displayName,
        role: dbUser.role,
      },
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}
