// ----- Data Structures ----- 
function HashTable(size) {
  this.size = size || 50;
  this.table = new Array(this.size);
}
HashTable.prototype._hash = function(key) {
  let hash = 0;
  const str = String(key);
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % this.size;
  }
  return hash;
};
HashTable.prototype.set = function(key, value) {
  let index = this._hash(key);
  const start = index;
  while (this.table[index] !== undefined) {
    if (this.table[index].key === key) {
      this.table[index].value = value;
      return;
    }
    index = (index + 1) % this.size;
    if (index === start) throw new Error('Hash table is full');
  }
  this.table[index] = { key: key, value: value };
};
HashTable.prototype.get = function(key) {
  let index = this._hash(key);
  const start = index;
  while (this.table[index] !== undefined) {
    if (this.table[index].key === key) return this.table[index].value;
    index = (index + 1) % this.size;
    if (index === start) break;
  }
  return undefined;
};
HashTable.prototype.entries = function() {
  const result = [];
  for (let i = 0; i < this.size; i++) {
    if (this.table[i] !== undefined) result.push(this.table[i]);
  }
  return result;
};

function Stack() { this.items = []; }
Stack.prototype.push = function(item) { this.items.push(item); };
Stack.prototype.pop = function() { return this.items.pop() || null; };

function Queue() { this.items = []; }
Queue.prototype.enqueue = function(item) { this.items.push(item); };
Queue.prototype.dequeue = function() { return this.items.shift(); };
Queue.prototype.isEmpty = function() { return this.items.length === 0; };

function MinHeap() { this.heap = []; }
MinHeap.prototype.insert = function(node) {
  this.heap.push(node);
  this._bubbleUp(this.heap.length - 1);
};
MinHeap.prototype._bubbleUp = function(index) {
  while (index > 0) {
    const parent = Math.floor((index - 1) / 2);
    if (this.heap[index].mutuals >= this.heap[parent].mutuals) break;
    const temp = this.heap[index];
    this.heap[index] = this.heap[parent];
    this.heap[parent] = temp;
    index = parent;
  }
};
MinHeap.prototype.extractMin = function() {
  if (this.heap.length === 0) return null;
  const min = this.heap[0];
  const end = this.heap.pop();
  if (this.heap.length > 0) {
    this.heap[0] = end;
    this._sinkDown(0);
  }
  return min;
};
MinHeap.prototype._sinkDown = function(index) {
  const length = this.heap.length;
  while (true) {
    let left = 2 * index + 1;
    let right = 2 * index + 2;
    let smallest = index;
    if (left < length && this.heap[left].mutuals < this.heap[smallest].mutuals) smallest = left;
    if (right < length && this.heap[right].mutuals < this.heap[smallest].mutuals) smallest = right;
    if (smallest === index) break;
    const temp = this.heap[index];
    this.heap[index] = this.heap[smallest];
    this.heap[smallest] = temp;
    index = smallest;
  }
};
MinHeap.prototype.size = function() { return this.heap.length; };

function mergeSort(arr) {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    if (left[i].localeCompare(right[j]) <= 0) result.push(left[i++]);
    else result.push(right[j++]);
  }
  return result.concat(left.slice(i)).concat(right.slice(j));
}

