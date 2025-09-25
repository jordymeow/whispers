import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Post from '@/models/Post';
import { checkAuth } from '@/lib/auth';
import { DEFAULT_ICON_COLOR, isValidIconColor } from '@/lib/whispers';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await checkAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const existingPost = await Post.findById(id);

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (existingPost.userId && existingPost.userId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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

    existingPost.content = content.trim();
    existingPost.icon = typeof icon === 'string' && icon.trim().length > 0 ? icon.trim() : null;
    existingPost.color = isValidIconColor(color) ? color : DEFAULT_ICON_COLOR;

    if (date) existingPost.date = new Date(date);
    if (isDraft !== undefined) existingPost.isDraft = isDraft;

    await existingPost.save();
    const populated = await existingPost.populate('userId', 'displayName username');

    return NextResponse.json(normalizePost(populated.toObject()));
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
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
        username: authorDoc.username,
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await checkAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (post.userId && post.userId.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await post.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
