/**
 * FIREBASE INTEGRATION EXAMPLES
 * 
 * This file shows how to convert localStorage operations to Firebase Firestore
 * Copy and paste these functions into your HTML files
 * 
 * Each example shows:
 * - localStorage way (OLD)
 * - Firebase way (NEW)
 */

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

// ============================================
// INVENTORY MANAGER - FIREBASE VERSION
// ============================================

class InventoryManager {
  constructor() {
    this.items = [];
    this.listeners = [];
    this.init();
  }

  async init() {
    // Load initial data
    await this.loadInventory();
    // Set up real-time listener
    this.setupRealtimeListener();
  }

  // ---- READ OPERATIONS ----

  // Load all inventory items from Firestore
  async loadInventory() {
    try {
      const querySnapshot = await getDocs(collection(db, "inventory"));
      this.items = [];
      
      querySnapshot.forEach((doc) => {
        this.items.push({ id: doc.id, ...doc.data() });
      });
      
      console.log("✅ Loaded", this.items.length, "inventory items from Firebase");
      return this.items;
    } catch (error) {
      console.error("❌ Error loading inventory:", error);
      return [];
    }
  }

  // Real-time listener - updates automatically when data changes
  setupRealtimeListener() {
    onSnapshot(collection(db, "inventory"), (snapshot) => {
      this.items = [];
      snapshot.forEach((doc) => {
        this.items.push({ id: doc.id, ...doc.data() });
      });
      
      // Trigger UI updates
      this.renderAll();
      this.updateCounts();
    });
  }

  // Get items by category
  async getByCategory(category) {
    try {
      const q = query(
        collection(db, "inventory"),
        where("category", "==", category)
      );
      
      const querySnapshot = await getDocs(q);
      const items = [];
      
      querySnapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() });
      });
      
      return items;
    } catch (error) {
      console.error("Error getting items by category:", error);
      return [];
    }
  }

  // ---- CREATE OPERATIONS ----

  // OLD WAY (localStorage):
  // const items = JSON.parse(localStorage.getItem('caffeInventory')) || [];
  // items.push(newItem);
  // localStorage.setItem('caffeInventory', JSON.stringify(items));

  // NEW WAY (Firebase):
  async addNewItem(itemData) {
    try {
      const docRef = await addDoc(collection(db, "inventory"), {
        name: itemData.name,
        sku: itemData.sku,
        description: itemData.description,
        category: itemData.category,
        unit: itemData.unit,
        currentStock: parseInt(itemData.currentStock),
        maxStock: parseInt(itemData.maxStock),
        price: parseInt(itemData.price),
        createdAt: serverTimestamp() // Automatic server timestamp
      });
      
      console.log("✅ Item added with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error adding item:", error);
      throw error;
    }
  }

  // ---- UPDATE OPERATIONS ----

  // OLD WAY (localStorage):
  // const items = JSON.parse(localStorage.getItem('caffeInventory')) || [];
  // const item = items.find(i => i.id === id);
  // if (item) item.currentStock -= 1;
  // localStorage.setItem('caffeInventory', JSON.stringify(items));

  // NEW WAY (Firebase):
  async restock(id, quantity) {
    try {
      const itemRef = doc(db, "inventory", id);
      const itemSnap = await getDoc(itemRef);
      
      if (!itemSnap.exists()) {
        console.error("Item not found");
        return;
      }
      
      const currentStock = itemSnap.data().currentStock;
      
      await updateDoc(itemRef, {
        currentStock: currentStock + quantity,
        lastUpdated: serverTimestamp()
      });
      
      console.log("✅ Item restocked");
    } catch (error) {
      console.error("❌ Error restocking:", error);
    }
  }

  async markOut(id, quantity) {
    try {
      const itemRef = doc(db, "inventory", id);
      const itemSnap = await getDoc(itemRef);
      
      if (!itemSnap.exists()) {
        console.error("Item not found");
        return;
      }
      
      const currentStock = itemSnap.data().currentStock;
      
      if (currentStock >= quantity) {
        await updateDoc(itemRef, {
          currentStock: currentStock - quantity,
          lastUpdated: serverTimestamp()
        });
        
        console.log("✅ Item stock updated");
      } else {
        console.error("❌ Insufficient stock");
      }
    } catch (error) {
      console.error("❌ Error updating stock:", error);
    }
  }

  // ---- DELETE OPERATIONS ----

  // OLD WAY (localStorage):
  // const items = JSON.parse(localStorage.getItem('caffeInventory')) || [];
  // const filtered = items.filter(i => i.id !== id);
  // localStorage.setItem('caffeInventory', JSON.stringify(filtered));

  // NEW WAY (Firebase):
  async removeItem(id) {
    try {
      if (!confirm("Are you sure you want to delete this item?")) {
        return;
      }
      
      await deleteDoc(doc(db, "inventory", id));
      console.log("✅ Item deleted");
    } catch (error) {
      console.error("❌ Error deleting item:", error);
    }
  }

  // ---- UI METHODS ----

  renderAll() {
    this.renderInventoryTable();
    this.renderKPICards();
  }

  renderInventoryTable() {
    const table = document.getElementById('inventoryTable');
    if (!table) return;

    table.innerHTML = this.items
      .sort((a, b) => (a.category || '').localeCompare(b.category || ''))
      .map(item => `
        <tr class="border-b hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
          <td class="px-6 py-4 font-bold">${item.name}</td>
          <td class="px-6 py-4">${item.sku}</td>
          <td class="px-6 py-4">${item.category}</td>
          <td class="px-6 py-4">
            <div class="flex items-center gap-2">
              <div class="w-24 bg-slate-200 rounded-full h-2">
                <div class="bg-primary h-2 rounded-full" style="width: ${(item.currentStock / item.maxStock) * 100}%"></div>
              </div>
              <span>${item.currentStock} / ${item.maxStock}</span>
            </div>
          </td>
          <td class="px-6 py-4">₱${item.price}</td>
          <td class="px-6 py-4 space-x-2">
            <button onclick="inventoryManager.restock('${item.id}', 10)" class="px-3 py-1 bg-sky-100 text-sky-600 rounded hover:bg-sky-200">Restock</button>
            <button onclick="inventoryManager.markOut('${item.id}', 1)" class="px-3 py-1 bg-amber-100 text-amber-600 rounded hover:bg-amber-200">Use</button>
            <button onclick="inventoryManager.removeItem('${item.id}')" class="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200">Remove</button>
          </td>
        </tr>
      `)
      .join('');
  }

  renderKPICards() {
    const totalItems = this.items.reduce((sum, item) => sum + item.currentStock, 0);
    const categories = new Set(this.items.map(item => item.category)).size;
    const lowStock = this.items.filter(item => item.currentStock < 20).length;

    document.getElementById('totalItemsCard').innerHTML = `
      <div class="text-4xl font-bold">${totalItems}</div>
      <p class="text-sm text-slate-500">Total Items in Stock</p>
    `;

    document.getElementById('categoriesCard').innerHTML = `
      <div class="text-4xl font-bold">${categories}</div>
      <p class="text-sm text-slate-500">Categories</p>
    `;

    document.getElementById('lowStockCard').innerHTML = `
      <div class="text-4xl font-bold text-orange-500">${lowStock}</div>
      <p class="text-sm text-slate-500">Low Stock Items</p>
    `;
  }

  updateCounts() {
    // Update filter tab counts
    const allCount = this.items.length;
    document.getElementById('countAll').textContent = allCount;

    // By category
    const categories = ['beans', 'dairy', 'syrups', 'spices', 'sweetener', 'pastries'];
    categories.forEach(cat => {
      const count = this.items.filter(item => item.category === cat).length;
      const element = document.getElementById(`count${cat.charAt(0).toUpperCase() + cat.slice(1)}`);
      if (element) element.textContent = count;
    });
  }
}

