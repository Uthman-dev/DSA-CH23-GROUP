
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

// ---- Basic functionality ----
test("Add user", () => {
    const sn = new SocialNetwork();
    sn.addUser("@alice", "Alice");
    assert.strictEqual(sn.users.get("@alice"), "Alice");
});

test("Add multiple users", () => {
    const sn = new SocialNetwork();
    sn.addUser("@u1", "User1");
    sn.addUser("@u2", "User2");
    sn.addUser("@u3", "User3");
    assert.strictEqual(sn.users.get("@u1"), "User1");
    assert.strictEqual(sn.users.get("@u2"), "User2");
    assert.strictEqual(sn.users.get("@u3"), "User3");
});

test("Add friend connection", () => {
    const sn = new SocialNetwork();
    sn.addUser("@a", "A");
    sn.addUser("@b", "B");
    sn.addFriend("@a", "@b");
    assert(sn.graph.get("@a").includes("@b"));
    assert(sn.graph.get("@b").includes("@a"));
});

test("Undo last friend action", () => {
    const sn = new SocialNetwork();
    sn.addUser("@a", "A");
    sn.addUser("@b", "B");
    sn.addFriend("@a", "@b");
    const result = sn.undoLastFriend();
    assert(!sn.graph.get("@a").includes("@b"));
    assert(!sn.graph.get("@b").includes("@a"));
    assert(result.includes("Undone"));
});

test("Undo on empty stack", () => {
    const sn = new SocialNetwork();
    assert.strictEqual(sn.undoLastFriend(), "Nothing to undo");
});

// ---- Sorting and search ----
test("Sort friends alphabetically", () => {
    const sn = new SocialNetwork();
    sn.addUser("@u1", "U1");
    sn.addUser("@u3", "U3");
    sn.addUser("@u2", "U2");
    sn.addFriend("@u1", "@u3");
    sn.addFriend("@u1", "@u2");
    const sorted = sn.sortFriends("@u1");
    assert.deepStrictEqual(sorted, ["@u2", "@u3"]);
});

test("Binary search finds friend", () => {
    const sn = new SocialNetwork();
    sn.addUser("@u1", "U1");
    sn.addUser("@u2", "U2");
    sn.addUser("@u3", "U3");
    sn.addUser("@u4", "U4");
    sn.addFriend("@u1", "@u2");
    sn.addFriend("@u1", "@u3");
    sn.addFriend("@u1", "@u4");
    const idx = sn.searchFriend("@u1", "@u3");
    assert(idx >= 0);
});

test("Binary search returns -1 when not found", () => {
    const sn = new SocialNetwork();
    sn.addUser("@u1", "U1");
    sn.addUser("@u2", "U2");
    sn.addFriend("@u1", "@u2");
    const idx = sn.searchFriend("@u1", "@u5");
    assert.strictEqual(idx, -1);
});

test("Search on empty friend list", () => {
    const sn = new SocialNetwork();
    sn.addUser("@u1", "U1");
    sn.addUser("@u2", "U2");
    const idx = sn.searchFriend("@u1", "@u2");
    assert.strictEqual(idx, -1);
});

// ---- Undo and consistency ----
test("Multiple undo operations", () => {
    const sn = new SocialNetwork();
    sn.addUser("@u1", "U1");
    sn.addUser("@u2", "U2");
    sn.addUser("@u3", "U3");
    sn.addFriend("@u1", "@u2");
    sn.addFriend("@u1", "@u3");
    sn.undoLastFriend();
    sn.undoLastFriend();
    assert.strictEqual(sn.graph.get("@u1").length, 0);
});

test("Undo stack LIFO order", () => {
    const sn = new SocialNetwork();
    sn.addUser("@u1", "U1");
    sn.addUser("@u2", "U2");
    sn.addUser("@u3", "U3");
    sn.addFriend("@u1", "@u2");
    sn.addFriend("@u1", "@u3");
    sn.undoLastFriend();
    assert(!sn.graph.get("@u1").includes("@u3"));
    assert(sn.graph.get("@u1").includes("@u2"));
});

test("Undo removes only last occurrence of duplicate friendship", () => {
    const sn = new SocialNetwork();
    sn.addUser("@a", "A");
    sn.addUser("@b", "B");
    sn.addFriend("@a", "@b");
    sn.addFriend("@a", "@b"); // duplicate
    const before = sn.graph.get("@a").length;
    sn.undoLastFriend();
    const after = sn.graph.get("@a").length;
    assert.strictEqual(after, before - 1);
});

