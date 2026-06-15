# Advanced Data Structures & Algorithms: Social Network Project

**Course:** Data Structures & Algorithms (Chapter 23: System Design)  
**Status:** Complete | **Last Updated:** June 2026

A scalable, in-memory social network system demonstrating the practical application of advanced data structures and algorithms to optimize user management, friendship networks, and friend recommendations.

---

## 🚀 Problem Statement & Solution
**Challenge:** Efficiently handle user registration, bidirectional friendships, undo operations, and friend recommendations at scale.  
**Solution:** Leverage optimized data structures: Hash Tables for O(1) lookups, Graphs for relationship modeling, Stacks for undo history, and Min-Heaps for priority-based recommendations.

---

## ✨ Features & Complexity

| Feature | Data Structure | Time Complexity | Use Case |
| :--- | :--- | :--- | :--- |
| **Add User** | Hash Table | O(1) avg | Fast user registration |
| **Create Friendship** | Graph + Hash Table | O(1) | Instant bidirectional connection |
| **Undo Friend Action** | Stack | O(n)* | Reverse last operation |
| **Sort Friends** | Merge Sort | O(n log n) | Alphabetical ranking |
| **Search Friend** | Binary Search | O(log n) | Quick friend lookup |
| **Mutual Friends** | BFS + Queue | O(V+E) | Network analysis |
| **Top-K Recommendations**| Min Heap | O(n log k) | Friend suggestions |

*\*Undo is O(n) in baseline due to array filtering.*

---

## 🏗️ Architecture
The system follows a clean, modular architecture with separation of concerns:
- **`app.js` (UI Layer):** Readline-based interactive CLI for user input and result display.
- **`system.js` (Business Logic):** `SocialNetwork` class orchestrating high-level operations and state management.
- **`data-structures.js` (Core DS):** Custom implementations of Hash Table (linear probing), Stack, Queue, and Min-Heap.
- **`algorithms.js` (Algorithms):** Custom implementations of Merge Sort and Binary Search.

---

## 📦 Installation & Usage

### Prerequisites
- Node.js v12 or higher
- npm (comes with Node.js)

### Setup
```bash
# Clone the repository
git clone <repository-link>
cd Advanced-Data-Structures-Social-Network

# No external dependencies required (pure Node.js)