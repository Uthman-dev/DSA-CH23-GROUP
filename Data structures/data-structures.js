


// Hash table with linear probing and proper resizing (optional)
class HashTable {
    constructor(size = 50) {
        this.table = new Array(size);
        this.size = size;
        this.count = 0;
    }

    _hash(key) {
        let hash = 0;
        const str = String(key);
        for (let i = 0; i < str.length; i++) {
            hash = (hash * 31 + str.charCodeAt(i)) % this.size;
        }
        return hash;
    }

    set(key, value) {
        let index = this._hash(key);
        const start = index;
        while (this.table[index] !== undefined) {
            if (this.table[index].key === key) {
                this.table[index].value = value;
                return;
            }
            index = (index + 1) % this.size;
            if (index === start) {
                // Table is full – could resize, but we'll throw for simplicity
                throw new Error('Hash table is full');
            }
        }
        this.table[index] = { key, value };
        this.count++;
    }

    get(key) {
        let index = this._hash(key);
        const start = index;
        while (this.table[index] !== undefined) {
            if (this.table[index].key === key) return this.table[index].value;
            index = (index + 1) % this.size;
            if (index === start) break;
        }
        return undefined;
    }

    remove(key) {
        let index = this._hash(key);
        const start = index;
        while (this.table[index] !== undefined) {
            if (this.table[index].key === key) {
                this.table[index] = undefined;
                this.count--;
                // Optional: rehash cluster to avoid broken chains
                this._rehashFrom(index);
                return true;
            }
            index = (index + 1) % this.size;
            if (index === start) break;
        }
        return false;
    }

    _rehashFrom(startIndex) {
        // After deletion, rehash subsequent entries to maintain probing
        let index = (startIndex + 1) % this.size;
        while (this.table[index] !== undefined) {
            const entry = this.table[index];
            this.table[index] = undefined;
            this.count--;
            this.set(entry.key, entry.value);
            index = (index + 1) % this.size;
        }
    }

    entries() {
        const result = [];
        for (let i = 0; i < this.size; i++) {
            if (this.table[i] !== undefined) {
                result.push(this.table[i]);
            }
        }
        return result;
    }

    keys() {
        return this.entries().map(e => e.key);
    }

    values() {
        return this.entries().map(e => e.value);
    }
}

// Stack
class Stack {
    constructor() {
        this.items = [];
    }
    push(item) { this.items.push(item); }
    pop() { return this.items.pop() || null; }
    peek() { return this.items[this.items.length - 1] || null; }
    isEmpty() { return this.items.length === 0; }
    size() { return this.items.length; }
}

// Queue
class Queue {
    constructor() {
        this.items = [];
    }
    enqueue(item) { this.items.push(item); }
    dequeue() { return this.items.shift(); }
    isEmpty() { return this.items.length === 0; }
    size() { return this.items.length; }
}

// MinHeap for Top-K recommendations
class MinHeap {
    constructor() {
        this.heap = [];
    }

    insert(node) {
        // node: { id, mutuals }
        this.heap.push(node);
        this._bubbleUp(this.heap.length - 1);
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.heap[index].mutuals >= this.heap[parent].mutuals) break;
            [this.heap[index], this.heap[parent]] = [this.heap[parent], this.heap[index]];
            index = parent;
        }
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this._sinkDown(0);
        }
        return min;
    }

    _sinkDown(index) {
        const length = this.heap.length;
        while (true) {
            let left = 2 * index + 1;
            let right = 2 * index + 2;
            let smallest = index;
            if (left < length && this.heap[left].mutuals < this.heap[smallest].mutuals) {
                smallest = left;
            }
            if (right < length && this.heap[right].mutuals < this.heap[smallest].mutuals) {
                smallest = right;
            }
            if (smallest === index) break;
            [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
            index = smallest;
        }
    }

    size() {
        return this.heap.length;
    }

    // For debugging: get sorted list (ascending by mutuals)
    toSortedArray() {
        // We'll extract all elements and sort (not destructive)
        const copy = this.heap.slice();
        copy.sort((a, b) => a.mutuals - b.mutuals || a.id.localeCompare(b.id));
        return copy;
    }
}

module.exports = { HashTable, Stack, Queue, MinHeap };