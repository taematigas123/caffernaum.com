#!/usr/bin/env node
/**
 * FIREBASE QUICK REFERENCE GUIDE
 * Copy-paste ready code snippets for common operations
 * 
 * All examples assume you have imported:
 * import { db, collection, addDoc, getDocs, doc, getDoc, 
 *          updateDoc, deleteDoc, query, where, onSnapshot, 
 *          serverTimestamp } from './firebase-config.js';
 */

// ============================================
// 1. CREATE (Add Documents)
// ============================================

// Add a single document
async function addItem(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    console.log("✅ Added with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Example usage:
// await addItem("inventory", {
//   name: "Arabica Beans",
//   price: 450,
//   stock: 50
// });

// ============================================
// 2. READ (Get Documents)
// ============================================

// Get single document by ID
async function getItem(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("Document not found");
      return null;
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Example usage:
// const item = await getItem("inventory", "item-001");
// console.log(item);

// Get all documents from collection
async function getAllItems(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items = [];
    
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Found ${items.length} items`);
    return items;
  } catch (error) {
    console.error("❌ Error:", error);
    return [];
  }
}

// Example usage:
// const allItems = await getAllItems("inventory");

// ============================================
// 3. UPDATE (Modify Documents)
// ============================================

// Update single field
async function updateField(collectionName, docId, field, value) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      [field]: value,
      lastUpdated: serverTimestamp()
    });
    console.log("✅ Updated");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Example usage:
// await updateField("inventory", "item-001", "price", 500);

// Update multiple fields
async function updateMultiple(collectionName, docId, updates) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...updates,
      lastUpdated: serverTimestamp()
    });
    console.log("✅ Updated multiple fields");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Example usage:
// await updateMultiple("inventory", "item-001", {
//   name: "New Name",
//   price: 500,
//   stock: 75
// });

// Increment a number field
async function incrementField(collectionName, docId, field, amount) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const currentValue = docSnap.data()[field] || 0;
      await updateDoc(docRef, {
        [field]: currentValue + amount
      });
      console.log("✅ Incremented");
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Example usage:
// await incrementField("inventory", "item-001", "stock", 10); // Add 10
// await incrementField("inventory", "item-001", "stock", -5); // Subtract 5

// ============================================
// 4. DELETE (Remove Documents)
// ============================================

// Delete single document
async function deleteItem(collectionName, docId) {
  try {
    if (!confirm("Are you sure?")) return;
    
    await deleteDoc(doc(db, collectionName, docId));
    console.log("✅ Deleted");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Example usage:
// await deleteItem("inventory", "item-001");

// ============================================
// 5. QUERY (Search/Filter)
// ============================================

// Query by single condition
async function queryByField(collectionName, fieldName, value) {
  try {
    const q = query(
      collection(db, collectionName),
      where(fieldName, "==", value)
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Found ${results.length} results`);
    return results;
  } catch (error) {
    console.error("❌ Error:", error);
    return [];
  }
}

// Example usage:
// const beanItems = await queryByField("inventory", "category", "beans");
// const dairyItems = await queryByField("inventory", "category", "dairy");

// Query with multiple conditions (AND logic)
async function queryMultiple(collectionName, conditions) {
  // conditions = [
  //   { field: "category", operator: "==", value: "beans" },
  //   { field: "stock", operator: ">", value: 10 }
  // ]
  
  try {
    let q = query(collection(db, collectionName));
    
    // This is simplified - actually need to construct query properly
    const querySnapshot = await getDocs(
      query(
        collection(db, collectionName),
        where(conditions[0].field, conditions[0].operator, conditions[0].value),
        where(conditions[1].field, conditions[1].operator, conditions[1].value)
      )
    );
    
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error("❌ Error:", error);
    return [];
  }
}

// Simpler example:
async function getBeansWithHighStock() {
  const q = query(
    collection(db, "inventory"),
    where("category", "==", "beans"),
    where("stock", ">", 20)
  );
  
  const querySnapshot = await getDocs(q);
  const results = [];
  querySnapshot.forEach((doc) => {
    results.push({ id: doc.id, ...doc.data() });
  });
  return results;
}

// Query with sorting
async function getSortedItems(collectionName, fieldName, direction = "asc") {
  try {
    const q = query(
      collection(db, collectionName),
      orderBy(fieldName, direction) // "asc" or "desc"
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error("❌ Error:", error);
    return [];
  }
}

// Example usage:
// const cheapestFirst = await getSortedItems("inventory", "price", "asc");
// const mostExpensive = await getSortedItems("inventory", "price", "desc");

// Query with limit
async function getTopItems(collectionName, limit = 10) {
  try {
    const q = query(
      collection(db, collectionName),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error("❌ Error:", error);
    return [];
  }
}

// Example usage:
// const top5Items = await getTopItems("inventory", 5);

// ============================================
// 6. REAL-TIME LISTENERS
// ============================================

// Listen to all documents in collection
function listenToCollection(collectionName, callback) {
  onSnapshot(collection(db, collectionName), (snapshot) => {
    const items = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    callback(items);
  });
}

// Example usage:
// listenToCollection("inventory", (items) => {
//   console.log("Inventory updated:", items);
//   updateUI(items); // Your function
// });

// Listen to single document
function listenToDocument(collectionName, docId, callback) {
  onSnapshot(doc(db, collectionName, docId), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data());
    }
  });
}

