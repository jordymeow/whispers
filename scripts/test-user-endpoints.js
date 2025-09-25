#!/usr/bin/env node

/**
 * Test script for user-related API endpoints
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3002/api';

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

  return data;
}

async function testUserEndpoints() {
  console.log('🧪 Testing User API Endpoints');
  console.log(`📍 API Base: ${API_BASE}`);
  console.log('─'.repeat(50));

  try {
    // Test 1: List all users
    console.log('\n1️⃣ Testing GET /api/users (list all users)...');
    const allUsers = await apiRequest('/users?limit=5');
    console.log(`✅ Found ${allUsers.users.length} users (total: ${allUsers.pagination.total})`);
    if (allUsers.users.length > 0) {
      console.log(`   First user: @${allUsers.users[0].username} (${allUsers.users[0].displayName})`);
    }

    // Test 2: List users with stats
    console.log('\n2️⃣ Testing GET /api/users with stats...');
    const usersWithStats = await apiRequest('/users?limit=3&includeStats=true');
    console.log(`✅ Found ${usersWithStats.users.length} users with stats`);
    usersWithStats.users.forEach(user => {
      console.log(`   @${user.username}: ${user.postCount || 0} posts`);
    });

    // Test 3: Search users (if we have any users)
    if (allUsers.users.length > 0) {
      const searchQuery = allUsers.users[0].username.substring(0, 2);
      console.log(`\n3️⃣ Testing GET /api/users/search?q=${searchQuery}...`);
      const searchResults = await apiRequest(`/users/search?q=${searchQuery}`);
      console.log(`✅ Found ${searchResults.count} users matching "${searchQuery}"`);
      searchResults.results.forEach(user => {
        console.log(`   @${user.username} - ${user.displayName}`);
      });
    }

    // Test 4: Search users by display name
    console.log('\n4️⃣ Testing search by display name...');
    const displaySearch = await apiRequest('/users/search?q=test');
    console.log(`✅ Found ${displaySearch.count} users with "test" in their display name`);

    // Test 5: Get specific user
    if (allUsers.users.length > 0) {
      const testUsername = allUsers.users[0].username;
      console.log(`\n5️⃣ Testing GET /api/users/${testUsername}...`);
      const userProfile = await apiRequest(`/users/${testUsername}`);
      console.log(`✅ Got profile for @${userProfile.user.username}`);
      console.log(`   Display Name: ${userProfile.user.displayName}`);
      if (userProfile.user.bio) {
        console.log(`   Bio: ${userProfile.user.bio}`);
      }
    }

    // Test 6: Get posts by specific user
    if (allUsers.users.length > 0) {
      const testUsername = allUsers.users[0].username;
      console.log(`\n6️⃣ Testing GET /api/posts?author=${testUsername}...`);
      const userPosts = await apiRequest(`/posts?author=${testUsername}`);
      console.log(`✅ Found ${userPosts.length} posts by @${testUsername}`);
      if (userPosts.length > 0) {
        console.log(`   Latest post: "${userPosts[0].content.substring(0, 50)}..."`);
      }
    }

    // Test 7: Test pagination
    console.log('\n7️⃣ Testing pagination...');
    const page1 = await apiRequest('/users?limit=2&offset=0');
    const page2 = await apiRequest('/users?limit=2&offset=2');
    console.log(`✅ Page 1: ${page1.users.length} users`);
    console.log(`✅ Page 2: ${page2.users.length} users`);
    console.log(`   Has more pages: ${page2.pagination.hasMore}`);

    // Test 8: Search with no results
    console.log('\n8️⃣ Testing search with no results...');
    const noResults = await apiRequest('/users/search?q=xyzabc123');
    console.log(`✅ Search for "xyzabc123" returned ${noResults.count} results (expected 0)`);

    // Test 9: Invalid search (too short)
    console.log('\n9️⃣ Testing invalid search (query too short)...');
    try {
      await apiRequest('/users/search?q=a');
      console.log('❌ Should have failed with query too short');
    } catch (error) {
      console.log('✅ Correctly rejected short query');
    }

    console.log('\n✨ All user endpoint tests passed!');
    console.log('─'.repeat(50));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run tests
testUserEndpoints().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});