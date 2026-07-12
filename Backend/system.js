
const { HashTable, Stack, Queue, MinHeap } = require('../Data structures/data-structures');
const { mergeSort, binarySearch } = require('../Data structures/algorithms');

class SocialNetwork {
    constructor() {
        this.users = new HashTable();   // id -> name
        this.graph = new HashTable();   // id -> array of friend ids
        this.undoStack = new Stack();
    }

    // ----- User management -----
    addUser(id, name) {
        if (!id || typeof id !== 'string') throw new Error('Invalid user ID');
        if (!name || typeof name !== 'string') throw new Error('Invalid user name');
        if (this.users.get(id) !== undefined) {
            throw new Error(`User with ID "${id}" already exists`);
        }
        this.users.set(id, name);
        this.graph.set(id, []);
    }

    getUser(id) {
        return this.users.get(id);
    }

    getAllUsers() {
        return this.users.entries(); // returns [{key, value}, ...]
    }

    // ----- Friendship management -----
    addFriend(id1, id2) {
        if (id1 === id2) throw new Error('Cannot befriend yourself');
        if (!this.users.get(id1) || !this.users.get(id2)) {
            throw new Error('One or both users do not exist');
        }
        // We allow duplicate friendships (as per original tests)
        const friends1 = this.graph.get(id1) || [];
        const friends2 = this.graph.get(id2) || [];
        friends1.push(id2);
        friends2.push(id1);
        this.graph.set(id1, friends1);
        this.graph.set(id2, friends2);
        this.undoStack.push({ action: 'addFriend', id1, id2 });
    }

    undoLastFriend() {
        const last = this.undoStack.pop();
        if (!last) return "Nothing to undo";
        const { id1, id2 } = last;
        // Remove only the last occurrence (matching the added pair)
        let f1 = this.graph.get(id1);
        let f2 = this.graph.get(id2);
        // Remove one instance of id2 from f1, and one instance of id1 from f2
        const index1 = f1.lastIndexOf(id2);
        if (index1 !== -1) f1.splice(index1, 1);
        const index2 = f2.lastIndexOf(id1);
        if (index2 !== -1) f2.splice(index2, 1);
        this.graph.set(id1, f1);
        this.graph.set(id2, f2);
        return `Undone friendship between ${id1} and ${id2}`;
    }

    // ----- Friend list utilities -----
    getFriends(userId) {
        return this.graph.get(userId) || [];
    }

    sortFriends(userId) {
        const friends = this.getFriends(userId);
        return mergeSort(friends.slice()); // return sorted copy
    }

    searchFriend(userId, targetId) {
        const sorted = this.sortFriends(userId);
        return binarySearch(sorted, targetId);
    }

    // ----- Mutual friend count (BFS) -----
    getMutualFriendCount(id1, id2) {
        if (!this.users.get(id1) || !this.users.get(id2)) {
            throw new Error('One or both users do not exist');
        }
        // BFS from id1, but we only care about direct friends of id2
        const friends2 = new Set(this.getFriends(id2));
        const visited = new Set();
        const queue = new Queue();
        queue.enqueue(id1);
        visited.add(id1);
        let mutuals = 0;

        while (!queue.isEmpty()) {
            const current = queue.dequeue();
            const neighbors = this.getFriends(current);
            for (const friend of neighbors) {
                if (!visited.has(friend)) {
                    visited.add(friend);
                    if (friends2.has(friend)) mutuals++;
                    queue.enqueue(friend);
                }
            }
        }
        return mutuals;
    }

    // ----- Top-K recommendations (using MinHeap) -----
    getTopKRecommendations(userId, k = 3) {
        if (!this.users.get(userId)) {
            throw new Error(`User "${userId}" does not exist`);
        }
        const myFriends = new Set(this.getFriends(userId));
        myFriends.add(userId); // exclude self

        const heap = new MinHeap();
        const allUsers = this.getAllUsers();

        for (const { key: candidateId } of allUsers) {
            if (myFriends.has(candidateId)) continue;
            const mutuals = this.getMutualFriendCount(userId, candidateId);
            heap.insert({ id: candidateId, mutuals });
            if (heap.size() > k) {
                heap.extractMin();
            }
        }

        // The heap contains the top K (largest mutuals) but in no particular order.
        // Extract and sort for display.
        const result = [];
        while (heap.size() > 0) {
            result.push(heap.extractMin());
        }
        // Sort descending by mutuals (most mutuals first)
        result.sort((a, b) => b.mutuals - a.mutuals || a.id.localeCompare(b.id));
        return result;
    }

    getState() {
        return {
            users: this.users.entries(),
            usersTable: this.users.table,
            graph: this.graph.entries(),
            graphTable: this.graph.table,
            undoStack: this.undoStack.items.slice()
        };
    }
}

module.exports = SocialNetwork;