// Example usage:
// listenToDocument("inventory", "item-001", (data) => {
//   console.log("Item updated:", data);
//   updateUI(data);
// });

// Listen to filtered results
function listenToQuery(collectionName, fieldName, value, callback) {
  const q = query(
    collection(db, collectionName),
    where(fieldName, "==", value)
  );
  
  onSnapshot(q, (snapshot) => {
    const items = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    callback(items);
  });
}

// Example usage:
// listenToQuery("inventory", "category", "beans", (beanItems) => {
//   console.log("Beans updated:", beanItems);
//   updateBeansUI(beanItems);
// });

// ============================================
// 7. BATCH OPERATIONS
// ============================================

// Add multiple documents
async function addMultipleItems(collectionName, itemsArray) {
  try {
    const promises = itemsArray.map(item => 
      addDoc(collection(db, collectionName), {
        ...item,
        createdAt: serverTimestamp()
      })
    );
    
    await Promise.all(promises);
    console.log(`✅ Added ${itemsArray.length} items`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Example usage:
// const items = [
//   { name: "Item 1", price: 100 },
//   { name: "Item 2", price: 200 },
//   { name: "Item 3", price: 300 }
// ];
// await addMultipleItems("inventory", items);

// ============================================
// 8. COMMON PATTERNS
// ============================================

// Check if document exists
async function documentExists(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists();
  } catch (error) {
    console.error("❌ Error:", error);
    return false;
  }
}

// Count documents in collection
async function countDocuments(collectionName) {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.size;
  } catch (error) {
    console.error("❌ Error:", error);
    return 0;
  }
}

// Example usage:
// const itemCount = await countDocuments("inventory");
// console.log(`Total items: ${itemCount}`);

// Get last N documents
async function getLastNDocuments(collectionName, n = 10) {
  try {
    const q = query(
      collection(db, collectionName),
      orderBy("createdAt", "desc"),
      limit(n)
    );
    
    const querySnapshot = await getDocs(q);
    const results = [];
    
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    
    return results;
  } catch (error) {
    console.error("❌ Error:", error);
    return [];
  }
}

// Example usage:
// const recentOrders = await getLastNDocuments("orders", 20);

// ============================================
// 9. ERROR HANDLING
// ============================================

// Safe wrapper function
async function safeOperation(operation, operationName = "Operation") {
  try {
    const result = await operation();
    console.log(`✅ ${operationName} succeeded`);
    return result;
  } catch (error) {
    console.error(`❌ ${operationName} failed:`, error);
    
    // Handle specific errors
    if (error.code === 'permission-denied') {
      console.error("Permission denied - check Firestore rules");
    } else if (error.code === 'not-found') {
      console.error("Document not found");
    } else if (error.code === 'unavailable') {
      console.error("Service unavailable - check internet connection");
    }
    
    return null;
  }
}

// Example usage:
// const result = await safeOperation(
//   () => addItem("inventory", { name: "Test" }),
//   "Add inventory item"
// );

// ============================================
// 10. FIREBASE CONSOLE TIPS
// ============================================

/*
DEBUGGING IN FIREBASE CONSOLE:

1. View all documents:
   - Firebase Console → Firestore Database
   - Click collection name to expand
   - All documents listed with their data

2. Add test data:
   - Click "Add document" button
   - Enter document ID (or auto-generate)
   - Add fields manually

3. Edit data:
   - Click document → Click field to edit
   - Changes saved immediately

4. Delete data:
   - Right-click document → Delete
   - Confirm deletion

5. Query documents:
   - Click "Add filter" next to documents
   - Select field, operator, value
   - Results filtered in real-time

6. Check rules:
   - Click "Rules" tab
   - Current rules shown
   - Test with "Rules Playground"
*/

export {
  addItem,
  getItem,
  getAllItems,
  updateField,
  updateMultiple,
  incrementField,
  deleteItem,
  queryByField,
  getSortedItems,
  getTopItems,
  listenToCollection,
  listenToDocument,
  listenToQuery,
  addMultipleItems,
  documentExists,
  countDocuments,
  getLastNDocuments,
  safeOperation
};