function binarySearch(sortedArr, target) {
  let left = 0, right = sortedArr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (sortedArr[mid] === target) return mid;
    if (sortedArr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}

// ----- Social Network -----
function SocialNetwork() {
  this.users = new HashTable();
  this.graph = new HashTable();
  this.undoStack = new Stack();
}
SocialNetwork.prototype.addUser = function(id, name) {
  if (!id || typeof id !== 'string') throw new Error('Invalid user ID');
  if (!name || typeof name !== 'string') throw new Error('Invalid user name');
  if (this.users.get(id) !== undefined) throw new Error('User with ID "' + id + '" already exists');
  this.users.set(id, name);
  this.graph.set(id, []);
};
SocialNetwork.prototype.addFriend = function(id1, id2) {
  if (id1 === id2) throw new Error('Cannot befriend yourself');
  if (!this.users.get(id1) || !this.users.get(id2)) throw new Error('One or both users do not exist');
  const friends1 = this.graph.get(id1) || [];
  const friends2 = this.graph.get(id2) || [];
  friends1.push(id2);
  friends2.push(id1);
  this.graph.set(id1, friends1);
  this.graph.set(id2, friends2);
  this.undoStack.push({ action: 'addFriend', id1: id1, id2: id2 });
};
SocialNetwork.prototype.undoLastFriend = function() {
  const last = this.undoStack.pop();
  if (!last) return 'Nothing to undo';
  const f1 = this.graph.get(last.id1) || [];
  const f2 = this.graph.get(last.id2) || [];
  const index1 = f1.lastIndexOf(last.id2);
  const index2 = f2.lastIndexOf(last.id1);
  if (index1 !== -1) f1.splice(index1, 1);
  if (index2 !== -1) f2.splice(index2, 1);
  this.graph.set(last.id1, f1);
  this.graph.set(last.id2, f2);
  return 'Removed connection between ' + last.id1 + ' and ' + last.id2;
};
SocialNetwork.prototype.getAllUsers = function() { return this.users.entries(); };
SocialNetwork.prototype.getFriends = function(userId) { return this.graph.get(userId) || []; };
SocialNetwork.prototype.sortFriends = function(userId) { return mergeSort((this.getFriends(userId) || []).slice()); };
SocialNetwork.prototype.searchFriend = function(userId, targetId) { return binarySearch(this.sortFriends(userId), targetId); };
SocialNetwork.prototype.getMutualFriendCount = function(id1, id2) {
  if (!this.users.get(id1) || !this.users.get(id2)) throw new Error('One or both users do not exist');
  const friends2 = new Set(this.getFriends(id2));
  const visited = new Set([id1]);
  const queue = new Queue();
  queue.enqueue(id1);
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
};
SocialNetwork.prototype.getTopKRecommendations = function(userId, k) {
  k = k || 3;
  if (!this.users.get(userId)) throw new Error('User "' + userId + '" does not exist');
  const myFriends = new Set(this.getFriends(userId));
  myFriends.add(userId);
  const heap = new MinHeap();
  const allUsers = this.getAllUsers();
  for (const entry of allUsers) {
    const candidateId = entry.key;
    if (myFriends.has(candidateId)) continue;
    const mutuals = this.getMutualFriendCount(userId, candidateId);
    heap.insert({ id: candidateId, mutuals: mutuals });
    if (heap.size() > k) heap.extractMin();
  }
  const result = [];
  while (heap.size() > 0) result.push(heap.extractMin());
  result.sort(function(a, b) { return b.mutuals - a.mutuals || a.id.localeCompare(b.id); });
  return result;
};

// ----- UI & Graph -----
const canvas = document.getElementById('graph-canvas');
const ctx = canvas.getContext('2d');
const nodePos = new Map();
const sn = new SocialNetwork();
let lastRecommendations = [];
let logicalWidth = 0, logicalHeight = 0;
let mouseX = -1000, mouseY = -1000;
let hoveredNode = null;

function log(msg, type = 'info') {
  const el = document.getElementById('log-output');
  const time = new Date().toLocaleTimeString('en-US', { hour12: false });
  const colorClass = `log-${type}`;
  el.innerHTML += `<div class="log-entry ${colorClass}"><span class="log-time">[${time}]</span> <span>${msg}</span></div>`;
  el.scrollTop = el.scrollHeight;
}

function showStatus(msg, type) {
  const el = document.getElementById('status');
  el.textContent = msg;
  el.className = 'status-msg ' + (type || '');
}

function renderDataViews() {
  const hashViz = document.getElementById('view-hash-viz');
  const table = sn.users.table;
  let html = '';
  for (let i = 0; i < table.length; i++) {
    const slot = table[i];
    const filled = slot !== undefined;
    const label = filled ? slot.key.replace('@', '') : '·';
    const cls = 'hash-cell' + (filled ? ' filled' : ' empty');
    const title = 'Index ' + i + ': ' + (filled ? slot.key + ' → ' + slot.value : 'empty');
    html += `<div class="${cls}" data-index="${String(i).padStart(2, '0')}" title="${title}">${label}</div>`;
  }
  hashViz.innerHTML = html;

  const hashEl = document.getElementById('view-hash');
  const entries = sn.users.entries();
  hashEl.innerHTML = entries.length === 0 ? '<span class="empty">No users added yet</span>' : entries.map(function(entry) {
    return `<div><span class="key">${entry.key}</span> <span>${entry.value}</span></div>`;
  }).join('');

  const stackEl = document.getElementById('view-stack');
  const items = sn.undoStack.items;
  stackEl.innerHTML = items.length === 0 ? '<span class="empty">No actions taken yet</span>' : items.slice().reverse().map(function(item, index) {
    const prefix = index === 0 ? '▸ ' : '  ';
    return `<div><span class="key">${prefix}${item.action}</span> <span>${item.id1} &harr; ${item.id2}</span></div>`;
  }).join('');

  renderHeap();

  document.getElementById('header-users').textContent = sn.users.entries().length;
  document.getElementById('hud-nodes').textContent = sn.users.entries().length;
  let totalEdges = 0;
  for (const entry of sn.users.entries()) {
    totalEdges += (sn.graph.get(entry.key) || []).length;
  }
  const edgeCount = Math.round(totalEdges / 2);
  document.getElementById('header-edges').textContent = edgeCount;
  document.getElementById('hud-edges').textContent = edgeCount;
}

function renderStats() {
  const entries = sn.users.entries();
  const users = entries.length;
  let totalEdges = 0;
  for (let i = 0; i < entries.length; i++) {
    totalEdges += (sn.graph.get(entries[i].key) || []).length;
  }
  const edges = totalEdges / 2;
  const maxEdges = (users * (users - 1)) / 2;
  document.getElementById('stat-users').textContent = users;
  document.getElementById('stat-edges').textContent = edges;
  document.getElementById('stat-density').textContent = maxEdges ? (edges / maxEdges).toFixed(2) : '0.0';
  document.getElementById('stat-degree').textContent = users ? ((edges * 2) / users).toFixed(1) : '0.0';
}

function renderDropdowns() {
  const entries = sn.users.entries();
  ['select-u1', 'select-u2'].forEach(function(id) {
    const el = document.getElementById(id);
    const current = el.value;
    let html = id === 'select-u1' ? '<option value="">Select first user...</option>' : '<option value="">Select second user...</option>';
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const selected = entry.key === current ? ' selected' : '';
      html += `<option value="${entry.key}"${selected}>${entry.value} (${entry.key})</option>`;
    }
    el.innerHTML = html;
  });
}

