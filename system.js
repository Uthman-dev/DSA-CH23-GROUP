const { HashTable, Stack, Queue, MinHeap } = require('./data-structures');
const { mergeSort, binarySearch } = require('./algorithms');

class SocialNetwork {
    constructor() {
        this.users = new HashTable(); // Maps ID -> Name
        this.graph = new HashTable(); // Maps ID -> Array of friend IDs
        this.undoStack = new Stack();
    }

    addUser(id, name) {
        this.users.set(id, name);
        this.graph.set(id, []); // Initialize empty friend list
    }

    addFriend(id1, id2) {
        this.graph.get(id1).push(id2);
        this.graph.get(id2).push(id1);
        this.undoStack.push({ action: 'addFriend', id1, id2 });
    }

    undoLastFriend() {
        const lastAction = this.undoStack.pop();
        if (!lastAction) return "Nothing to undo";
        const { id1, id2 } = lastAction;
        // Remove id2 from id1's list
        let friends1 = this.graph.get(id1);
        this.graph.set(id1, friends1.filter(f => f !== id2));
        // Remove id1 from id2's list
        let friends2 = this.graph.get(id2);
        this.graph.set(id2, friends2.filter(f => f !== id1));
        return `Undone friendship between ${id1} and ${id2}`;
    }

    // BFS to find mutual friends
    getMutualFriendCount(id1, id2) {
        const queue = new Queue();
        const visited = new Set();
        queue.enqueue(id1);
        visited.add(id1);
        let mutuals = 0;
        
        while (!queue.isEmpty()) {
            let current = queue.dequeue();
            let friends = this.graph.get(current);
            for (let f of friends) {
                if (!visited.has(f)) {
                    visited.add(f);
                    if (this.graph.get(id2).includes(f)) mutuals++;
                    queue.enqueue(f);
                }
            }
        }
        return mutuals;
    }

    // Use Heap for Top-K recommendations
    getTopKRecommendations(userId, k) {
        const heap = new MinHeap();
        const myFriends = this.graph.get(userId);
        const allUsers = []; // Mocking getting all users
        // In a real system, we'd iterate over a list. Let's assume we check non-friends
        // We skip proper iteration for brevity, assuming we pass a list of candidate IDs
        // For each candidate that is NOT the user and NOT a direct friend:
        // let mutuals = this.getMutualFriendCount(userId, candidate);
        // heap.insert({ id: candidate, mutuals });
        // if (heap.size() > k) heap.extractMin(); // Keep only top K
        return heap.heap;
    }

    sortFriends(userId) {
        let friends = this.graph.get(userId);
        return mergeSort(friends); // O(n log n)
    }

    searchFriend(userId, targetId) {
        let sortedFriends = this.sortFriends(userId);
        return binarySearch(sortedFriends, targetId); // O(log n)
    }
}

module.exports = SocialNetwork;