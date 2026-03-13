# Firebase Migration Guide

## Overview

This guide explains how to migrate your Caffernaum system from localStorage to Firebase Firestore. The process involves:

1. Setting up Firebase (already done - see FIREBASE_GUIDE.md)
2. Updating each HTML file to use Firebase
3. Testing and verifying everything works

---

## Key Concepts

### localStorage (OLD WAY)
```javascript
// Save data locally in browser
localStorage.setItem('caffeInventory', JSON.stringify(items));

// Load data from browser
const items = JSON.parse(localStorage.getItem('caffeInventory'));

// Problems: 
// - Only in one browser/device
// - Doesn't persist across computers
// - No real-time sync between staff devices
```

### Firebase Firestore (NEW WAY)
```javascript
// Save data to cloud database
await addDoc(collection(db, "inventory"), itemData);

// Load data from cloud
const querySnapshot = await getDocs(collection(db, "inventory"));

// Benefits:
// - Accessible from any device/browser
// - Real-time updates across all users
// - Automatic backup
// - Scalable
```

---

## Migration Steps

### Step 0: Firebase Setup (REQUIRED FIRST)

Before updating any files, complete the Firebase setup:

1. Create Firebase project: https://console.firebase.google.com/
2. Get Firebase config and update `firebase-config.js`
3. Enable Firestore Database
4. Set security rules (see FIREBASE_GUIDE.md)

⚠️ **If you skip this, the HTML files won't work!**

---

### Step 1: Understanding the Pattern

All operations follow this pattern:

```javascript
// OLD (localStorage)
const items = JSON.parse(localStorage.getItem('caffeInventory')) || [];

// NEW (Firebase)
import { collection, getDocs } from 'firebase-config.js';

const querySnapshot = await getDocs(collection(db, "inventory"));
const items = [];
querySnapshot.forEach((doc) => {
  items.push({ id: doc.id, ...doc.data() });
});
```

Key differences:
- **Async/await**: Firebase is asynchronous (waits for network)
- **Collection name**: Use string like "inventory" instead of localStorage keys
- **Document ID**: Firebase auto-generates or you assign it

---

### Step 2: Update inventory.html

#### 2a. Add Firebase imports to script section

**FIND THIS:**
```html
<script>
  // Cart Management System
  class InventoryManager {
```

**ADD THIS BEFORE IT:**
```html
<script type="module">
  import { 
    db, 
    collection, 
    addDoc, 
    getDocs,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    onSnapshot,
    serverTimestamp
  } from './firebase-config.js';
```

#### 2b. Update InventoryManager.constructor()

**FIND THIS:**
```javascript
constructor() {
  this.items = JSON.parse(localStorage.getItem('caffeInventory')) || [
    // ... default items
  ];
  this.initInventory();
}
```

**REPLACE WITH:**
```javascript
constructor() {
  this.items = [];
  this.init();
}

async init() {
  await this.loadInventory();
  this.setupRealtimeListener();
}
```

#### 2c. Add Firebase load method

**ADD THIS NEW METHOD:**
```javascript
async loadInventory() {
  try {
    const querySnapshot = await getDocs(collection(db, "inventory"));
    this.items = [];
    
    querySnapshot.forEach((doc) => {
      this.items.push({ id: doc.id, ...doc.data() });
    });
    
    console.log("✅ Loaded", this.items.length, "inventory items");
    return this.items;
  } catch (error) {
    console.error("Error loading inventory:", error);
    return [];
  }
}
```

#### 2d. Replace saveInventory() with setupRealtimeListener()

**FIND THIS:**
```javascript
saveInventory() {
  localStorage.setItem('caffeInventory', JSON.stringify(this.items));
}
```

**REPLACE WITH:**
```javascript
setupRealtimeListener() {
  onSnapshot(collection(db, "inventory"), (snapshot) => {
    this.items = [];
    snapshot.forEach((doc) => {
      this.items.push({ id: doc.id, ...doc.data() });
    });
    this.renderAll();
    this.updateCounts();
  });
}
```

#### 2e. Update addNewItem() method

**FIND THIS:**
```javascript
async addNewItem(itemData) {
  // ... form data collection ...
  this.items.push(newItem);
  this.saveInventory();
}
```

