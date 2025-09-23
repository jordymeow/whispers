import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const userCount = await User.countDocuments();

    return NextResponse.json({
      hasUsers: userCount > 0,
      requiresSetup: userCount === 0,
    });
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json(
      { error: 'Failed to check authentication status' },
      { status: 500 }
    );
  }
}