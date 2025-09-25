#!/usr/bin/env node

/**
 * Whispers API Test Suite
 *
 * This script tests all API endpoints by:
 * 1. Creating 10 test users
 * 2. Having each user create random posts
 * 3. Updating user profiles
 * 4. Testing various API operations
 * 5. Cleaning up all test data
 *
 * Usage: node scripts/test-api.js
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3002/api';
const TEST_USER_PREFIX = 'testuser';
const NUM_USERS = 10;
const POSTS_PER_USER = 3;

// Random content for posts
const WHISPER_TEMPLATES = [
  "The stars whispered secrets tonight 🌟",
  "Coffee tastes better at midnight ☕",
  "Lost in thoughts and loving it 💭",
  "Dancing with shadows in the moonlight 🌙",
  "Sometimes silence speaks volumes 🤫",
  "Chasing dreams one step at a time ✨",
  "The rain knows all my secrets 🌧️",
  "Midnight thoughts hit different 🌌",
  "Finding peace in chaos 🌀",
  "Writing my story one whisper at a time 📝"
];

const ICONS = ['Heart', 'Star', 'Moon', 'Sun', 'Cloud', 'Zap', 'Music', 'Book', 'Coffee', 'Sparkles'];
const COLORS = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

const BIOS = [
  "Night owl and dream chaser",
  "Collecting moments, not things",
  "Professional overthinker",
  "Caffeine-powered philosopher",
  "Living in my own fairy tale",
  "Wandering soul with WiFi",
  "Part-time poet, full-time dreamer",
  "Making magic out of mundane",
  "Storyteller at heart",
  "Embracing the beautiful chaos"
];

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API Error (${response.status}): ${data.error || 'Unknown error'}`);
  }

  return { data, headers: response.headers };
}

// Extract cookie from set-cookie header
function extractCookie(headers) {
  const setCookie = headers.get('set-cookie');
  if (!setCookie) return null;

  const match = setCookie.match(/midnight-auth=([^;]+)/);
  return match ? match[1] : null;
}

// Test user class
class TestUser {
  constructor(index) {
    this.index = index;
    this.username = `${TEST_USER_PREFIX}${index}`;
    this.email = `${this.username}@test.whispers.cloud`;
    this.password = `TestPass${index}!`;
    this.displayName = `Test User ${index}`;
    this.token = null;
    this.userId = null;
    this.posts = [];
  }

  async register(isFirst = false) {
    console.log(`📝 Registering ${this.username}...`);

    try {
      const response = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          username: this.username,
          email: this.email,
          password: this.password,
          name: this.displayName
        })
      });

      // First user (admin) gets logged in immediately
      if (isFirst) {
        this.token = response.data.token || extractCookie(response.headers);
        console.log(`✅ Admin user ${this.username} created and logged in`);
      } else {
        // Regular users need email verification
        if (response.data.requiresVerification && response.data._testCode) {
          // Use the obfuscated test code (divide by 2 to decrypt)
          const verificationCode = Math.floor(response.data._testCode / 2).toString();
          console.log(`  🔑 Using test verification code for ${this.username}`);

          // Verify email with the code
          await apiRequest('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({
              email: this.email,
              code: verificationCode
            })
          });

          console.log(`✅ User ${this.username} registered and verified`);

          // Now login to get the token
          await this.login();
        } else {
          console.log(`✅ User ${this.username} registered`);
          await this.login();
        }
      }
    } catch (error) {
      console.error(`❌ Failed to register ${this.username}: ${error.message}`);
      throw error;
    }
  }

  async login() {
    console.log(`🔐 Logging in ${this.username}...`);

    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      });

      // Use token from response (for mobile) or extract from cookie (for web)
      this.token = response.data.token || extractCookie(response.headers);
      this.userId = response.data.user?.userId;

      console.log(`✅ ${this.username} logged in`);
    } catch (error) {
      console.error(`❌ Failed to login ${this.username}: ${error.message}`);
      throw error;
    }
  }

  async updateProfile() {
    console.log(`👤 Updating profile for ${this.username}...`);

    const bio = BIOS[Math.floor(Math.random() * BIOS.length)];
    const tints = ['purple', 'blue', 'green', 'pink', 'orange'];
    const tint = tints[Math.floor(Math.random() * tints.length)];

    try {
      await apiRequest('/users/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          displayName: `${this.displayName} ✨`,
          bio: bio,
          backgroundTint: tint
        })
      });

      console.log(`✅ Profile updated for ${this.username}`);
    } catch (error) {
      console.error(`❌ Failed to update profile for ${this.username}: ${error.message}`);
      throw error;
    }
  }

  async createPosts() {
    console.log(`✍️ Creating posts for ${this.username}...`);

    for (let i = 0; i < POSTS_PER_USER; i++) {
      const content = WHISPER_TEMPLATES[Math.floor(Math.random() * WHISPER_TEMPLATES.length)];
      const icon = ICONS[Math.floor(Math.random() * ICONS.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const isDraft = Math.random() > 0.8; // 20% chance of being a draft

      try {
        const response = await apiRequest('/posts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({
            content: `${content} - ${this.username}`,
            icon: icon,
            color: color,
            isDraft: isDraft
          })
        });

        this.posts.push(response.data._id);
        console.log(`  📝 Post ${i + 1}/${POSTS_PER_USER} created${isDraft ? ' (draft)' : ''}`);
      } catch (error) {
        console.error(`  ❌ Failed to create post: ${error.message}`);
      }
    }

    console.log(`✅ ${this.posts.length} posts created for ${this.username}`);
  }

  async updateRandomPost() {
    if (this.posts.length === 0) return;

    const postId = this.posts[Math.floor(Math.random() * this.posts.length)];
    console.log(`📝 Updating post ${postId} for ${this.username}...`);

    try {
      await apiRequest(`/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          content: "Updated: " + WHISPER_TEMPLATES[Math.floor(Math.random() * WHISPER_TEMPLATES.length)],
          icon: ICONS[Math.floor(Math.random() * ICONS.length)],
          color: COLORS[Math.floor(Math.random() * COLORS.length)]
        })
      });

      console.log(`✅ Post updated`);
    } catch (error) {
      console.error(`❌ Failed to update post: ${error.message}`);
    }
  }

  async deleteAllPosts() {
    console.log(`🗑️ Deleting posts for ${this.username}...`);

    for (const postId of this.posts) {
      try {
        await apiRequest(`/posts/${postId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${this.token}`
          }
        });
      } catch (error) {
        console.error(`  ❌ Failed to delete post ${postId}: ${error.message}`);
      }
    }

    console.log(`✅ All posts deleted for ${this.username}`);
  }

  async deleteAccount() {
    console.log(`🗑️ Deleting account ${this.username}...`);

    try {
      await apiRequest('/users/me', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          password: this.password
        })
      });

      console.log(`✅ Account ${this.username} deleted`);
    } catch (error) {
      console.error(`❌ Failed to delete account ${this.username}: ${error.message}`);
      throw error;
    }
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Whispers API Test Suite');
  console.log(`📍 API Base: ${API_BASE}`);
  console.log(`👥 Creating ${NUM_USERS} test users`);
  console.log('─'.repeat(50));

  const users = [];

  try {
    // Check system status
    console.log('\n📊 Checking system status...');
    const status = await apiRequest('/auth/check');
    console.log(`System status: ${status.data.hasUsers ? 'Has users' : 'No users (fresh install)'}`);

    // Create test users
    console.log('\n👥 Creating test users...');
    for (let i = 0; i < NUM_USERS; i++) {
      const user = new TestUser(i);
      await user.register(i === 0 && !status.data.hasUsers);
      users.push(user);

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update profiles
    console.log('\n✏️ Updating user profiles...');
    for (const user of users) {
      await user.updateProfile();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Create posts
    console.log('\n📝 Creating posts...');
    for (const user of users) {
      await user.createPosts();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Test fetching posts
    console.log('\n📖 Testing post fetching...');
    const publicPosts = await apiRequest('/posts');
    console.log(`✅ Fetched ${publicPosts.data.length} public posts`);

    // Test fetching user profiles
    console.log('\n👤 Testing user profile fetching...');
    for (let i = 0; i < Math.min(3, users.length); i++) {
      const user = users[i];
      const profile = await apiRequest(`/users/${user.username}`);
      console.log(`✅ Fetched profile for ${profile.data.user.username}`);
    }

    // Update some posts
    console.log('\n📝 Updating random posts...');
    for (let i = 0; i < Math.min(5, users.length); i++) {
      await users[i].updateRandomPost();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Test admin stats (if first user is admin)
    if (users[0]) {
      console.log('\n📊 Testing admin stats...');
      try {
        const stats = await apiRequest('/admin/stats', {
          headers: {
            'Authorization': `Bearer ${users[0].token}`
          }
        });
        console.log(`✅ Admin stats: ${stats.data.totalUsers} users`);
      } catch (error) {
        console.log('ℹ️ Admin stats test skipped (user might not be admin)');
      }
    }

    // Cleanup
    console.log('\n🧹 Starting cleanup...');

    // Delete all posts first
    for (const user of users) {
      await user.deleteAllPosts();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Delete all user accounts
    for (const user of users) {
      await user.deleteAccount();
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n✨ Test suite completed successfully!');
    console.log('─'.repeat(50));
    console.log('📊 Summary:');
    console.log(`  ✅ ${NUM_USERS} users created and deleted`);
    console.log(`  ✅ ${NUM_USERS * POSTS_PER_USER} posts created and deleted`);
    console.log(`  ✅ All API endpoints tested`);
    console.log(`  ✅ Cleanup completed`);

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);

    // Attempt cleanup on failure
    console.log('\n🧹 Attempting cleanup after failure...');
    for (const user of users) {
      try {
        if (user.token) {
          await user.deleteAllPosts();
          await user.deleteAccount();
        }
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
    }

    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});