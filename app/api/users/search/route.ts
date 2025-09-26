import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const q = url.searchParams.get('q');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '10'), 50);

    if (!q || q.length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      );
    }

    // Search for users by username (exact prefix match) or display name (partial match)
    const users = await User.find({
      $or: [
        { username: { $regex: `^${q.toLowerCase()}` } }, // Username starts with query
        { displayName: { $regex: q, $options: 'i' } }   // Display name contains query
      ]
    })
      .select('username displayName bio backgroundTint asciiArtBanner')
      .limit(limit)
      .lean();

    const results = users.map(user => ({
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      backgroundTint: user.backgroundTint,
      asciiArtBanner: user.asciiArtBanner,
      profileUrl: `/@${user.username}`
    }));

    return NextResponse.json({
      query: q,
      results,
      count: results.length
    });
  } catch (error) {
    console.error('Search users error:', error);
    return NextResponse.json(
      { error: 'Failed to search users' },
      { status: 500 }
    );
  }
}