import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';

export function slugifyUsername(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

export async function generateUniqueUsername(base: string): Promise<string> {
  const initial = slugifyUsername(base) || 'user';
  let candidate = initial;
  let counter = 1;

  while (await User.exists({ username: candidate })) {
    counter += 1;
    candidate = `${initial}-${counter}`;
  }

  return candidate;
}

export function sanitizeDisplayName(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : 'Unnamed Dreamer';
}

export async function getUser(username: string) {
  try {
    await connectToDatabase();
    const user = await User.findOne({ username }).select('-password');
    return user;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
