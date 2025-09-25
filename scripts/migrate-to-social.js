#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

function loadEnv() {
  if (process.env.MONGODB_URI) return;
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    return;
  }
  const lines = fs
    .readFileSync(envPath, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .filter(line => !line.startsWith('#'));

  for (const line of lines) {
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    const value = line.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value.replace(/^"|"$/g, '');
    }
  }
}

function sanitizeDisplayName(name) {
  const trimmed = (name || '').trim();
  return trimmed.length > 0 ? trimmed : 'Unnamed Dreamer';
}

function slugifyNickname(input) {
  return (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function ensureNickname(base, used, fallback) {
  const safeBase = slugifyNickname(base) || fallback;
  let candidate = safeBase;
  let counter = 1;
  while (!candidate || used.has(candidate)) {
    candidate = `${safeBase}-${counter++}`;
  }
  used.add(candidate);
  return candidate;
}

async function migrateUsers(db) {
  const usersCol = db.collection('users');
  const users = await usersCol.find().sort({ createdAt: 1 }).toArray();

  if (users.length === 0) {
    console.log('No users found. Skipping user migration.');
    return { users, admin: null };
  }

  const nicknameSet = new Set();
  const emailSet = new Set();
  for (const user of users) {
    if (user.nickname) {
      nicknameSet.add(String(user.nickname).toLowerCase());
    }
    if (user.email) {
      emailSet.add(String(user.email).toLowerCase());
    }
  }

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

     let email = typeof user.email === 'string' && user.email.trim().length > 0
      ? user.email.trim().toLowerCase()
      : '';

    if (!email) {
      if (String(user._id) === String(adminCandidate._id)) {
        email = 'inscr@meow.fr';
      } else {
        const base = slugifyNickname(user.username || displayName) || 'whisperer';
        email = `${base}-${String(user._id).slice(-6)}@whispers.local`;
      }
    }

    let resolvedEmail = email;
    let counter = 1;
    while (emailSet.has(resolvedEmail.toLowerCase())) {
      const [local, domain] = resolvedEmail.split('@');
      resolvedEmail = `${local}+${counter}@${domain}`;
      counter += 1;
    }
    emailSet.add(resolvedEmail.toLowerCase());

    const needsUpdate =
      user.displayName !== displayName ||
      user.nickname !== nickname ||
      user.role !== role ||
      user.bio !== bio ||
      user.email !== resolvedEmail;

    if (needsUpdate) {
      await usersCol.updateOne(
        { _id: user._id },
        {
          $set: {
            displayName,
            nickname,
            role,
            bio,
            email: resolvedEmail,
          },
        }
      );
      updated += 1;
    }
  }

  console.log(`Users migrated: ${updated} (total ${users.length})`);
  const admin = await usersCol.findOne({ _id: adminCandidate._id });
  return { users: await usersCol.find().toArray(), admin };
}

async function migratePosts(db, users, admin) {
  const postsCol = db.collection('posts');
  const posts = await postsCol.find().toArray();

  if (posts.length === 0) {
    console.log('No posts found.');
    return;
  }

  const fallbackAuthor = admin ?? users[0] ?? null;
  if (!fallbackAuthor) {
    console.log('No fallback author available. Skipping post migration.');
    return;
  }

  const usersById = new Map();
  for (const user of users) {
    usersById.set(String(user._id), user);
  }

  let updated = 0;
  for (const post of posts) {
    const authorId = post.author ? String(post.author) : null;
    const existingUserId = post.userId ? String(post.userId) : null;
    const resolvedUser = existingUserId ? usersById.get(existingUserId) : (authorId ? usersById.get(authorId) : null) || fallbackAuthor;

    const needsUpdate =
      String(post.userId ?? '') !== String(resolvedUser._id) ||
      post.author !== undefined ||
      post.authorDisplayName !== undefined ||
      post.authorNickname !== undefined;

    if (needsUpdate) {
      await postsCol.updateOne(
        { _id: post._id },
        {
          $set: {
            userId: resolvedUser._id,
          },
          $unset: {
            author: '',
            authorDisplayName: '',
            authorNickname: '',
          },
        }
      );
      updated += 1;
    }
  }

  console.log(`Posts migrated: ${updated} (total ${posts.length})`);
}

async function migrateSettings(db, admin) {
  const settingsCol = db.collection('settings');
  const settings = await settingsCol.findOne();
  if (!settings) {
    console.log('No settings document found.');
    return;
  }

  if (!settings.owner && admin) {
    await settingsCol.updateOne(
      { _id: settings._id },
      { $set: { owner: admin._id } }
    );
    console.log('Settings owner set to admin user.');
  }
}

async function main() {
  loadEnv();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to .env.local or export it before running.');
  }

  await mongoose.connect(uri, {
    bufferCommands: false,
  });

  const db = mongoose.connection;
  const { users, admin } = await migrateUsers(db);
  await migratePosts(db, users, admin);
  if (admin) {
    await migrateSettings(db, admin);
  }

  await mongoose.connection.close();
  console.log('Migration complete.');
}

main().catch(async (error) => {
  console.error('Migration failed:', error);
  await mongoose.connection.close();
  process.exit(1);
});
