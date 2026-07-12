const readline = require('readline');
const SocialNetwork = require('./system');

const sn = new SocialNetwork();
let lastRecommendations = [];

function seedData() {
    try {
        sn.addUser('@alice', 'Alice');
        sn.addUser('@bob', 'Bob');
        sn.addUser('@charlie', 'Charlie');
        sn.addUser('@diana', 'Diana');
        sn.addFriend('@alice', '@bob');
        sn.addFriend('@bob', '@charlie');
        sn.addFriend('@charlie', '@diana');
    } catch (error) {
        // Ignore duplicate seed errors.
    }
}

seedData();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: '> '
});

function clearScreen() {
    process.stdout.write('\u001b[2J\u001b[0f');
}

function line(char = '-', count = 44) {
    return char.repeat(count);
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => resolve(answer.trim()));
    });
}

function getStats() {
    const users = sn.getAllUsers();
    let totalEdges = 0;

    for (const entry of users) {
        totalEdges += (sn.getFriends(entry.key) || []).length;
    }

    const userCount = users.length;
    const connections = totalEdges / 2;
    const maxConnections = (userCount * (userCount - 1)) / 2;

    return {
        users: userCount,
        connections,
        density: maxConnections ? connections / maxConnections : 0,
        avgDegree: userCount ? (connections * 2) / userCount : 0,
    };
}

function printHeader() {
    console.log('\n+------------------------------------------+');
    console.log('|              SocialGraph CLI            |');
    console.log('+------------------------------------------+\n');
    console.log('network visualizer');
    console.log('local standalone terminal demo\n');
}

function printSeedInfo() {
    console.log('Pre-loaded data:');
    console.log('  Users: @alice(Alice), @bob(Bob), @charlie(Charlie), @diana(Diana)');
    console.log('  Friends: @alice<->@bob, @bob<->@charlie, @charlie<->@diana');
    console.log('  The CLI mirrors the frontend actions but runs entirely in Node.\n');
}

function printMenu() {
    console.log(line());
    console.log('CONTROLS');
    console.log(line());
    console.log('  [1] Add User');
    console.log('  [2] Connect Friends');
    console.log('  [3] Undo Last Friend');
    console.log('  [4] Get Top-K Recommendations');
    console.log('  [5] Binary Search Friend');
    console.log('  [6] Show Stats + Data Views');
    console.log('  [7] Exit');
    console.log(line() + '\n');
}

function printStateSummary() {
    const users = sn.getAllUsers();
    const stats = getStats();

    console.log('\nLIVE GRAPH');
    console.log(line());
    if (users.length === 0) {
        console.log('  Add users to see the graph');
    } else {
        for (const entry of users) {
            const friends = sn.getFriends(entry.key);
            console.log(`  ${entry.value} (${entry.key}) -> ${friends.length ? friends.join(', ') : 'none'}`);
        }
    }

    console.log('\nSTATS');
    console.log(line());
    console.log(`  Users: ${stats.users}`);
    console.log(`  Connections: ${stats.connections}`);
    console.log(`  Density: ${stats.density.toFixed(2)}`);
    console.log(`  Avg Degree: ${stats.avgDegree.toFixed(1)}`);

    console.log('\nHASH TABLE');
    console.log(line());
    const userTable = sn.users.table;
    if (!userTable.some((slot) => slot !== undefined)) {
        console.log('  empty');
    } else {
        userTable.forEach((slot, index) => {
            if (slot === undefined) {
                console.log(`  ${String(index).padStart(2, '0')}: .`);
            } else {
                console.log(`  ${String(index).padStart(2, '0')}: ${slot.key} -> ${slot.value}`);
            }
        });
    }

    console.log('\nENTRIES');
    console.log(line());
    if (users.length === 0) {
        console.log('  empty');
    } else {
        users.forEach((entry) => {
            console.log(`  ${entry.key}: ${entry.value}`);
        });
    }

    console.log('\nUNDO STACK');
    console.log(line());
    if (sn.undoStack.items.length === 0) {
        console.log('  empty');
    } else {
        sn.undoStack.items.slice().reverse().forEach((item, index) => {
            const prefix = index === 0 ? '-> ' : '   ';
            console.log(`  ${prefix}${item.action}: ${item.id1} <-> ${item.id2}`);
        });
    }

    console.log('\nRECOMMENDATION HEAP');
    console.log(line());
    if (lastRecommendations.length === 0) {
        console.log('  run option 4 to populate');
    } else {
        lastRecommendations.forEach((item) => {
            console.log(`  ${item.id}: ${item.mutuals} mutuals`);
        });
    }

    console.log('\nGRAPH SOURCE');
    console.log(line());
    if (users.length === 0) {
        console.log('  empty');
    } else {
        users.forEach((entry) => {
            console.log(`  ${entry.key}: [${sn.getFriends(entry.key).join(', ')}]`);
        });
    }
}

async function main() {
    clearScreen();
    printHeader();
    printSeedInfo();
    printMenu();

    while (true) {
        const choice = await askQuestion('Enter your choice (1-7): ');

        try {
            switch (choice) {
                case '1': {
                    const id = await askQuestion('  -> Enter User ID (must start with @): ');
                    const name = await askQuestion('  -> Enter User Name: ');
                    sn.addUser(id, name);
                    console.log(`  OK Added user ${name} (${id})`);
                    break;
                }
                case '2': {
                    const id1 = await askQuestion('  -> Enter User 1 ID: ');
                    const id2 = await askQuestion('  -> Enter User 2 ID: ');
                    sn.addFriend(id1, id2);
                    console.log(`  OK Connected ${id1} <-> ${id2}`);
                    break;
                }
                case '3': {
                    const result = sn.undoLastFriend();
                    console.log(`  OK ${result}`);
                    break;
                }
                case '4': {
                    const id = await askQuestion('  -> Enter User ID for recommendations: ');
                    const k = await askQuestion('  -> Number of recommendations (default 3): ');
                    const kNum = parseInt(k, 10) || 3;
                    lastRecommendations = sn.getTopKRecommendations(id, kNum);
                    if (lastRecommendations.length === 0) {
                        console.log(`  No recommendations for ${id}`);
                    } else {
                        console.log(`  Top ${lastRecommendations.length} recommendation(s) for ${id}:`);
                        lastRecommendations.forEach((item, index) => {
                            console.log(`    ${index + 1}. ${item.id} (${item.mutuals} mutuals)`);
                        });
                    }
                    break;
                }
                case '5': {
                    const id1 = await askQuestion('  -> Enter User ID: ');
                    const targetId = await askQuestion('  -> Enter Friend ID to search: ');
                    const index = sn.searchFriend(id1, targetId);
                    if (index >= 0) {
                        console.log(`  Found ${targetId} at index ${index} in ${id1}'s sorted list`);
                    } else {
                        console.log(`  ${targetId} not found in ${id1}'s friend list`);
                    }
                    break;
                }
                case '6': {
                    printStateSummary();
                    break;
                }
                case '7': {
                    console.log('\nThank you! Goodbye!\n');
                    rl.close();
                    process.exit(0);
                }
                default: {
                    console.log('  Invalid choice. Please enter 1-7.');
                }
            }
        } catch (error) {
            console.log(`  Error: ${error.message}`);
        }

        printMenu();
    }
}

main().catch(console.error);