// ============================================
// ORDER MANAGER - FIREBASE VERSION
// ============================================

class OrderManager {
  constructor() {
    this.orders = [];
    this.currentFilter = 'all';
    this.init();
  }

  async init() {
    await this.loadOrders();
    this.setupRealtimeListener();
    this.setupFilterButtons();
  }

  // Load all orders
  async loadOrders() {
    try {
      const querySnapshot = await getDocs(collection(db, "orders"));
      this.orders = [];
      
      querySnapshot.forEach((doc) => {
        this.orders.push({ id: doc.id, ...doc.data() });
      });
      
      console.log("✅ Loaded", this.orders.length, "orders from Firebase");
      return this.orders;
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      return [];
    }
  }

  // Real-time listener for orders
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

  // Save new order
  async saveOrder(orderData) {
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        id: orderData.id,
        items: orderData.items,
        total: orderData.total,
        status: 'new',
        customer: orderData.customer,
        createdAt: serverTimestamp(),
        timestamp: Date.now()
      });
      
      console.log("✅ Order saved with ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("❌ Error saving order:", error);
      throw error;
    }
  }

  // Update order status
  async updateStatus(orderId, newStatus) {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        lastUpdated: serverTimestamp()
      });
      
      console.log("✅ Order status updated to:", newStatus);
    } catch (error) {
      console.error("❌ Error updating order:", error);
    }
  }

  // Get orders by status
  async getByStatus(status) {
    try {
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
    } catch (error) {
      console.error("Error getting orders by status:", error);
      return [];
    }
  }

  renderOrders() {
    // Implementation similar to original
    console.log("Rendering orders...");
  }

  updateStats() {
    console.log("Updating stats...");
  }

  updateCounts() {
    console.log("Updating counts...");
  }

  setupFilterButtons() {
    console.log("Setting up filters...");
  }
}

// ============================================
// SHOPPING CART - FIREBASE VERSION
// ============================================

class ShoppingCart {
  constructor() {
    this.items = [];
    this.loadCart();
  }

  // Load cart from Firestore
  async loadCart() {
    try {
      // Cart is saved in a user document
      // For now, using localStorage as backup
      this.items = JSON.parse(localStorage.getItem('caffeCart')) || [];
    } catch (error) {
      console.error("Error loading cart:", error);
      this.items = [];
    }
  }

  // Save cart to Firestore (when user checks out)
  async saveOrder(orderData) {
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        id: orderData.id,
        items: this.items,
        total: this.getTotal(),
        status: 'new',
        customer: orderData.customer,
        createdAt: serverTimestamp(),
        timestamp: Date.now()
      });
      
      console.log("✅ Order saved to Firebase");
      return docRef.id;
    } catch (error) {
      console.error("❌ Error saving order:", error);
      throw error;
    }
  }

  addItem(product, price) {
    const existingItem = this.items.find(item => item.product === product);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.items.push({ product, price, quantity: 1 });
    }
    this.save();
  }

  removeItem(index) {
    this.items.splice(index, 1);
    this.save();
  }

  getTotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  save() {
    // Keep in localStorage for now (session storage)
    localStorage.setItem('caffeCart', JSON.stringify(this.items));
  }
}

// Export for use in HTML files
export { InventoryManager, OrderManager, ShoppingCart };