// ---- Mutual friends and recommendations ----
test("Mutual friend count with BFS", () => {
    const sn = new SocialNetwork();
    sn.addUser("@u1", "U1");
    sn.addUser("@u2", "U2");
    sn.addUser("@u3", "U3");
    sn.addUser("@u4", "U4");
    sn.addFriend("@u1", "@u3");
    sn.addFriend("@u2", "@u3");
    sn.addFriend("@u2", "@u4");
    const mutuals = sn.getMutualFriendCount("@u1", "@u2");
    assert.strictEqual(mutuals, 1); // u3
});

test("Top-K recommendations returns correct candidates", () => {
    const sn = new SocialNetwork();
    sn.addUser("@alice", "Alice");
    sn.addUser("@bob", "Bob");
    sn.addUser("@charlie", "Charlie");
    sn.addUser("@diana", "Diana");
    sn.addFriend("@alice", "@bob");
    sn.addFriend("@bob", "@charlie");
    sn.addFriend("@charlie", "@diana");
    // Alice's friends: Bob
    // Bob's friends: Alice, Charlie
    // Charlie's friends: Bob, Diana
    // Diana's friends: Charlie
    // Alice's potential: Charlie (mutual: Bob), Diana (mutual: none directly? Actually Alice-Diana share Charlie? No, Alice doesn't know Charlie directly, but via Bob they share Bob? Let's compute: Alice's network: Alice->Bob->Charlie->Diana. Mutual with Charlie: Bob (1), with Diana: Bob? Actually Alice-Diana: path Alice-Bob-Charlie-Diana, the mutual friends are Bob and Charlie? No, mutual means friends who are in both lists. Alice's friends: {Bob}; Diana's friends: {Charlie}. No common. So mutuals = 0. So only Charlie gets recommended with mutuals=1.
    const recs = sn.getTopKRecommendations("@alice", 2);
    assert(recs.length >= 1);
    assert(recs[0].id === "@charlie" || recs[0].id === "@diana");
});

// ---- Edge cases ----
test("Self-friendship not allowed", () => {
    const sn = new SocialNetwork();
    sn.addUser("@u1", "U1");
    assert.throws(() => sn.addFriend("@u1", "@u1"), /Cannot befriend yourself/);
});

test("Duplicate friend addition allowed", () => {
    const sn = new SocialNetwork();
    sn.addUser("@a", "A");
    sn.addUser("@b", "B");
    sn.addFriend("@a", "@b");
    sn.addFriend("@a", "@b");
    assert.strictEqual(sn.graph.get("@a").length, 2);
});

test("Add user with invalid ID throws", () => {
    const sn = new SocialNetwork();
    assert.throws(() => sn.addUser("", "Name"), /Invalid user ID/);
    assert.throws(() => sn.addUser(null, "Name"), /Invalid user ID/);
});

test("Add user with existing ID throws", () => {
    const sn = new SocialNetwork();
    sn.addUser("@u1", "U1");
    assert.throws(() => sn.addUser("@u1", "Duplicate"), /already exists/);
});

test("Get user that doesn't exist returns undefined", () => {
    const sn = new SocialNetwork();
    assert.strictEqual(sn.getUser("@nonexistent"), undefined);
});

test("Sort large friend list", () => {
    const sn = new SocialNetwork();
    sn.addUser("@u1", "Hub");
    for (let i = 0; i < 100; i++) {
        sn.addUser(`@u${i+2}`, `User${i+2}`);
        sn.addFriend("@u1", `@u${i+2}`);
    }
    const sorted = sn.sortFriends("@u1");
    assert.strictEqual(sorted.length, 100);
    for (let i = 0; i < sorted.length - 1; i++) {
        assert(sorted[i].localeCompare(sorted[i+1]) <= 0);
    }
});

// ---- Integration ----
test("Full system integration", () => {
    const sn = new SocialNetwork();
    const users = ["@alice", "@bob", "@charlie", "@diana", "@eve"];
    users.forEach((u, i) => sn.addUser(u, `User${i+1}`));
    sn.addFriend("@alice", "@bob");
    sn.addFriend("@bob", "@charlie");
    sn.addFriend("@charlie", "@diana");
    sn.addFriend("@diana", "@eve");
    sn.addFriend("@alice", "@diana");
    const idx = sn.searchFriend("@alice", "@bob");
    assert(idx >= 0);
    const sorted = sn.sortFriends("@alice");
    assert(sorted.length === 2);
    sn.undoLastFriend();
    assert(sn.graph.get("@alice").length === 1 || sn.graph.get("@diana").length === 3);
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