function renderHeap() {
  const heapEl = document.getElementById('view-heap');
  if (lastRecommendations.length === 0) {
    heapEl.innerHTML = '<span class="empty">Click "Recommend Friends" to see results</span>';
    return;
  }
  heapEl.innerHTML = lastRecommendations.map(function(item) {
    return `<div><span class="key">${item.id}</span> <span>${item.mutuals} mutuals</span></div>`;
  }).join('');
}

function renderAll() {
  renderDataViews();
  renderStats();
  renderDropdowns();
}

// ----- Graph Rendering -----
function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  logicalWidth = rect.width;
  logicalHeight = Math.max(450, Math.min(700, window.innerHeight * 0.65));
  
  canvas.width = logicalWidth * dpr;
  canvas.height = logicalHeight * dpr;
  canvas.style.width = logicalWidth + 'px';
  canvas.style.height = logicalHeight + 'px';
  
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawGraph() {
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);
  
  // Draw structural grid
  ctx.strokeStyle = '#0F0F0F';
  ctx.lineWidth = 1;
  const gridSize = 40;
  for (let x = 0; x <= logicalWidth; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, logicalHeight);
    ctx.stroke();
  }
  for (let y = 0; y <= logicalHeight; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(logicalWidth, y);
    ctx.stroke();
  }

  const entries = sn.users.entries();
  if (entries.length === 0) {
    ctx.fillStyle = '#404040';
    ctx.font = '700 14px Space Grotesk, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ADD USERS TO BUILD THE NETWORK', logicalWidth / 2, logicalHeight / 2);
    return;
  }

  for (let i = 0; i < entries.length; i++) {
    const key = entries[i].key;
    if (!nodePos.has(key)) {
      nodePos.set(key, {
        x: logicalWidth / 2 + (Math.random() - 0.5) * 100,
        y: logicalHeight / 2 + (Math.random() - 0.5) * 100,
        vx: 0, vy: 0
      });
    }
  }

  const nodes = entries.map(function(entry) {
    const pos = nodePos.get(entry.key);
    return { id: entry.key, name: entry.value, x: pos.x, y: pos.y, vx: pos.vx, vy: pos.vy };
  });

  // Physics simulation
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    for (let j = 0; j < nodes.length; j++) {
      if (node.id === nodes[j].id) continue;
      const dx = node.x - nodes[j].x;
      const dy = node.y - nodes[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = 1800 / (dist * dist);
      node.vx += (dx / dist) * force;
      node.vy += (dy / dist) * force;
    }
    const neighbors = sn.graph.get(node.id) || [];
    for (let j = 0; j < neighbors.length; j++) {
      const other = nodes.find(function(c) { return c.id === neighbors[j]; });
      if (!other) continue;
      const dx2 = other.x - node.x;
      const dy2 = other.y - node.y;
      const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
      const force2 = (dist2 - 150) * 0.04;
      node.vx += (dx2 / dist2) * force2;
      node.vy += (dy2 / dist2) * force2;
    }
    node.vx += (logicalWidth / 2 - node.x) * 0.005;
    node.vy += (logicalHeight / 2 - node.y) * 0.005;
    
    node.x += node.vx;
    node.y += node.vy;
    node.vx *= 0.85;
    node.vy *= 0.85;
    
    node.x = Math.max(40, Math.min(logicalWidth - 40, node.x));
    node.y = Math.max(40, Math.min(logicalHeight - 40, node.y));
    
    const pos = nodePos.get(node.id);
    pos.x = node.x; pos.y = node.y;
    pos.vx = node.vx; pos.vy = node.vy;
  }

  hoveredNode = null;
  for (let i = 0; i < nodes.length; i++) {
    const dx = mouseX - nodes[i].x;
    const dy = mouseY - nodes[i].y;
    if (Math.sqrt(dx * dx + dy * dy) < 20) {
      hoveredNode = nodes[i];
      break;
    }
  }

  // Draw edges
  const drawnEdges = new Set();
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const neighbors = sn.graph.get(node.id) || [];
    for (let j = 0; j < neighbors.length; j++) {
      const otherPos = nodePos.get(neighbors[j]);
      if (!otherPos) continue;
      const edgeKey = node.id < neighbors[j] ? node.id + '|' + neighbors[j] : neighbors[j] + '|' + node.id;
      if (drawnEdges.has(edgeKey)) continue;
      drawnEdges.add(edgeKey);
      
      const isHighlighted = hoveredNode && (hoveredNode.id === node.id || hoveredNode.id === neighbors[j]);
      
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(otherPos.x, otherPos.y);
      
      if (isHighlighted) {
        ctx.strokeStyle = '#F5C518';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
      }
      ctx.stroke();
    }
  }

  // Draw nodes
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const isHovered = hoveredNode && hoveredNode.id === node.id;
    const isConnected = hoveredNode && sn.graph.get(hoveredNode.id).includes(node.id);
    const radius = isHovered ? 10 : 8;
    
    // Outer Ring (White base)
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    
    // Inner Ring (Black void)
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();

    // Hovered state (Yellow center)
    if (isHovered) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = '#F5C518';
        ctx.fill();
    }

    // Label
    ctx.fillStyle = isHovered ? '#F5C518' : '#FFFFFF';
    ctx.font = `700 11px 'JetBrains Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(node.id, node.x, node.y - radius - 10);
    
    if (isHovered) {
        ctx.fillStyle = '#707070';
        ctx.font = `500 10px 'Space Grotesk', sans-serif`;
        ctx.fillText(node.name.toUpperCase(), node.x, node.y - radius - 24);
    }
  }
}

// ----- Event Listeners -----
canvas.addEventListener('mousemove', function(e) {
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

canvas.addEventListener('mouseleave', function() {
  mouseX = -1000;
  mouseY = -1000;
  hoveredNode = null;
});

document.getElementById('input-id').addEventListener('input', function() {
  const id = this.value.trim();
  const statusEl = document.getElementById('id-status');
  if (id.length === 0) {
    statusEl.textContent = '';
    statusEl.className = 'id-status';
    return;
  }
  if (!id.startsWith('@')) {
    statusEl.textContent = '⚠ Usernames must start with @';
    statusEl.className = 'id-status invalid';
    return;
  }
  if (id === '@') {
    statusEl.textContent = '⚠ Please enter a name after @';
    statusEl.className = 'id-status invalid';
    return;
  }
  if (sn.users.get(id) !== undefined) {
    statusEl.textContent = '✕ This username is already taken';
    statusEl.className = 'id-status unavailable';
  } else {
    statusEl.textContent = '✓ Username is available';
    statusEl.className = 'id-status available';
  }
});

function addUser() {
  const id = document.getElementById('input-id').value.trim();
  const name = document.getElementById('input-name').value.trim();
  if (!id || !name) { showStatus('Please enter both a username and a name.', 'error'); return; }
  if (!id.startsWith('@')) { showStatus('Usernames must start with @.', 'error'); return; }
  if (id === '@') { showStatus('Please enter a valid name after @.', 'error'); return; }
  try {
    sn.addUser(id, name);
    document.getElementById('input-id').value = '';
    document.getElementById('input-name').value = '';
    document.getElementById('id-status').textContent = '';
    document.getElementById('id-status').className = 'id-status';
    showStatus('User ' + name + ' created successfully.', 'success');
    log('Added user ' + id + ' (' + name + ').', 'success');
    renderAll();
  } catch (err) { showStatus('Error: ' + err.message, 'error'); log(err.message, 'error'); }
}

function addFriend() {
  const id1 = document.getElementById('select-u1').value;
  const id2 = document.getElementById('select-u2').value;
  if (!id1 || !id2) { showStatus('Please select two users to connect.', 'error'); return; }
  try {
    sn.addFriend(id1, id2);
    showStatus('Users connected successfully.', 'success');
    log('Connected ' + id1 + ' and ' + id2 + '.', 'success');
    renderAll();
  } catch (err) { showStatus('Error: ' + err.message, 'error'); log(err.message, 'error'); }
}

function undoFriend() {
  const msg = sn.undoLastFriend();
  const isSuccess = msg !== 'Nothing to undo';
  showStatus(msg, isSuccess ? 'success' : 'error');
  log(msg, isSuccess ? 'info' : 'error');
  renderAll();
}

function recommend() {
  const id = document.getElementById('select-u1').value;
  if (!id) { showStatus('Please select a user first.', 'error'); return; }
  try {
    lastRecommendations = sn.getTopKRecommendations(id, 3);
    renderHeap();
    const ids = lastRecommendations.map(function(r) { return r.id; }).join(', ');
    log('Found recommendations for ' + id + ': ' + (ids || 'none'), 'success');
    document.querySelector('.right-panel .tab[data-tab="heap"]')?.click();
    showStatus('Found ' + lastRecommendations.length + ' potential friends.', 'success');
  } catch (err) { showStatus('Error: ' + err.message, 'error'); log(err.message, 'error'); }
}

function searchFriend() {
  const id1 = document.getElementById('select-u1').value;
  const target = document.getElementById('input-search').value.trim();
  if (!id1) { showStatus('Please select a user first.', 'error'); return; }
  if (!target) { showStatus('Please enter a username to search.', 'error'); return; }
  const idx = sn.searchFriend(id1, target);
  if (idx >= 0) {
    log('Found ' + target + ' at index ' + idx + ' in ' + id1 + "'s friends list.", 'success');
    showStatus('Found ' + target + ' at index ' + idx + '.', 'success');
  } else {
    log('Search failed: ' + target + ' is not in ' + id1 + "'s friends list.", 'error');
    showStatus(target + ' was not found in the friends list.', 'error');
  }
}

document.querySelectorAll('.tabs').forEach(function(group) {
  group.querySelectorAll('.tab').forEach(function(tab) {
    tab.addEventListener('click', function() {
      const target = tab.dataset.tab;
      const parent = group.parentElement;
      parent.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
      parent.querySelectorAll('.tab-panel').forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById('panel-' + target).classList.add('active');
    });
  });
});

document.getElementById('btn-add-user').addEventListener('click', addUser);
document.getElementById('btn-add-friend').addEventListener('click', addFriend);
document.getElementById('btn-undo').addEventListener('click', undoFriend);
document.getElementById('btn-recommend').addEventListener('click', recommend);
document.getElementById('btn-search').addEventListener('click', searchFriend);

window.addEventListener('resize', function() { resizeCanvas(); });

function loop() {
  drawGraph();
  requestAnimationFrame(loop);
}

resizeCanvas();
renderAll();
log('System initialized.', 'success');
log('Waiting for user input...', 'info');
loop();