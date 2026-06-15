// 1. HASH TABLE (Fast lookup for users)
class HashTable {
    constructor(size = 50) {
        this.table = new Array(size);
    }
    _hash(key) {
        let hash = 0;
        for (let i = 0; i < String(key).length; i++) {
            hash += String(key).charCodeAt(i);
        }
        return hash % this.table.length;
    }
    set(key, value) {
        let index = this._hash(key);
        // Linear probing for collision handling - also check if key exists to update
        let startIndex = index;
        while (this.table[index] !== undefined) {
            if (this.table[index].key === key) {
                // Key already exists, update the value
                this.table[index].value = value;
                return;
            }
            index = (index + 1) % this.table.length;
            // Safety check to avoid infinite loop
            if (index === startIndex) break;
        }
        // No existing key found, insert at empty slot
        this.table[index] = { key, value };
    }
    get(key) {
        let index = this._hash(key);
        while (this.table[index] !== undefined) {
            if (this.table[index].key === key) return this.table[index].value;
            index = (index + 1) % this.table.length;
        }
        return undefined;
    }
}

// 2. STACK (For Undo actions)
class Stack {
    constructor() { this.items = []; }
    push(item) { this.items.push(item); }
    pop() { return this.items.length ? this.items.pop() : null; }
    isEmpty() { return this.items.length === 0; }
}

// 3. QUEUE (For BFS)
class Queue {
    constructor() { this.items = []; }
    enqueue(item) { this.items.push(item); }
    dequeue() { return this.items.shift(); } // O(n) shift, but acceptable for this
    isEmpty() { return this.items.length === 0; }
}

// 4. MIN HEAP (For Top-K Recommendations)
class MinHeap {
    constructor() { this.heap = []; }
    insert(val) {
        this.heap.push(val);
        this.bubbleUp();
    }
    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let element = this.heap[index];
            let parentIndex = Math.floor((index - 1) / 2);
            let parent = this.heap[parentIndex];
            if (element.mutuals >= parent.mutuals) break;
            this.heap[index] = parent;
            this.heap[parentIndex] = element;
            index = parentIndex;
        }
    }
    extractMin() {
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown();
        }
        return min;
    }
    sinkDown() {
        let index = 0;
        const length = this.heap.length;
        const element = this.heap[0];
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let leftChild, rightChild;
            let swap = null;
            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex];
                if (leftChild.mutuals < element.mutuals) swap = leftChildIndex;
            }
            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex];
                if (
                    (swap === null && rightChild.mutuals < element.mutuals) ||
                    (swap !== null && rightChild.mutuals < leftChild.mutuals)
                ) {
                    swap = rightChildIndex;
                }
            }
            if (swap === null) break;
            this.heap[index] = this.heap[swap];
            this.heap[swap] = element;
            index = swap;
        }
    }
    size() { return this.heap.length; }
}

module.exports = { HashTable, Stack, Queue, MinHeap };