**REPLACE WITH:**
```javascript
async addNewItem(itemData) {
  try {
    const newItem = {
      name: document.getElementById('itemName').value,
      sku: document.getElementById('itemSku').value,
      description: document.getElementById('itemDesc').value,
      category: document.getElementById('itemCategory').value,
      unit: document.getElementById('itemUnit').value,
      currentStock: parseInt(document.getElementById('itemStock').value),
      maxStock: parseInt(document.getElementById('itemMaxStock').value),
      price: parseInt(document.getElementById('itemPrice').value)
    };

    const docRef = await addDoc(collection(db, "inventory"), {
      ...newItem,
      createdAt: serverTimestamp()
    });

    console.log("✅ Item added with ID:", docRef.id);
    this.closeAddModal();
  } catch (error) {
    console.error("Error adding item:", error);
    alert("Error adding item: " + error.message);
  }
}
```

#### 2f. Update removeItem() method

**FIND THIS:**
```javascript
removeItem(id) {
  if (confirm("Delete this item?")) {
    this.items = this.items.filter(i => i.id !== id);
    this.saveInventory();
  }
}
```

**REPLACE WITH:**
```javascript
async removeItem(id) {
  try {
    if (!confirm("Delete this item?")) return;
    
    await deleteDoc(doc(db, "inventory", id));
    console.log("✅ Item deleted");
  } catch (error) {
    console.error("Error deleting item:", error);
    alert("Error deleting item: " + error.message);
  }
}
```

#### 2g. Update restock() method

**FIND THIS:**
```javascript
restock(id) {
  const item = this.items.find(i => i.id === id);
  if (item) item.currentStock += 10;
  this.saveInventory();
}
```

**REPLACE WITH:**
```javascript
async restock(id) {
  try {
    const itemRef = doc(db, "inventory", id);
    const itemSnap = await getDoc(itemRef);
    
    if (itemSnap.exists()) {
      const currentStock = itemSnap.data().currentStock;
      await updateDoc(itemRef, {
        currentStock: currentStock + 10,
        lastUpdated: serverTimestamp()
      });
      console.log("✅ Item restocked");
    }
  } catch (error) {
    console.error("Error restocking:", error);
  }
}
```

#### 2h. Initialize at the bottom

**FIND THIS:**
```javascript
const inventory = new InventoryManager();
```

**CHANGE TO:**
```javascript
let inventory;
document.addEventListener('DOMContentLoaded', async () => {
  inventory = new InventoryManager();
});
</script>
```

---

### Step 3: Update staff.html

#### 3a. Add Firebase imports

**ADD THE SAME IMPORT BLOCK** as Step 2a

#### 3b. Update OrderManager constructor

**FIND THIS:**
```javascript
constructor() {
  this.orders = JSON.parse(localStorage.getItem('caffeOrders')) || [];
  this.init();
}
```

**REPLACE WITH:**
```javascript
constructor() {
  this.orders = [];
  this.init();
}

async init() {
  await this.loadOrders();
  this.setupRealtimeListener();
  this.setupFilterButtons();
}

async loadOrders() {
  try {
    const querySnapshot = await getDocs(collection(db, "orders"));
    this.orders = [];
    
    querySnapshot.forEach((doc) => {
      this.orders.push({ id: doc.id, ...doc.data() });
    });
    
    console.log("✅ Loaded", this.orders.length, "orders");
    return this.orders;
  } catch (error) {
    console.error("Error loading orders:", error);
    return [];
  }
}

setupRealtimeListener() {
  onSnapshot(collection(db, "orders"), (snapshot) => {
    this.orders = [];
    snapshot.forEach((doc) => {
      this.orders.push({ id: doc.id, ...doc.data() });
    });
    
    this.renderOrders();
    this.updateStats();
    this.updateCounts();
  });
}
```

#### 3c. Update updateStatus() method

**FIND THIS:**
```javascript
updateStatus(orderId, newStatus) {
  const orderIndex = this.orders.findIndex(o => o.id === orderId);
  if (orderIndex !== -1) {
    this.orders[orderIndex].status = newStatus;
    localStorage.setItem('caffeOrders', JSON.stringify(this.orders));
  }
}
```

