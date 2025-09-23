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

    const updateData: any = {
      content: content.trim(),
      icon: typeof icon === 'string' && icon.trim().length > 0 ? icon.trim() : null,
      color: isValidIconColor(color) ? color : DEFAULT_ICON_COLOR,
    };

    if (date) updateData.date = new Date(date);
    if (isDraft !== undefined) updateData.isDraft = isDraft;

    const post = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const sanitized = {
      ...post.toObject(),
      icon: post.icon && post.icon.length ? post.icon : null,
      color: isValidIconColor(post.color) ? post.color : DEFAULT_ICON_COLOR,
    };

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error('Update post error:', error);
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
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

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete post error:', error);
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}
