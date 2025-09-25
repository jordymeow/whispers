import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerified: false
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or already verified' },
        { status: 400 }
      );
    }

    // Check if code matches and hasn't expired
    if (user.pendingEmailCode !== code) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    if (user.pendingEmailExpires && user.pendingEmailExpires < new Date()) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Mark email as verified and clear verification fields
    user.emailVerified = true;
    user.pendingEmailCode = undefined;
    user.pendingEmailExpires = undefined;
    await user.save();

    // Generate token and set auth cookie
    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });

    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email. Please try again.' },
      { status: 500 }
    );
  }
}