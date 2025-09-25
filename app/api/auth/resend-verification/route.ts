import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { sendEmailVerificationCode } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      emailVerified: false
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({
        success: true,
        message: 'If an unverified account exists with this email, a new code has been sent.'
      });
    }

    // Generate a new 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with new code
    user.pendingEmailCode = verificationCode;
    user.pendingEmailExpires = codeExpires;
    await user.save();

    // Send new verification email
    await sendEmailVerificationCode(email, verificationCode);

    return NextResponse.json({
      success: true,
      message: 'New verification code sent to your email'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { error: 'Failed to resend verification code. Please try again.' },
      { status: 500 }
    );
  }
}