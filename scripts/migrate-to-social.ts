import { loadEnvConfig } from '@next/env';
import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/mongodb';
import User, { type IUser } from '../models/User';
import Post, { type IPost } from '../models/Post';
import { sanitizeDisplayName, slugifyNickname } from '../lib/users';

loadEnvConfig(process.cwd());

function ensureNickname(base: string, used: Set<string>, fallback: string) {
  const safeBase = slugifyNickname(base) || fallback;
  let candidate = safeBase;
  let counter = 1;
  while (!candidate || used.has(candidate)) {
    candidate = `${safeBase}-${counter++}`;
  }
  used.add(candidate);
  return candidate;
}

async function migrateUsers(): Promise<{ users: IUser[]; admin: IUser | null }> {
  const users = await User.find().sort({ createdAt: 1 }).exec();

  if (users.length === 0) {
    console.log('No users found. Skipping user migration.');
    return { users, admin: null };
  }

  const nicknameSet = new Set<string>();
  users.forEach(user => {
    if (user.nickname) {
      nicknameSet.add(String(user.nickname).toLowerCase());
    }
  });

  const adminCandidate = users[0];
  let updated = 0;

  for (const user of users) {
    const originalNickname = user.nickname ? String(user.nickname).toLowerCase() : undefined;
    if (originalNickname) {
      nicknameSet.delete(originalNickname);
    }

    const displayName = sanitizeDisplayName(user.displayName ?? user.username).slice(0, 64);
    const nickname = ensureNickname(
      displayName || user.username,
      nicknameSet,
      `whisperer-${String(user._id).slice(-6)}`
    );

    const role = user.role === 'admin'
      ? 'admin'
      : (String(user._id) === String(adminCandidate._id) ? 'admin' : 'user');

    const bio = typeof user.bio === 'string' ? user.bio : '';

    const needsUpdate =
      user.displayName !== displayName ||
      user.nickname !== nickname ||
      user.role !== role ||
      user.bio !== bio;

    if (needsUpdate) {
      user.displayName = displayName;
      user.nickname = nickname;
      user.role = role;
      user.bio = bio;
      await user.save();
      updated += 1;
    }
  }

  console.log(`Users migrated: ${updated} (total ${users.length})`);
  const admin = await User.findById(adminCandidate._id).exec();
  return { users, admin: admin ?? null };
}

async function migratePosts(users: IUser[], admin: IUser | null) {
  const usersById = new Map<string, IUser>();
  users.forEach(user => {
    usersById.set(String(user._id), user);
    if (!user.nickname) {
      throw new Error(`User ${user.username} is missing nickname after migration.`);
    }
  });

  const fallbackAuthor = admin ?? users[0] ?? null;
  if (!fallbackAuthor) {
    console.log('No fallback author available. Skipping post migration.');
    return;
  }

  const posts = await Post.find().exec();
  if (posts.length === 0) {
    console.log('No posts found.');
    return;
  }

  let updated = 0;
  for (const post of posts) {
    const authorId = post.author ? String(post.author) : null;
    const author = authorId ? usersById.get(authorId) : null;
    const resolvedAuthor = author ?? fallbackAuthor;

    const authorDisplayName = resolvedAuthor.displayName;
    const authorNickname = resolvedAuthor.nickname;

    const needsUpdate =
      String(post.author ?? '') !== String(resolvedAuthor._id) ||
      post.authorDisplayName !== authorDisplayName ||
      post.authorNickname !== authorNickname;

    if (needsUpdate) {
      post.author = resolvedAuthor._id as unknown as IPost['author'];
      post.authorDisplayName = authorDisplayName;
      post.authorNickname = authorNickname;
      await post.save();
      updated += 1;
    }
  }

  console.log(`Posts migrated: ${updated} (total ${posts.length})`);
}

async function run() {
  await connectToDatabase();

  const { users, admin } = await migrateUsers();
  await migratePosts(users, admin);

  await mongoose.connection.close();
  console.log('Migration complete.');
}

run().catch(async (error) => {
  console.error('Migration failed:', error);
  await mongoose.connection.close();
  process.exit(1);
});
