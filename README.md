# Advanced Data Structures & Algorithms: Social Network Project
**Course:** Data Structures & Algorithms (Chapter 23: System Design)  
**Theme:** A1 (Friends graph + mutual-friends recommendation)  
**Status:** Complete | **Last Updated:** June 2026

A scalable, in-memory social network system demonstrating the practical application of advanced data structures and algorithms to optimize user management, friendship networks, and friend recommendations.

---

## 🚀 Problem Statement & Solution
**Challenge:** Efficiently handle user registration, bidirectional friendships, undo operations, and friend recommendations at scale.  
**Solution:** Leverage optimized data structures: Hash Tables for O(1) lookups, Graphs for relationship modeling, Stacks for undo history, and Min-Heaps for priority-based recommendations.

---

## 📋 Chapter 23: 5-Step Design Methodology
*(Explicitly labeled as per project requirements)*
1. **[STEP 1: Use Cases Generation](#-features--use-cases)**: 8 core use cases mapped to specific data structures.
2. **[STEP 2: Constraints & Analysis](#-complexity-analysis--benchmarks)**: Functional/non-functional requirements, scale limits, and benchmark measurements.
3. **[STEP 3: Basic Design](#-architecture--system-design)**: Layered architecture, in-memory data models, and DSA justification.
4. **[STEP 4: Bottlenecks](#-bottlenecks)**: Identification of 6 key performance limits (e.g., array filtering on undo, dense graph BFS).
5. **[STEP 5: Scalability](#-scalability-roadmap)**: 4-phase roadmap from single-server caching to distributed sharding and microservices.

---

## ✨ Features & Use Cases
| Feature | Data Structure | Time Complexity | Use Case |
| :--- | :--- | :--- | :--- |
| **Add User** | Hash Table | O(1) avg | Fast user registration |
| **Create Friendship** | Graph + Hash Table | O(1) | Instant bidirectional connection |
| **Undo Friend Action** | Stack | O(n)* | Reverse last operation |
| **Sort Friends** | Merge Sort | O(n log n) | Alphabetical ranking |
| **Search Friend** | Binary Search | O(log n) | Quick friend lookup |
| **Mutual Friends** | BFS + Queue | O(V+E) | Network analysis |
| **Top-K Recommendations**| Min Heap | O(n log k) | Friend suggestions |

*\*Undo is O(n) in baseline due to array filtering; optimized to O(1) in Phase 1 via linked structures.*

---

## 🏗️ Architecture & System Design
### System Architecture Diagram
*[Insert Architecture Diagram Image Here: e.g., `architecture.png`]*
*(Note: The system follows a clean, modular architecture: `app.js` (CLI) → `system.js` (Business Logic) → `data-structures.js` & `algorithms.js` (Core implementations))*

### Data Flow
1. User inputs command via CLI (`app.js`).
2. `system.js` validates input and orchestrates the operation.
3. Core operations delegate to custom `HashTable`, `Graph`, `Stack`, `Queue`, or `MinHeap` in `data-structures.js`.
4. Sorting and searching delegate to `Merge Sort` and `Binary Search` in `algorithms.js`.
5. Result is formatted and returned to the CLI.

---

## 📦 Installation & Usage

### Prerequisites
- Node.js v12 or higher
- npm (comes with Node.js)

### Setup & Execution
```bash
# Clone the repository
git clone <repository-link>
cd Advanced-Data-Structures-Social-Network

# No external dependencies required (pure Node.js)

# Start interactive CLI
npm start
# OR
node app.js

# Run the comprehensive test suite
npm test