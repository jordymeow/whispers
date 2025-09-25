import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import Settings from '@/models/Settings';
import { checkAuth, generateToken, setAuthCookie } from '@/lib/auth';
import { sanitizeDisplayName } from '@/lib/users';
import { BACKGROUND_THEMES, BACKGROUND_TINTS, DEFAULT_BACKGROUND_THEME, DEFAULT_BACKGROUND_TINT } from '@/lib/backgroundThemes';
import { DEFAULT_ASCII_ART_BANNER } from '@/lib/siteDefaults';
import bcrypt from 'bcryptjs';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(auth.userId).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio ?? '',
        backgroundTheme: user.backgroundTheme ?? DEFAULT_BACKGROUND_THEME,
        backgroundTint: user.backgroundTint ?? DEFAULT_BACKGROUND_TINT,
        asciiArtBanner: user.asciiArtBanner ?? DEFAULT_ASCII_ART_BANNER,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { displayName, username, bio, backgroundTheme, backgroundTint, asciiArtBanner } = await request.json();

    await connectToDatabase();

    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (typeof displayName === 'string') {
      user.displayName = sanitizeDisplayName(displayName).slice(0, 64);
    }

    if (typeof bio === 'string') {
      user.bio = bio.trim().slice(0, 280);
    }

    if (typeof username === 'string') {
      const desired = username.toLowerCase().trim();
      if (!desired) {
        return NextResponse.json({ error: 'Username cannot be empty' }, { status: 400 });
      }

      if (desired !== user.username) {
        const existing = await User.findOne({ username: desired });
        if (existing && existing._id.toString() !== user._id.toString()) {
          return NextResponse.json({ error: 'Username already in use' }, { status: 409 });
        }
        user.username = desired;
      }
    }

    if (typeof backgroundTheme === 'string' && backgroundTheme in BACKGROUND_THEMES) {
      user.backgroundTheme = backgroundTheme as keyof typeof BACKGROUND_THEMES;
    }

    if (typeof backgroundTint === 'string' && BACKGROUND_TINTS.includes(backgroundTint as (typeof BACKGROUND_TINTS)[number])) {
      user.backgroundTint = backgroundTint as (typeof BACKGROUND_TINTS)[number];
    }

    if (typeof asciiArtBanner === 'string') {
      const trimmed = asciiArtBanner.replace(/\s+$/g, '');
      const lines = trimmed.split('\n').slice(0, 10);
      const joined = lines.join('\n').slice(0, 2000);
      user.asciiArtBanner = joined.trim().length > 0 ? joined : DEFAULT_ASCII_ART_BANNER;
    }

    await user.save();

    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        bio: user.bio ?? '',
        backgroundTheme: user.backgroundTheme ?? DEFAULT_BACKGROUND_THEME,
        backgroundTint: user.backgroundTint ?? DEFAULT_BACKGROUND_TINT,
        asciiArtBanner: user.asciiArtBanner ?? DEFAULT_ASCII_ART_BANNER,
        role: user.role,
      },
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    console.error('Update current user error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Verify user exists and password is correct
    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Delete all user's posts
    await Post.deleteMany({ userId: user._id });

    // If user is admin and owns settings, clear the owner field
    if (user.role === 'admin') {
      await Settings.updateMany(
        { owner: user._id },
        { $unset: { owner: 1 } }
      );
    }

    // Delete the user account
    await User.deleteOne({ _id: user._id });

    // Clear the auth cookie
    const response = NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

    response.cookies.set('midnight-auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
    });

    return response;
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
