# Firebase Setup & Operations Guide for Caffernaum

## Table of Contents
1. [Firebase Project Setup](#firebase-project-setup)
2. [Firestore Database Structure](#firestore-database-structure)
3. [Basic Operations (CRUD)](#basic-operations-crud)
4. [Real-Time Listeners](#real-time-listeners)
5. [Query Examples](#query-examples)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)

---

## Firebase Project Setup

### Prerequisites
- Google Account (Gmail)
- Internet connection

### Step-by-Step Setup

#### 1. Create Firebase Project
```
1. Visit: https://console.firebase.google.com/
2. Click "+ Add Project"
3. Project Name: caffernaum
4. Click Continue
5. Uncheck "Enable Google Analytics" (optional)
6. Click "Create Project"
7. Wait 30 seconds for project creation
```

#### 2. Get Firebase Configuration
```
1. In Firebase Console, click the gear icon (⚙️) → "Project Settings"
2. Scroll to "Your Apps" section
3. Click "Web" icon (</>)
4. Register app with nickname: "caffernaum-web"
5. In "Your Firebase config", select "Config" option
6. Copy the entire firebaseConfig object
7. Paste into firebase-config.js (replace the placeholder)
```

**Example Firebase Config:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDk1a2b3c4d5e6f7g8h9i0j1k2l3m4n",
  authDomain: "caffernaum-abc123.firebaseapp.com",
  projectId: "caffernaum-abc123",
  storageBucket: "caffernaum-abc123.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc1234def5678"
};
```

#### 3. Create Firestore Database
```
1. In Firebase Console, go to "Firestore Database" (left menu)
2. Click "Create Database"
3. Location: Select region closest to you (e.g., us-east1)
4. Start in "Test Mode" (for development)
5. Click "Create"
6. Wait 1-2 minutes for database creation
```

#### 4. Set Security Rules
In Firestore Console, go to "Rules" tab and paste:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all reads and writes (test mode only)
    match /{document=**} {
      allow read, write: if true;
    }
    
    // For production, use:
    // match /inventory/{document=**} {
    //   allow read, write: if request.auth != null;
    // }
    // match /orders/{document=**} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

Click "Publish".

---

## Firestore Database Structure

### Collections Overview

**Collections** = Tables
**Documents** = Rows
**Fields** = Columns

```
caffernaum-project
├── inventory (Collection)
│   ├── item-001 (Document)
│   │   ├── name: "Arabica Beans"
│   │   ├── sku: "BEAN-ARA-001"
│   │   ├── category: "beans"
│   │   ├── currentStock: 50
│   │   ├── maxStock: 100
│   │   ├── price: 450
│   │   └── createdAt: 2024-06-15
│   ├── item-002 (Document)
│   └── ...
│
├── orders (Collection)
│   ├── ORD1718462400000 (Document)
│   │   ├── id: "ORD1718462400000"
│   │   ├── status: "new"
│   │   ├── items: [
│   │   │   { product: "Caramel Macchiato", quantity: 2, price: 319 }
│   │   │ ]
│   │   ├── customer: {
│   │   │   name: "John Doe",
│   │   │   phone: "09171234567",
│   │   │   deliveryTime: "ASAP"
│   │   │ }
│   │   ├── total: 638
│   │   ├── createdAt: 2024-06-15T10:30:00Z
│   │   └── timestamp: 1718462400000
│   └── ...
│
└── staff (Collection)
    ├── SF-00001 (Document)
    │   ├── employeeId: "CF-00001"
    │   ├── name: "Jamill Payapag"
    │   ├── position: "Lead Barista"
    │   ├── password: "coffee123" // Never store plain passwords!
    │   └── createdAt: 2024-06-15
    └── ...
```

---

## Basic Operations (CRUD)

### CREATE (Add New Document)

```javascript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Add new inventory item
async function addInventoryItem(itemData) {
  try {
    const docRef = await addDoc(collection(db, "inventory"), {
      ...itemData,
      createdAt: serverTimestamp()
    });
    console.log("Item added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding item:", error);
  }
}

// Example usage:
addInventoryItem({
  name: "Arabica Beans",
  sku: "BEAN-ARA-001",
  category: "beans",
  currentStock: 50,
  maxStock: 100,
  price: 450,
  description: "Premium arabica beans from Ethiopia"
});
```

### READ (Get Documents)

**Get Single Document:**
```javascript
import { doc, getDoc } from "firebase/firestore";

async function getInventoryItem(itemId) {
  try {
    const docRef = doc(db, "inventory", itemId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      console.log("Item data:", docSnap.data());
      return docSnap.data();
    } else {
      console.log("Item not found");
    }
  } catch (error) {
    console.error("Error getting item:", error);
  }
}
```

**Get All Documents:**
```javascript
import { collection, getDocs } from "firebase/firestore";

async function getAllInventory() {
  try {
    const querySnapshot = await getDocs(collection(db, "inventory"));
    const items = [];
    
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    
    console.log("All items:", items);
    return items;
  } catch (error) {
    console.error("Error getting items:", error);
  }
}
```

### UPDATE (Modify Document)

```javascript
import { doc, updateDoc } from "firebase/firestore";

async function updateInventoryItem(itemId, updatedData) {
  try {
    const docRef = doc(db, "inventory", itemId);
    await updateDoc(docRef, updatedData);
    console.log("Item updated successfully");
  } catch (error) {
    console.error("Error updating item:", error);
  }
}

// Example usage:
updateInventoryItem("item-001", {
  currentStock: 45,
  lastUpdated: new Date()
});
```

### DELETE (Remove Document)

```javascript
import { doc, deleteDoc } from "firebase/firestore";

async function deleteInventoryItem(itemId) {
  try {
    await deleteDoc(doc(db, "inventory", itemId));
    console.log("Item deleted successfully");
  } catch (error) {
    console.error("Error deleting item:", error);
  }
}

// Example usage:
deleteInventoryItem("item-001");
```

---

## Real-Time Listeners

Real-time listeners automatically update your app when data changes in Firebase.

### Single Document Real-Time Listener
```javascript
import { doc, onSnapshot } from "firebase/firestore";

// Listen to changes on a single item
onSnapshot(doc(db, "inventory", "item-001"), (doc) => {
  console.log("Item updated:", doc.data());
  // Update UI automatically
});
```

### Collection Real-Time Listener
```javascript
import { collection, onSnapshot } from "firebase/firestore";

// Listen to all inventory changes
onSnapshot(collection(db, "inventory"), (snapshot) => {
  const items = [];
  snapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });
  console.log("Inventory updated:", items);
  // Update UI automatically
});
```

### Filtered Real-Time Listener
```javascript
import { collection, query, where, onSnapshot } from "firebase/firestore";

// Listen to only "beans" category
const q = query(
  collection(db, "inventory"),
  where("category", "==", "beans")
);

onSnapshot(q, (snapshot) => {
  const beanItems = [];
  snapshot.forEach((doc) => {
    beanItems.push({ id: doc.id, ...doc.data() });
  });
  console.log("Beans updated:", beanItems);
});
```

---

## Query Examples

### Query by Field Value
```javascript
import { collection, query, where, getDocs } from "firebase/firestore";

// Find all items in "dairy" category
const q = query(
  collection(db, "inventory"),
  where("category", "==", "dairy")
);

const querySnapshot = await getDocs(q);
const dairyItems = [];
querySnapshot.forEach((doc) => {
  dairyItems.push({ id: doc.id, ...doc.data() });
});
```

### Query with Multiple Conditions
```javascript
// Find all dairy items with stock > 10
const q = query(
  collection(db, "inventory"),
  where("category", "==", "dairy"),
  where("currentStock", ">", 10)
);
```

### Query with Sorting
```javascript
import { orderBy } from "firebase/firestore";

// Get items sorted by price (ascending)
const q = query(
  collection(db, "inventory"),
  orderBy("price", "asc")
);

// Or descending:
const q2 = query(
  collection(db, "inventory"),
  orderBy("price", "desc")
);
```

### Query with Limiting
```javascript
import { limit } from "firebase/firestore";

// Get only 10 items
const q = query(
  collection(db, "inventory"),
  limit(10)
);
```

---

## Common Tasks

### Task 1: Get Low Stock Items
```javascript
async function getLowStockItems() {
  const q = query(
    collection(db, "inventory"),
    where("currentStock", "<", 20)
  );
  
  const querySnapshot = await getDocs(q);
  const lowStockItems = [];
  
  querySnapshot.forEach((doc) => {
    lowStockItems.push({ id: doc.id, ...doc.data() });
  });
  
  return lowStockItems;
}
```

### Task 2: Get Orders by Status
```javascript
async function getOrdersByStatus(status) {
  const q = query(
    collection(db, "orders"),
    where("status", "==", status)
  );
  
  const querySnapshot = await getDocs(q);
  const orders = [];
  
  querySnapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() });
  });
  
  return orders;
}

