import User from '@/models/User';

export function slugifyNickname(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function generateUniqueNickname(base: string): Promise<string> {
  const initial = slugifyNickname(base) || 'whisperer';
  let candidate = initial;
  let counter = 1;

  while (await User.exists({ nickname: candidate })) {
    counter += 1;
    candidate = `${initial}-${counter}`;
  }

  return candidate;
}

export function sanitizeDisplayName(name: string): string {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : 'Unnamed Dreamer';
}
