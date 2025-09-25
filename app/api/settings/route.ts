import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { checkAuth } from '@/lib/auth';
import { DEFAULT_ASCII_ART_BANNER } from '@/lib/siteDefaults';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        title: 'My Whispers',
        backgroundTheme: 'cosmic_dust',
        backgroundHue: 0,
        trackingSnippet: '',
        asciiArt: DEFAULT_ASCII_ART_BANNER,
      });
      await settings.save();
    }

    const normalizedAsciiArt = typeof settings.asciiArt === 'string'
      ? settings.asciiArt
      : DEFAULT_ASCII_ART_BANNER;

    const payload = {
      title: settings.title,
      backgroundTheme: settings.backgroundTheme || 'cosmic_dust',
      backgroundTint: settings.backgroundTint || 'none',
      asciiArt: normalizedAsciiArt,
      trackingSnippet: settings.trackingSnippet ?? '',
      owner: settings.owner ? settings.owner.toString() : null,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await checkAuth(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings({
        title: 'My Whispers',
        owner: user.userId,
        asciiArt: DEFAULT_ASCII_ART_BANNER,
      });
      await settings.save();
    }

    if (settings.owner && settings.owner.toString() !== user.userId && user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      backgroundTheme,
      backgroundTint,
      asciiArt,
      trackingSnippet,
    } = body;

    // Build update object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (backgroundTheme !== undefined) {
      updateData.backgroundTheme = backgroundTheme;
    }
    if (backgroundTint !== undefined) {
      updateData.backgroundTint = backgroundTint;
    }
    if (typeof asciiArt === 'string') {
      // Limit to 20 lines
      const lines = asciiArt.split('\n').slice(0, 20);
      updateData.asciiArt = lines.join('\n');
    }
    if (typeof trackingSnippet === 'string') updateData.trackingSnippet = trackingSnippet.trim();

    // Use findOneAndUpdate with upsert to ensure the field is saved
    if (!settings.owner) {
      updateData.owner = user.userId;
    }

    const updatedSettings = await Settings.findOneAndUpdate(
      { _id: settings._id },
      { $set: updateData },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    const normalizedAsciiArt = typeof updatedSettings.asciiArt === 'string'
      ? updatedSettings.asciiArt
      : DEFAULT_ASCII_ART_BANNER;

    const payload = {
      title: updatedSettings.title,
      backgroundTheme: updatedSettings.backgroundTheme || 'cosmic_dust',
      backgroundTint: updatedSettings.backgroundTint || 'none',
      asciiArt: normalizedAsciiArt,
      trackingSnippet: updatedSettings.trackingSnippet ?? '',
      owner: updatedSettings.owner ? updatedSettings.owner.toString() : null,
      createdAt: updatedSettings.createdAt,
      updatedAt: updatedSettings.updatedAt,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
