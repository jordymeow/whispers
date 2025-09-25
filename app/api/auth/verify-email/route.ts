import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { checkAuth, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // First get the user with Mongoose for most fields
    const user = await User.findById(auth.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get the pending fields directly from MongoDB since Mongoose might not have them in schema
    const mongoose = await import('mongoose');
    const userDoc = await mongoose.connection.db
      .collection('users')
      .findOne({ _id: user._id });

    const pendingEmail = userDoc?.pendingEmail;
    const pendingEmailCode = userDoc?.pendingEmailCode;
    const pendingEmailExpires = userDoc?.pendingEmailExpires;

    // Check if there's a pending email change
    if (!pendingEmail) {
      return NextResponse.json(
        { error: 'No pending email change found' },
        { status: 400 }
      );
    }

    // Check if the pending email matches
    if (pendingEmail.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json(
        { error: 'Email mismatch' },
        { status: 400 }
      );
    }

    // Check if code has expired
    if (!pendingEmailExpires || new Date(pendingEmailExpires) < new Date()) {
      // Clear expired data using updateOne
      await User.updateOne(
        { _id: auth.userId },
        {
          $unset: {
            pendingEmail: '',
            pendingEmailCode: '',
            pendingEmailExpires: ''
          }
        }
      );

      return NextResponse.json(
        { error: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Check if code matches
    if (pendingEmailCode !== code.toUpperCase()) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Update email and clear pending fields
    const oldEmail = user.email;

    await User.updateOne(
      { _id: auth.userId },
      {
        $set: {
          email: pendingEmail,
          emailVerified: true
        },
        $unset: {
          pendingEmail: '',
          pendingEmailCode: '',
          pendingEmailExpires: ''
        }
      }
    );

    // Refetch user to get updated data
    const updatedUser = await User.findById(auth.userId);

    // Generate new token with updated email
    const token = generateToken({
      userId: updatedUser!._id.toString(),
      username: updatedUser!.username,
      email: updatedUser!.email,
      displayName: updatedUser!.displayName,
      nickname: updatedUser!.nickname,
      role: updatedUser!.role,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Email updated successfully',
      newEmail: pendingEmail,
      oldEmail
    });

    // Set new auth cookie with updated info
    setAuthCookie(response, token);

    return response;

  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
}