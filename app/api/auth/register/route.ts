import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User, { type IUser } from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { sanitizeDisplayName } from '@/lib/users';
import { DEFAULT_ASCII_ART_BANNER } from '@/lib/siteDefaults';
import { sendEmailVerificationCode } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { username, password, name, email } = await request.json();

    if (!username || !password || !email) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate username format (lowercase letters, numbers, hyphens only)
    const usernameRegex = /^[a-z][a-z0-9-]{2,}$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username must start with a letter and contain only lowercase letters, numbers, and hyphens (minimum 3 characters)' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 409 }
      );
    }

    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email is already taken' },
        { status: 409 }
      );
    }

    const displayName = sanitizeDisplayName(name ?? username);

    // Check if this is the first user
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // First user becomes admin and doesn't need email verification
    if (isFirstUser) {
      const user = new User({
        username: username.toLowerCase(),
        password,
        email,
        displayName,
        role: 'admin',
        asciiArtBanner: DEFAULT_ASCII_ART_BANNER,
        emailVerified: true, // First user is auto-verified
      }) as IUser;

      await user.save();

      // Create initial settings for the site
      const Settings = (await import('@/models/Settings')).default;
      const existingSettings = await Settings.findOne();
      if (!existingSettings) {
        const settings = new Settings({
          title: 'My Whispers',
          trackingSnippet: '',
        });
        await settings.save();
      }

      const token = generateToken({
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      });

      // Set auth cookie for immediate login
      const { cookies } = await import('next/headers');
      const cookieStore = await cookies();
      cookieStore.set('midnight-auth', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return NextResponse.json({
        success: true,
        message: 'Admin account created successfully',
        redirectTo: '/dashboard',
      });
    }

    // Regular user registration with email verification
    // Generate a 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const user = new User({
      username: username.toLowerCase(),
      password,
      email,
      displayName,
      role: 'user',
      asciiArtBanner: DEFAULT_ASCII_ART_BANNER,
      emailVerified: false,
      pendingEmailCode: verificationCode,
      pendingEmailExpires: codeExpires,
    }) as IUser;

    await user.save();

    // Send verification email
    await sendEmailVerificationCode(email, verificationCode);

    // Don't set auth cookie yet - need email verification first
    return NextResponse.json({
      success: true,
      message: 'Account created. Please check your email for verification code.',
      requiresVerification: true,
      userId: user._id.toString(),
      email: user.email,
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