// Usage:
const newOrders = await getOrdersByStatus("new");
const readyOrders = await getOrdersByStatus("ready");
```

### Task 3: Update Order Status
```javascript
async function updateOrderStatus(orderId, newStatus) {
  try {
    await updateDoc(doc(db, "orders", orderId), {
      status: newStatus,
      lastUpdated: serverTimestamp()
    });
    console.log(`Order ${orderId} updated to ${newStatus}`);
  } catch (error) {
    console.error("Error updating order:", error);
  }
}

// Usage:
updateOrderStatus("ORD1718462400000", "preparing");
```

### Task 4: Calculate Total Inventory Value
```javascript
async function getTotalInventoryValue() {
  const querySnapshot = await getDocs(collection(db, "inventory"));
  let totalValue = 0;
  
  querySnapshot.forEach((doc) => {
    const item = doc.data();
    totalValue += item.currentStock * item.price;
  });
  
  return totalValue;
}
```

### Task 5: Get Orders by Date Range
```javascript
async function getOrdersBetweenDates(startDate, endDate) {
  const q = query(
    collection(db, "orders"),
    where("createdAt", ">=", startDate),
    where("createdAt", "<=", endDate)
  );
  
  const querySnapshot = await getDocs(q);
  const orders = [];
  
  querySnapshot.forEach((doc) => {
    orders.push({ id: doc.id, ...doc.data() });
  });
  
  return orders;
}

