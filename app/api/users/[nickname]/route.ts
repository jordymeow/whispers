import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { DEFAULT_BACKGROUND_THEME, DEFAULT_BACKGROUND_TINT } from '@/lib/backgroundThemes';
import { DEFAULT_ASCII_ART_BANNER } from '@/lib/siteDefaults';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nickname: string }> }
) {
  try {
    const { nickname } = await params;

    await connectToDatabase();
    const user = await User.findOne({ nickname: nickname.toLowerCase() }).lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        userId: user._id.toString(),
        username: user.username,
        displayName: user.displayName,
        nickname: user.nickname,
        bio: user.bio ?? '',
        backgroundTheme: user.backgroundTheme ?? DEFAULT_BACKGROUND_THEME,
        backgroundTint: user.backgroundTint ?? DEFAULT_BACKGROUND_TINT,
        asciiArtBanner: user.asciiArtBanner ?? DEFAULT_ASCII_ART_BANNER,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Public profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
