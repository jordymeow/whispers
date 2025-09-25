import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User, { type IUser } from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { generateUniqueNickname, sanitizeDisplayName } from '@/lib/users';

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
    const nickname = await generateUniqueNickname(displayName);

    const user = new User({
      username,
      password,
      email,
      displayName,
      nickname,
      role: 'user',
    }) as IUser;

    await user.save();

    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      nickname: user.nickname,
      role: user.role,
    });

    return setAuthCookie(
      NextResponse.json({
        success: true,
        message: 'Account created',
        redirectTo: '/',
        user: {
          userId: user._id.toString(),
          username: user.username,
          displayName: user.displayName,
          nickname: user.nickname,
          role: user.role,
        },
      }),
      token
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