// Usage:
const startDate = new Date("2024-06-01");
const endDate = new Date("2024-06-30");
const juneOrders = await getOrdersBetweenDates(startDate, endDate);
```

---

## Troubleshooting

### Problem: "Permission denied" Error
**Solution:**
1. Check your Firestore Rules are published
2. Use test mode rules temporarily for development
3. Verify your Firebase config is correct

### Problem: Real-time listener not updating
**Solution:**
1. Ensure you imported `onSnapshot` correctly
2. Check that the collection/document exists in Firestore
3. Verify browser console for errors

### Problem: "Document not found"
**Solution:**
1. Double-check the document ID (case-sensitive)
2. Verify the collection name spelling
3. Check if the document was actually created

### Problem: Firebase not loading
**Solution:**
1. Check internet connection
2. Verify Firebase config values are correct
3. Clear browser cache and reload
4. Check browser console for errors

---

## Best Practices

1. **Always handle errors** with try-catch blocks
2. **Use serverTimestamp()** for automatic server time
3. **Index queries** in Firebase Console if you get warnings
4. **Security Rules** - Never use test mode in production
5. **Document structure** - Keep data flat, avoid deep nesting
6. **Real-time listeners** - Unsubscribe when component unmounts
7. **Batch operations** - Use batch writes for multiple updates

---

## Next Steps

1. ✅ Create Firebase project
2. ✅ Get Firebase config
3. ✅ Enable Firestore
4. ✅ Update security rules
5. Update frontend HTML files to use Firebase
6. Test all operations

**Questions?** Check Firebase documentation: https://firebase.google.com/docs/firestore