**REPLACE WITH:**
```javascript
async updateStatus(orderId, newStatus) {
  try {
    const orderRef = doc(db, "orders", orderId);
    await updateDoc(orderRef, {
      status: newStatus,
      lastUpdated: serverTimestamp()
    });
    console.log("✅ Order updated");
  } catch (error) {
    console.error("Error updating order:", error);
  }
}
```

---

### Step 4: Update index.html (Customer Site)

#### 4a. Add Firebase imports

**ADD THIS IN THE SCRIPT SECTION:**
```html
<script type="module">
  import { 
    db, 
    collection, 
    addDoc,
    serverTimestamp
  } from './firebase-config.js';
```

#### 4b. Update ShoppingCart.checkout()

**FIND THIS:**
```javascript
checkout(e) {
  e.preventDefault();
  // ... order data ...
  let orders = JSON.parse(localStorage.getItem('caffeOrders')) || [];
  orders.push(order);
  localStorage.setItem('caffeOrders', JSON.stringify(orders));
}
```

**REPLACE WITH:**
```javascript
async checkout(e) {
  e.preventDefault();
  
  try {
    const formData = new FormData(e.target);
    const order = {
      id: 'ORD' + Date.now(),
      items: this.items,
      total: this.getTotal(),
      status: 'new',
      customer: {
        name: formData.get('name'),
        phone: formData.get('phone'),
        address: formData.get('address'),
        deliveryTime: formData.get('deliveryTime'),
        notes: formData.get('notes')
      },
      createdAt: serverTimestamp(),
      timestamp: Date.now()
    };

    // Save to Firebase
    const docRef = await addDoc(collection(db, "orders"), order);
    
    alert(`✓ Order Placed!\nOrder ID: ${order.id}\nTotal: ₱${order.total}`);
    
    this.items = [];
    this.save();
    e.target.reset();
    this.closeCart();
  } catch (error) {
    console.error("Error placing order:", error);
    alert("Error placing order: " + error.message);
  }
}
```

---

## Testing the Migration

### Test Checklist

- [ ] Firebase config is updated (not placeholder values)
- [ ] All HTML files load without errors in browser console
- [ ] Inventory items can be added from the form
- [ ] New items appear in real-time (no page refresh needed)
- [ ] Inventory items can be deleted
- [ ] Stock counts update correctly
- [ ] Orders can be placed from customer site
- [ ] Orders appear in staff dashboard in real-time
- [ ] Order status can be changed
- [ ] Multiple browser windows sync in real-time

### Debugging

**If you see errors:**

1. **"Firebase not initialized"**
   - Check firebase-config.js has your actual config
   - Check imports are correct

2. **"Permission denied" error**
   - Go to Firestore Console → Rules
   - Make sure test mode rules are published

3. **"Cannot read property 'items' of undefined"**
   - Make sure functions are async/await
   - Check database structure in Firestore Console

4. **Real-time updates not working**
   - Check onSnapshot listener is set up correctly
   - Verify data exists in Firestore Console

---

## Firebase Console Debugging

Once items are saved, you can view them in Firebase Console:

1. Go to https://console.firebase.google.com/
2. Select your project
3. Click "Firestore Database"
4. Expand "inventory" collection
5. You'll see all your items with their data fields

This is helpful to verify data is being saved correctly!

---

## Summary: localStorage vs Firebase

| Feature | localStorage | Firebase |
|---------|--------------|----------|
| Storage Location | Only in browser | Cloud database |
| Multiple Devices | ❌ No | ✅ Yes |
| Real-time Sync | ❌ No | ✅ Yes |
| Backup | ❌ No | ✅ Yes (automatic) |
| Capacity | ~5-10MB | 1GB free tier |
| Cost | Free | Free (development tier) |
| Setup Time | None | ~10 minutes |

---

## Next Steps

1. Complete Firebase setup (see FIREBASE_GUIDE.md)
2. Update firebase-config.js with your credentials
3. Migrate each HTML file following the steps above
4. Test everything works
5. Check Firebase Console to verify data is saving

Questions? Check:
- FIREBASE_GUIDE.md (detailed operations)
- firebase-examples.js (code examples)
- Firebase docs: https://firebase.google.com/docs/firestore
