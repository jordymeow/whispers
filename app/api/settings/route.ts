import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { checkAuth } from '@/lib/auth';

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
      });
      await settings.save();
    }

    console.log('GET settings - backgroundTheme from DB:', settings.backgroundTheme);

    const payload = {
      title: settings.title,
      backgroundTheme: settings.backgroundTheme || 'cosmic_dust',
      backgroundTint: settings.backgroundTint || 'none',
      asciiArt: settings.asciiArt || '',
      trackingSnippet: settings.trackingSnippet ?? '',
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };

    console.log('GET settings - returning:', {
      backgroundTheme: payload.backgroundTheme,
      backgroundTint: payload.backgroundTint
    });

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

    const body = await request.json();
    console.log('Received settings update:', {
      backgroundTheme: body.backgroundTheme,
      backgroundTint: body.backgroundTint
    });
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
      console.log('Saving backgroundTheme to database:', backgroundTheme);
      updateData.backgroundTheme = backgroundTheme;
    }
    if (backgroundTint !== undefined) {
      console.log('Saving backgroundTint to database:', backgroundTint);
      updateData.backgroundTint = backgroundTint;
    }
    if (typeof asciiArt === 'string') {
      // Limit to 20 lines
      const lines = asciiArt.split('\n').slice(0, 20);
      updateData.asciiArt = lines.join('\n');
    }
    if (typeof trackingSnippet === 'string') updateData.trackingSnippet = trackingSnippet.trim();

    // Use findOneAndUpdate with upsert to ensure the field is saved
    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: updateData },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }
    );

    // Verify the save worked
    console.log('Settings after save:', {
      backgroundTheme: settings?.backgroundTheme,
      title: settings?.title,
    });

    // Double-check by fetching again
    const verifySettings = await Settings.findOne();
    console.log('Verification - backgroundTheme in DB:', verifySettings?.backgroundTheme);

    const payload = {
      title: settings.title,
      backgroundTheme: settings.backgroundTheme || 'cosmic_dust',
      backgroundTint: settings.backgroundTint || 'none',
      asciiArt: settings.asciiArt || '',
      trackingSnippet: settings.trackingSnippet ?? '',
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };

    console.log('Returning payload with backgroundTheme:', payload.backgroundTheme);

    return NextResponse.json(payload);
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
