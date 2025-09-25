import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User, { type IUser } from '@/models/User';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Ensure username is lowercase for case-insensitive login
    const user = (await User.findOne({ username: username.toLowerCase() })) as IUser | null;

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
    });

    return setAuthCookie(
      NextResponse.json({
        success: true,
        message: 'Login successful',
        redirectTo: user.role === 'admin' ? '/dashboard' : '/',
        token: token, // Include token in response for mobile apps
        user: {
          userId: user._id.toString(),
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          role: user.role,
        },
      }),
      token
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to login. Please try again.' },
      { status: 500 }
    );
  }
}
