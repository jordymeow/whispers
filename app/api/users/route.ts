import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const includeStats = url.searchParams.get('includeStats') === 'true';

    let query: any = {};

    // Search by username or display name if search param provided
    if (search && search.length >= 2) {
      const searchRegex = new RegExp(search, 'i');
      query = {
        $or: [
          { username: searchRegex },
          { displayName: searchRegex }
        ]
      };
    }

    // Get users with basic info
    const users = await User.find(query)
      .select('username displayName bio backgroundTheme backgroundTint asciiArtBanner createdAt')
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    // Get total count for pagination
    const totalCount = await User.countDocuments(query);

    // If stats requested, get post counts for each user
    let userStats: Record<string, number> = {};
    if (includeStats && users.length > 0) {
      const userIds = users.map(u => u._id);
      const postCounts = await Post.aggregate([
        {
          $match: {
            userId: { $in: userIds },
            $or: [{ isDraft: false }, { isDraft: { $exists: false } }]
          }
        },
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 }
          }
        }
      ]);

      postCounts.forEach(pc => {
        userStats[pc._id.toString()] = pc.count;
      });
    }

    // Format response
    const formattedUsers = users.map(user => ({
      username: user.username,
      displayName: user.displayName,
      bio: user.bio,
      backgroundTheme: user.backgroundTheme,
      backgroundTint: user.backgroundTint,
      asciiArtBanner: user.asciiArtBanner,
      createdAt: user.createdAt,
      ...(includeStats ? { postCount: userStats[user._id.toString()] || 0 } : {})
    }));

    return NextResponse.json({
      users: formattedUsers,
      pagination: {
        offset,
        limit,
        total: totalCount,
        hasMore: offset + limit < totalCount
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}