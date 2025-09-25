import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Post from '@/models/Post';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';
import { DEFAULT_ICON_COLOR, isValidIconColor } from '@/lib/whispers';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const url = new URL(request.url);
    const includeDrafts = url.searchParams.get('includeDrafts') === 'true';
    const authorNickname = url.searchParams.get('author')?.toLowerCase() ?? null;

    const token = request.cookies.get('midnight-auth')?.value ?? '';
    const viewer = token ? verifyToken(token) : null;

    if (includeDrafts && !viewer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseQuery: Record<string, any> = includeDrafts
      ? {}
      : { $or: [{ isDraft: false }, { isDraft: { $exists: false } }] };

    if (authorNickname) {
      const authorUser = await User.findOne({ nickname: authorNickname }).select('_id').lean();
      if (!authorUser) {
        return NextResponse.json([]);
      }
      baseQuery.userId = authorUser._id;
    }

    if (includeDrafts && viewer?.role !== 'admin') {
      baseQuery.userId = new mongoose.Types.ObjectId(viewer.userId);
    }

    const posts = await Post.find(baseQuery)
      .sort({ date: -1 })
      .populate('userId', 'displayName nickname')
      .lean();

    const normalized = posts.map(normalizePost);

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('Get posts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = request.cookies.get('midnight-auth')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = verifyToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { content, date, icon, color, isDraft } = await request.json();

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Content must be 1000 characters or less' },
        { status: 400 }
      );
    }

    const post = new Post({
      content: content.trim(),
      date: date ? new Date(date) : new Date(),
      icon: typeof icon === 'string' && icon.trim().length > 0 ? icon.trim() : null,
      color: isValidIconColor(color) ? color : DEFAULT_ICON_COLOR,
      isDraft: isDraft === true,
      userId: user.userId,
    });

    await post.save();

    const populated = await post.populate('userId', 'displayName nickname');
    return NextResponse.json(normalizePost(populated.toObject()));
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

function normalizePost(post: any) {
  const icon =
    typeof post.icon === 'string' && post.icon.trim().length > 0
      ? post.icon.trim()
      : null;

  const color = isValidIconColor(post.color) ? post.color : DEFAULT_ICON_COLOR;

  const authorDoc: any = post.userId && typeof post.userId === 'object' ? post.userId : null;

  const author = authorDoc
    ? {
        displayName: authorDoc.displayName,
        nickname: authorDoc.nickname,
      }
    : null;

  return {
    _id: post._id?.toString?.() ?? post._id,
    content: post.content,
    date: post.date,
    icon,
    color,
    isDraft: Boolean(post.isDraft),
    author,
  };
}
