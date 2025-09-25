import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { checkAuth } from '@/lib/auth';
import User from '@/models/User';
import Post from '@/models/Post';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth || auth.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const totalUsers = await User.countDocuments();

    const topActive = await Post.aggregate([
      {
        $match: {
          $or: [{ isDraft: false }, { isDraft: { $exists: false } }],
        },
      },
      {
        $group: {
          _id: '$userId',
          postCount: { $sum: 1 },
        },
      },
      { $sort: { postCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          postCount: 1,
          nickname: '$user.nickname',
          displayName: '$user.displayName',
          createdAt: '$user.createdAt',
        },
      },
    ]);

    const recentUsersDocs = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('nickname displayName createdAt')
      .lean();

    const recentUsers = recentUsersDocs.map((user) => ({
      nickname: user.nickname,
      displayName: user.displayName,
      createdAt: user.createdAt,
    }));

    return NextResponse.json({
      totalUsers,
      topActive,
      recentUsers,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
