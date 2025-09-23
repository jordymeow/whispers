import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Post from '@/models/Post';
import { verifyToken } from '@/lib/auth';
import { DEFAULT_ICON_COLOR, isValidIconColor } from '@/lib/whispers';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const posts = await Post.find({})
      .sort({ date: -1 })
      .lean();

    const normalized = posts.map((post) => ({
      ...post,
      icon:
        typeof post.icon === 'string' && post.icon.trim().length > 0
          ? post.icon.trim()
          : null,
      color: isValidIconColor(post.color) ? post.color : DEFAULT_ICON_COLOR,
    }));

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

    const { content, date, icon, color } = await request.json();

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
    });

    await post.save();

    return NextResponse.json(post);
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
