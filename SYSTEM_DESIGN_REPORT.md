# System Design Report: Advanced Data Structures & Algorithms
## Social Network Project (Facebook-Lite - Theme A, Variant A1)

**Course:** Data Structures & Algorithms (Chapter 23: System Design)  
**Date:** June 2026 | **Version:** 2.0 (Condensed)

---

## 1. Executive Summary
This report documents the system design of a scalable Social Network application using the 5-step system design methodology. The project demonstrates the practical application of advanced data structures (Hash Tables, Graphs, Stacks, Queues, Min-Heaps) and algorithms (Merge Sort, Binary Search, BFS) to build an efficient platform. The system handles friend relationships, enables fast user lookups, supports undo operations, and provides friend recommendations with optimal time-space tradeoffs, scaling from a single-server in-memory model to a distributed sharded architecture.

---

## 2. Step 1: Use Cases Generation
The system is driven by 8 core use cases, each mapped to specific data structures to guarantee performance bounds.

| Use Case | Actor | Data Structure | Time Complexity | Description |
| :--- | :--- | :--- | :--- | :--- |
| **User Registration** | New User | Hash Table | O(1) avg | Store unique user ID and name. |
| **Create Friendship** | Registered User | Graph (Adj. List) | O(1) | Add bidirectional edge; push to undo stack. |
| **Undo Last Action** | Registered User | Stack (LIFO) | O(n)* | Pop last action and filter array to remove edge. |
| **Sort Friend List** | User / Analytics | Merge Sort | O(n log n) | Alphabetically sort friends for browsing/search. |
| **Search Friend** | Registered User | Binary Search | O(log n) | Quick lookup in a pre-sorted friend list. |
| **Find Mutual Friends** | Recommendation Sys | BFS + Queue | O(V + E) | Traverse graph to count shared connections. |
| **Top-K Recommendations**| Recommendation Sys | Min-Heap | O(n log k) | Maintain top-K candidates based on mutual count. |

*\*Undo is O(n) in baseline due to array filtering; optimized to O(1) in Phase 1 via linked structures.*

---

## 3. Step 2: Constraints & Analysis
### 3.1 Functional & Non-Functional Requirements
- **Functional:** O(1) user lookup, bidirectional friendships, single-level undo, alphabetical sorting, mutual friend analysis, top-K recommendations.
- **Non-Functional:** <10ms latency for O(1) ops, support 1M+ users, efficient memory usage (~250MB for 1M users in-memory).

### 3.2 Preliminary Bottleneck Analysis
| Bottleneck | Trigger | Cost | Impact | Severity |
| :--- | :--- | :--- | :--- | :--- |
| Hash Collisions | Load factor > 0.75 | O(n) vs O(1) | User lookup slow | HIGH |
| Array Filtering | Undo with many friends | O(n) per undo | Undo operation slow | MEDIUM |
| Single-Threaded | Concurrent requests | Sequential exec | Throughput limit | HIGH |
| Dense Graph BFS | High friendship density | O(V²) possible | Recommendation latency | MEDIUM |
| Repeated Sorts | Repeated UI requests | O(n log n) each | CPU waste | LOW |

---

## 4. Step 3: Basic Design
### 4.1 High-Level Architecture
The system follows a modular, layered architecture:
1. **Application Layer (`app.js`):** CLI interface handling user input and menu routing.
2. **Business Logic Layer (`system.js`):** `SocialNetwork` class orchestrating state management.
3. **Data Structure Layer (`data-structures.js`):** Custom Hash Table, Stack, Queue, and Min-Heap.
4. **Algorithm Layer (`algorithms.js`):** Custom Merge Sort and Binary Search.

### 4.2 In-Memory Data Model
- **Users:** `HashTable<userId, userName>` for O(1) lookups.
- **Friendship Graph:** `HashTable<userId, Array<friendId>>` (Adjacency List).
- **Undo History:** `Stack<Action>` storing `{type, id1, id2, timestamp}`.
- **Recommendations:** `MinHeap` storing `{userId, mutualCount}`.

### 4.3 Core Algorithm Selection
- **Merge Sort:** Guarantees O(n log n) stable sorting, prerequisite for binary search.
- **Binary Search:** Reduces friend lookup from O(n) to O(log n).
- **BFS:** Utilizes FIFO Queue for level-by-level graph traversal (O(V+E)).
- **Min-Heap:** Maintains priority queue of size *K* for O(n log k) recommendation generation.

---

## 5. Step 4: Identify Bottlenecks (Refined)
Detailed analysis confirms that while baseline operations meet academic requirements, production scaling requires addressing:
1. **Hash Table Degradation:** Fixed-size tables cause linear probing to degrade to O(n).
2. **Blocking Operations:** Node.js single-threaded event loop blocks during heavy O(n log n) sorts or O(V+E) BFS traversals.
3. **Brute-Force Recommendations:** Calculating mutual friends for all 1M non-friend candidates is computationally prohibitive without pruning.

---

## 6. Step 5: Scalability & Optimization Strategy
A phased scalability plan is proposed to evolve the system from a local prototype to a global platform.

### Phase 1: Single-Server Optimizations (Immediate)
- **Dynamic Hash Resizing:** Double table size when load factor > 0.75 (amortized O(1)).
- **Improved Hash Function:** Replace character sum with polynomial rolling hash to minimize collisions.
- **Sort Caching:** Memoize sorted friend arrays; invalidate cache only on friendship changes (reduces repeated sorts to O(1)).
- **Bidirectional BFS:** Run simultaneous BFS from both users, stopping when frontiers meet (reduces average complexity to O(√V)).

### Phase 2: Master-Slave Replication (1M – 10M Users)
- **Read-Write Splitting:** Route writes to a primary master node; route reads (sort, search, recommendations) to read replicas.
- **Async Log Shipping:** Maintain eventual consistency across replicas.

### Phase 3: Distributed Sharding (10M – 100M Users)
- **User Sharding:** Distribute users via `shard_id = hash(user_id) % num_shards`.
- **Distributed Graph Queries:** Use a message queue (e.g., Kafka) for cross-shard friendship updates and hierarchical BFS for parallel aggregation.

### Phase 4: Fully Distributed Microservices (100M+ Users)
- Transition to geo-sharded NoSQL (Cassandra), Redis for caching, and Elasticsearch for advanced discovery.

### 6.1 Cost-Benefit Analysis
| Optimization | Benefit | Cost | Feasibility |
| :--- | :--- | :--- | :--- |
| Dynamic Resizing | Prevents O(n) lookup degradation | O(n) resize op (amortized) | High |
| Sort Caching | 10x faster repeated requests | Minor memory overhead | High |
| Bidirectional BFS | ~50% faster mutual friend calc | Increased code complexity | Medium |
| Sharding | 10x user capacity scaling | Network latency, eventual consistency | Medium |

---

## 7. Conclusion
This project successfully demonstrates how selecting the right data structures directly impacts system performance at scale. By leveraging Hash Tables for O(1) lookups, Graphs for relationship modeling, and Heaps for priority-based recommendations, the system meets its core functional requirements. The identified bottlenecks are well-understood, and the phased optimization strategy provides a clear, realistic roadmap for scaling the application from 1 million to over 100 million users without sacrificing core performance guarantees.