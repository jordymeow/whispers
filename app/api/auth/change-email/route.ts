import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { checkAuth } from '@/lib/auth';
import { sendEmailVerificationCode } from '@/lib/email';

function generateVerificationCode(): string {
  // Generate 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { newEmail } = await request.json();

    if (!newEmail) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if new email is already in use
    const existingUser = await User.findOne({
      email: newEmail.toLowerCase(),
      _id: { $ne: auth.userId }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email is already in use' },
        { status: 409 }
      );
    }

    // Find current user
    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if same as current email
    if (user.email.toLowerCase() === newEmail.toLowerCase()) {
      return NextResponse.json(
        { error: 'This is already your current email' },
        { status: 400 }
      );
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Use MongoDB driver directly, bypassing Mongoose completely
    const mongoose = await import('mongoose');
    const ObjectId = mongoose.Types.ObjectId;

    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    await mongoose.connection.db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(auth.userId) },
        {
          $set: {
            pendingEmail: newEmail.toLowerCase(),
            pendingEmailCode: verificationCode,
            pendingEmailExpires: new Date(Date.now() + 15 * 60 * 1000),
          }
        }
      );

    // Send verification email
    await sendEmailVerificationCode(newEmail, verificationCode);

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your new email address'
    });

  } catch (error) {
    console.error('Email change request error:', error);
    return NextResponse.json(
      { error: 'Failed to process email change request' },
      { status: 500 }
    );
  }
}