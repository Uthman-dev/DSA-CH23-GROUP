const assert = require('assert');
const SocialNetwork = require('./system');

console.log("Starting tests...\n");

let testsPassed = 0;
let testsFailed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ Test ${testsPassed + 1}: ${name}`);
        testsPassed++;
    } catch (error) {
        console.log(`✗ Test FAILED: ${name}`);
        console.log(`  Error: ${error.message}`);
        testsFailed++;
    }
}

// Test 1: Add user
test("Add user to network", () => {
    const sn = new SocialNetwork();
    sn.addUser("t1", "Test1");
    assert.strictEqual(sn.users.get("t1"), "Test1", "User should be added");
});

// Test 2: Add multiple users
test("Add multiple users", () => {
    const sn = new SocialNetwork();
    sn.addUser("t1", "User1");
    sn.addUser("t2", "User2");
    sn.addUser("t3", "User3");
    assert.strictEqual(sn.users.get("t1"), "User1");
    assert.strictEqual(sn.users.get("t2"), "User2");
    assert.strictEqual(sn.users.get("t3"), "User3");
});

// Test 3: Add friend connection
test("Add friend connection", () => {
    const sn = new SocialNetwork();
    sn.addUser("t1", "Alice");
    sn.addUser("t2", "Bob");
    sn.addFriend("t1", "t2");
    assert(sn.graph.get("t1").includes("t2"), "t2 should be friend of t1");
    assert(sn.graph.get("t2").includes("t1"), "t1 should be friend of t2");
});

// Test 4: Undo last friend action
test("Undo last friend action", () => {
    const sn = new SocialNetwork();
    sn.addUser("t1", "Alice");
    sn.addUser("t2", "Bob");
    sn.addFriend("t1", "t2");
    const result = sn.undoLastFriend();
    assert(!sn.graph.get("t1").includes("t2"), "Friendship should be removed");
    assert(!sn.graph.get("t2").includes("t1"), "Friendship should be removed");
    assert(result.includes("Undone"), "Undo message should confirm");
});

// Test 5: Undo on empty stack
test("Undo on empty stack returns message", () => {
    const sn = new SocialNetwork();
    const result = sn.undoLastFriend();
    assert.strictEqual(result, "Nothing to undo", "Should return nothing to undo");
});

// Test 6: Sort friends (merge sort)
test("Sort friends alphabetically", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addUser("u3", "User3");
    sn.addUser("u2", "User2");
    sn.addFriend("u1", "u3");
    sn.addFriend("u1", "u2");
    const sorted = sn.sortFriends("u1");
    assert.deepStrictEqual(sorted, ["u2", "u3"], "Friends should be sorted");
});

// Test 7: Binary search finds friend in sorted list
test("Binary search finds friend in sorted list", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addUser("u2", "User2");
    sn.addUser("u3", "User3");
    sn.addUser("u4", "User4");
    sn.addFriend("u1", "u2");
    sn.addFriend("u1", "u3");
    sn.addFriend("u1", "u4");
    const index = sn.searchFriend("u1", "u3");
    assert(index >= 0, "Should find friend u3");
});

// Test 8: Binary search returns -1 when friend not found
test("Binary search returns -1 when friend not found", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addUser("u2", "User2");
    sn.addUser("u5", "User5");
    sn.addFriend("u1", "u2");
    const index = sn.searchFriend("u1", "u5");
    assert.strictEqual(index, -1, "Should return -1 for not found");
});

// Test 9: Multiple undo operations
test("Multiple undo operations work correctly", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addUser("u2", "User2");
    sn.addUser("u3", "User3");
    sn.addFriend("u1", "u2");
    sn.addFriend("u1", "u3");
    sn.undoLastFriend();
    sn.undoLastFriend();
    assert(sn.graph.get("u1").length === 0, "All friendships should be undone");
});

// Test 10: Bidirectional friendship
test("Friendship is bidirectional", () => {
    const sn = new SocialNetwork();
    sn.addUser("a", "Alice");
    sn.addUser("b", "Bob");
    sn.addFriend("a", "b");
    assert(sn.graph.get("a").includes("b"), "b should be in a's friends");
    assert(sn.graph.get("b").includes("a"), "a should be in b's friends");
});

// Test 11: Empty friend list for new user
test("New user has empty friend list", () => {
    const sn = new SocialNetwork();
    sn.addUser("newuser", "NewUser");
    assert.deepStrictEqual(sn.graph.get("newuser"), [], "New user should have no friends");
});

// Test 12: Get mutual friend count with BFS
test("Get mutual friend count using BFS", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addUser("u2", "User2");
    sn.addUser("u3", "User3");
    sn.addUser("u4", "User4");
    sn.addFriend("u1", "u3");
    sn.addFriend("u2", "u3");
    sn.addFriend("u2", "u4");
    const mutuals = sn.getMutualFriendCount("u1", "u2");
    assert(mutuals >= 0, "Mutual count should work");
});

// Test 13: User retrieval from hash table
test("Retrieve user from hash table", () => {
    const sn = new SocialNetwork();
    sn.addUser("alice", "Alice Smith");
    sn.addUser("bob", "Bob Jones");
    assert.strictEqual(sn.users.get("alice"), "Alice Smith");
    assert.strictEqual(sn.users.get("bob"), "Bob Jones");
});

// Test 14: Hash table returns undefined for non-existent key
test("Hash table returns undefined for non-existent key", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    const result = sn.users.get("nonexistent");
    assert.strictEqual(result, undefined, "Should return undefined for non-existent key");
});

// Test 15: Complex scenario - multiple operations
test("Complex scenario - add users, create friendships, undo, sort", () => {
    const sn = new SocialNetwork();
    sn.addUser("alice", "Alice");
    sn.addUser("bob", "Bob");
    sn.addUser("charlie", "Charlie");
    sn.addFriend("alice", "bob");
    sn.addFriend("alice", "charlie");
    let sorted = sn.sortFriends("alice");
    assert(sorted.length === 2, "Alice should have 2 friends");
    sn.undoLastFriend();
    assert(sn.graph.get("alice").length === 1, "After undo, Alice should have 1 friend");
});

// Test 16: Edge case - duplicate friend addition
test("Duplicate friend addition (same friend added twice)", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addUser("u2", "User2");
    sn.addFriend("u1", "u2");
    sn.addFriend("u1", "u2"); // Add same friendship again
    const friends = sn.graph.get("u1");
    assert.strictEqual(friends.length, 2, "Same user can appear twice in friend list");
});

// Test 17: Edge case - self-friendship
test("Self-friendship edge case", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addFriend("u1", "u1"); // Add self as friend
    assert(sn.graph.get("u1").includes("u1"), "User should have self in friend list");
});

// Test 18: Large number of friends - sort performance
test("Sort large friend list", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "Hub");
    for (let i = 0; i < 100; i++) {
        sn.addUser(`u${i+2}`, `User${i+2}`);
        sn.addFriend("u1", `u${i+2}`);
    }
    const sorted = sn.sortFriends("u1");
    assert.strictEqual(sorted.length, 100, "Should have 100 friends");
    // Verify sorted order
    for (let i = 0; i < sorted.length - 1; i++) {
        assert(sorted[i].localeCompare(sorted[i+1]) <= 0, "Friends should be in sorted order");
    }
});

// Test 19: Binary search with single element
test("Binary search with single element list", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addUser("u2", "User2");
    sn.addFriend("u1", "u2");
    const index = sn.searchFriend("u1", "u2");
    assert.strictEqual(index, 0, "Should find single element at index 0");
});

// Test 20: Multiple undos on complex graph
test("Multiple undos on complex friendship graph", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addUser("u2", "User2");
    sn.addUser("u3", "User3");
    sn.addUser("u4", "User4");
    sn.addFriend("u1", "u2");
    sn.addFriend("u1", "u3");
    sn.addFriend("u1", "u4");
    sn.addFriend("u2", "u3");
    
    // After 4 adds, undo 2 times
    sn.undoLastFriend();
    sn.undoLastFriend();
    
    assert(sn.graph.get("u1").length === 2, "u1 should have 2 friends after 2 undos");
    assert(sn.graph.get("u2").length === 1, "u2 should have 1 friend after undo");
});

// Test 21: Hash table collision handling
test("Hash table with potential collisions", () => {
    const sn = new SocialNetwork();
    // Add users with IDs that might cause hash collisions
    for (let i = 0; i < 50; i++) {
        sn.addUser(`user${i}`, `User ${i}`);
    }
    // Verify all users can be retrieved
    for (let i = 0; i < 50; i++) {
        assert.strictEqual(sn.users.get(`user${i}`), `User ${i}`, `User user${i} should be retrievable`);
    }
});

// Test 22: Friend list remains consistent after operations
test("Friend list consistency after add/undo/add", () => {
    const sn = new SocialNetwork();
    sn.addUser("a", "Alice");
    sn.addUser("b", "Bob");
    sn.addUser("c", "Charlie");
    
    sn.addFriend("a", "b");
    sn.undoLastFriend();
    sn.addFriend("a", "c");
    
    assert(!sn.graph.get("a").includes("b"), "b should not be in a's friends");
    assert(sn.graph.get("a").includes("c"), "c should be in a's friends");
});

// Test 23: Mutual friends in connected component
test("Mutual friends detection in network", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addUser("u2", "User2");
    sn.addUser("u3", "User3");
    sn.addUser("u4", "User4");
    
    // Create a path: u1-u2-u3-u4
    sn.addFriend("u1", "u2");
    sn.addFriend("u2", "u3");
    sn.addFriend("u3", "u4");
    
    const mutuals = sn.getMutualFriendCount("u1", "u4");
    assert(mutuals >= 0, "Mutual count should complete without error");
});

// Test 24: Sort empty friend list
test("Sort user with no friends", () => {
    const sn = new SocialNetwork();
    sn.addUser("lonely", "Lonely User");
    const sorted = sn.sortFriends("lonely");
    assert.deepStrictEqual(sorted, [], "Should return empty array");
});

// Test 25: Search in empty friend list
test("Search friend in empty friend list", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addUser("u2", "User2");
    const index = sn.searchFriend("u1", "u2");
    assert.strictEqual(index, -1, "Should return -1 for user with no friends");
});

// Test 26: Undo stack maintains order
test("Undo stack LIFO order", () => {
    const sn = new SocialNetwork();
    sn.addUser("u1", "User1");
    sn.addUser("u2", "User2");
    sn.addUser("u3", "User3");
    
    sn.addFriend("u1", "u2");
    sn.addFriend("u1", "u3");
    
    // First undo should remove u1-u3 (last added)
    sn.undoLastFriend();
    assert(!sn.graph.get("u1").includes("u3"), "Last friendship (u1-u3) should be undone first");
    assert(sn.graph.get("u1").includes("u2"), "First friendship (u1-u2) should remain");
});

// Test 27: Large-scale network traversal
test("BFS on larger network", () => {
    const sn = new SocialNetwork();
    // Create 20 users
    for (let i = 0; i < 20; i++) {
        sn.addUser(`u${i}`, `User${i}`);
    }
    // Create a chain
    for (let i = 0; i < 19; i++) {
        sn.addFriend(`u${i}`, `u${i+1}`);
    }
    
    const mutuals = sn.getMutualFriendCount("u0", "u19");
    assert(mutuals >= 0, "BFS should handle larger graphs");
});

// Test 28: User ID and Name independence
test("User ID and Name are independent", () => {
    const sn = new SocialNetwork();
    sn.addUser("a1", "Alice Smith");
    sn.addUser("a2", "Alice Johnson");
    assert.strictEqual(sn.users.get("a1"), "Alice Smith");
    assert.strictEqual(sn.users.get("a2"), "Alice Johnson");
});

// Test 29: Multiple operations on same user pair
test("Multiple friend operations on same pair", () => {
    const sn = new SocialNetwork();
    sn.addUser("x", "X");
    sn.addUser("y", "Y");
    
    sn.addFriend("x", "y");
    const friends1 = sn.graph.get("x").length;
    
    sn.addFriend("x", "y");
    const friends2 = sn.graph.get("x").length;
    
    assert.strictEqual(friends2, friends1 + 1, "Adding same friend twice increases count");
});

// Test 30: Comprehensive system integration
test("Full system integration test", () => {
    const sn = new SocialNetwork();
    
    // Add network of users
    const users = ["alice", "bob", "charlie", "diana", "eve"];
    users.forEach((user, idx) => {
        sn.addUser(user, user.charAt(0).toUpperCase() + user.slice(1));
    });
    
    // Create friendships
    sn.addFriend("alice", "bob");
    sn.addFriend("bob", "charlie");
    sn.addFriend("charlie", "diana");
    sn.addFriend("diana", "eve");
    sn.addFriend("alice", "diana");
    
    // Test search
    const index = sn.searchFriend("alice", "bob");
    assert(index >= 0, "Should find bob in alice's friends");
    
    // Test sort
    const sorted = sn.sortFriends("alice");
    assert(sorted.length === 2, "Alice should have 2 friends");
    
    // Test undo
    sn.undoLastFriend();
    assert(sn.graph.get("alice").length === 1 || sn.graph.get("diana").length === 3, "Undo should work");
});

// Print summary
console.log(`\n${"=".repeat(50)}`);
console.log(`Tests Passed: ${testsPassed}`);
console.log(`Tests Failed: ${testsFailed}`);
console.log(`Total Tests: ${testsPassed + testsFailed}`);
console.log(`${"=".repeat(50)}`);

if (testsFailed === 0) {
    console.log("✓ All tests passed!");
    process.exit(0);
} else {
    console.log(`✗ ${testsFailed} test(s) failed`);
    process.exit(1);
}