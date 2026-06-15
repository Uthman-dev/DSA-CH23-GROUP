const readline = require('readline');
const SocialNetwork = require('./system');

const sn = new SocialNetwork();

// Seed some data
sn.addUser("u1", "Alice");
sn.addUser("u2", "Bob");
sn.addUser("u3", "Charlie");
sn.addUser("u4", "Diana");
sn.addFriend("u1", "u2");
sn.addFriend("u2", "u3");
sn.addFriend("u3", "u4");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

console.log("\n╔════════════════════════════════════════════╗");
console.log("║   SOCIAL NETWORK CLI - Interactive Demo   ║");
console.log("╚════════════════════════════════════════════╝\n");
console.log("Pre-loaded data:");
console.log("  Users: u1(Alice), u2(Bob), u3(Charlie), u4(Diana)");
console.log("  Friends: u1↔u2, u2↔u3, u3↔u4\n");

function showMenu() {
    console.log("\n" + "─".repeat(44));
    console.log("MENU OPTIONS:");
    console.log("─".repeat(44));
    console.log("  [1] Add User");
    console.log("  [2] Add Friend");
    console.log("  [3] Undo Last Friend");
    console.log("  [4] Sort My Friends");
    console.log("  [5] Search Friend");
    console.log("  [6] Exit");
    console.log("─".repeat(44) + "\n");
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
}

async function main() {
    showMenu();

    while (true) {
        const choice = await askQuestion("Enter your choice (1-6): ");

        if (choice === '1') {
            const id = await askQuestion("  → Enter User ID: ");
            const name = await askQuestion("  → Enter User Name: ");
            sn.addUser(id, name);
            console.log(`  ✓ User "${name}" (${id}) added!\n`);
        }
        else if (choice === '2') {
            const id1 = await askQuestion("  → Enter User 1 ID: ");
            const id2 = await askQuestion("  → Enter User 2 ID: ");
            sn.addFriend(id1, id2);
            console.log(`  ✓ Friendship between ${id1} and ${id2} added!\n`);
        }
        else if (choice === '3') {
            const result = sn.undoLastFriend();
            console.log(`  ✓ ${result}\n`);
        }
        else if (choice === '4') {
            const id = await askQuestion("  → Enter User ID: ");
            const sorted = sn.sortFriends(id);
            if (sorted.length > 0) {
                console.log(`  ✓ Sorted Friends of ${id}: ${sorted.join(", ")}\n`);
            } else {
                console.log(`  ✗ User ${id} has no friends\n`);
            }
        }
        else if (choice === '5') {
            const id1 = await askQuestion("  → Enter User ID: ");
            const id2 = await askQuestion("  → Enter Friend ID to search: ");
            const index = sn.searchFriend(id1, id2);
            if (index >= 0) {
                console.log(`  ✓ Found! ${id2} at position ${index} in ${id1}'s list\n`);
            } else {
                console.log(`  ✗ ${id2} not found in ${id1}'s friend list\n`);
            }
        }
        else if (choice === '6') {
            console.log("\n✓ Thank you! Goodbye!\n");
            rl.close();
            process.exit(0);
        }
        else {
            console.log("  ✗ Invalid choice. Please enter 1-6.\n");
        }

        showMenu();
    }
}

main().catch(console.error);