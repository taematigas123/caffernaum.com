# Firebase Architecture & Data Flow

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CAFFERNAUM SYSTEM                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   CUSTOMER      │  │  STAFF          │  │  ADMIN/OWNER    │
│   index.html    │  │  staff.html     │  │  inventory.html │
│                 │  │                 │  │                 │
│ • Browse menu   │  │ • View orders   │  │ • Manage stock  │
│ • Add to cart   │  │ • Update status │  │ • Add items     │
│ • Checkout      │  │ • View stats    │  │ • Remove items  │
└────────┬────────┘  └────────┬────────┘  └────────┬────────┘
         │                    │                    │
         │  All import from   │                    │
         └────────────────────┼────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │ firebase-config.js │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼────────────────┐
                    │   FIRESTORE DATABASE     │
                    │   (Cloud - Firebase)     │
                    └──────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    ┌────▼────┐          ┌────▼────┐          ┌────▼────┐
    │inventory │          │ orders  │          │  staff  │
    │collection│          │collection│         │collection│
    └─────────┘          └─────────┘          └─────────┘
```

---

## Data Flow Examples

### 1. Adding Inventory Item

```
┌──────────────────┐
│  Inventory Page  │
│                  │
│ User fills form: │
│ - Name           │
│ - Price          │
│ - Stock          │
│ - Category       │
└────────┬─────────┘
         │
    Click "Add Item"
         │
         ▼
┌──────────────────────────┐
│  JavaScript Code         │
│  addNewItem() function   │
└────────┬─────────────────┘
         │
    await addDoc(
      collection(db, "inventory"),
      { itemData... }
    )
         │
         ▼
┌─────────────────────────────┐
│  Firebase Network Request   │
│  (Your computer → Google)   │
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────────┐
│  FIRESTORE DATABASE      │
│  (Cloud - Google Servers)│
│                          │
│  Collection: "inventory" │
│  └─ New Document Added   │
└────────┬─────────────────┘
         │
    (Real-time listener triggers)
         │
         ▼
┌────────────────────┐
│  All Connected     │
│  Browser Tabs      │
│  (Staff devices)   │
│                    │
│ Automatically      │
│ see new item!      │
└────────────────────┘
```

### 2. Placing Customer Order

```
Customer Site (index.html)
        │
        ├─ Browse menu
        ├─ Add items to cart
        │
        └─ Click "Checkout"
                 │
                 ▼
        ShoppingCart class
                 │
            await checkout()
                 │
                 ▼
        await addDoc(
          collection(db, "orders"),
          { orderData... }
        )
                 │
                 ▼
        Firebase (Google Servers)
                 │
        Save to "orders" collection
                 │
                 ▼
        (Real-time listener in staff.html)
                 │
                 ▼
        Staff Dashboard
        (staff.html)
                 │
                 └─ See new order immediately!
```

### 3. Real-Time Inventory Update

```
Inventory Page (Staff A)       Inventory Page (Staff B)
       │                               │
       └───────────────┬───────────────┘
                       │
                  User clicks "Restock"
                  on item A
                       │
                       ▼
                await updateDoc(
            doc(db, "inventory", id),
                { currentStock: 60 }
          )
                       │
                       ▼
                Firebase Server
                (Google Servers)
                       │
                Updates document
                in "inventory"
                       │
                       ▼
          Triggers real-time listeners
                       │
          ┌────────────┴────────────┐
          │                         │
          ▼                         ▼
    Staff A sees                Staff B sees
    update immediately!        update immediately!
    (No page refresh)          (No page refresh)
```

---

## Collections Structure in Firestore

### inventory Collection
```
Collection: inventory
├── Document ID: auto-generated (e.g., "abc123def456")
│   ├── name: "Arabica Beans" (string)
│   ├── sku: "BEAN-ARA-001" (string)
│   ├── category: "beans" (string)
│   ├── currentStock: 50 (number)
│   ├── maxStock: 100 (number)
│   ├── price: 450 (number)
│   ├── description: "Premium arabica..." (string)
│   ├── createdAt: 2024-06-15T10:30:00Z (timestamp)
│   └── lastUpdated: 2024-06-15T14:20:00Z (timestamp)
│
├── Document ID: "xyz789abc123"
│   ├── name: "Whole Milk"
│   ├── category: "dairy"
│   ├── currentStock: 30
│   └── ...
│
└── Document ID: "qwe456rty789"
    ├── name: "Caramel Syrup"
    ├── category: "syrups"
    └── ...
```

### orders Collection
```
Collection: orders
├── Document ID: "ORD1718462400000"
│   ├── id: "ORD1718462400000" (string)
│   ├── status: "new" (string)
│   ├── items: (array)
│   │   ├── { product: "Caramel Macchiato", quantity: 2, price: 319 }
│   │   └── { product: "Cappuccino", quantity: 1, price: 349 }
│   ├── total: 987 (number)
│   ├── customer: (object)
│   │   ├── name: "John Doe"
│   │   ├── phone: "09171234567"
│   │   ├── address: "123 Main St"
│   │   ├── deliveryTime: "ASAP"
│   │   └── notes: "Extra hot"
│   ├── createdAt: 2024-06-15T11:00:00Z (timestamp)
│   └── timestamp: 1718462400000 (number)
│
└── Document ID: "ORD1718463200000"
    ├── id: "ORD1718463200000"
    ├── status: "preparing"
    └── ...
```

---

## How Real-Time Sync Works

### Without Real-Time (localStorage)
```
Staff Computer 1          Firebase          Staff Computer 2
    │                        │                      │
    │ Add inventory item     │                      │
    │ Save to localStorage   │                      │
    └───────────────────────→ (doesn't send)        │
    (only local)                                    │
                                                    │
                                         User must refresh
                                         page to see update!
```

### With Real-Time (Firebase)
```
Staff Computer 1          Firebase          Staff Computer 2
    │                        │                      │
    │ Add inventory item     │                      │
    │ Send to Firebase       │                      │
    └───────────────────────→ Save document         │
                             │                      │
                             │ Broadcast update     │
                             ├──────────────────────→ Automatic update!
                             │                      │ (No refresh needed)
                             │ Real-time listener   │
                             │ detects change       │
```

---

## Operations Supported

### CRUD Operations (Create, Read, Update, Delete)

```

---

## MVC Diagram (Current Implementation)

Visual version: `SYSTEM_MVC_DIAGRAM.html`

```mermaid
flowchart TB
    subgraph V[View Layer (HTML Pages)]
        IDX[index.html\nCustomer storefront]
        STF[staff.html\nOrder dashboard]
        INV[inventory.html\nInventory management]
        DSH[dashboard.html\nMember dashboard]
        AUTHV[customer-login.html / login.html / signup.html]
    end

    subgraph C[Controller Layer (JavaScript in each page)]
        CART[ShoppingCart class\n(index.html)]
        ORD[OrderManager class\n(staff.html)]
        ITEM[InventoryManager class\n(inventory.html)]
        DASHCTRL[Dashboard logic\n(dashboard.html)]
        AUTHC[Auth handlers\n(customer-login/signup)]
    end

    subgraph M[Model Layer (Firebase)]
        CFG[firebase-config.js]
        DB[(Firestore)]
        ORDERS[orders]
        INVENTORY[inventory]
        MEMBERS[members]
        FBAUTH[Firebase Auth]
    end

    U[End Users\nCustomers / Staff] --> V
    V --> C
    C --> CFG --> DB
    DB --> ORDERS
    DB --> INVENTORY
    DB --> MEMBERS
    C --> FBAUTH
    DB -. onSnapshot real-time sync .-> C
    C --> V
```

### Key Mapping

- `Model`: Firebase Auth + Firestore (`orders`, `inventory`, `members`) via `firebase-config.js`
- `View`: `index.html`, `staff.html`, `inventory.html`, `dashboard.html`, auth pages
- `Controller`: `ShoppingCart`, `OrderManager`, `InventoryManager`, dashboard/auth page scripts
             ┌──────────────────┐
             │   Your App Code  │
             └────────┬─────────┘
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
    CREATE        READ          UPDATE        DELETE
      │             │             │             │
      ├─ addDoc     ├─ getDocs   ├─ updateDoc ├─ deleteDoc
      │             │             │             │
      │             ├─ getDoc     │             │
      │             │             │             │
      └──────────┬──────────────────────────────┘
                 │
                 ▼
        Firebase Firestore
        (Google Servers)
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
    Database       Real-Time
    Updated        Updates Sent
                   to All Listeners
```

---

## Data Types Supported

```
Field Type              Example                 Firebase Type
──────────────────────────────────────────────────────────────
String                  "Arabica Beans"         string
Number                  450                     number
Boolean                 true                    boolean
Date/Time              2024-06-15T10:30:00Z    timestamp
Array                  ["beans", "dairy"]      array
Object/Map             { name: "...", price: } map
Null                   null                    null
Reference              doc(db, "col", "id")    reference
```

---

## Security Rules Flow

```
Browser App
    │
Request to Firebase
(addDoc, getDocs, updateDoc, deleteDoc)
    │
    ▼
┌──────────────────────────┐
│  Firestore Security      │
│  Rules Engine            │
│                          │
│  Is request allowed?     │
│ ┌──────────────────┐    │
│ │ rule {           │    │
│ │   allow          │    │
│ │   read, write:   │    │
│ │   if true;       │    │
│ │ }                │    │
│ └──────────────────┘    │
└──────────┬───────────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
  ALLOW        DENY
    │             │
    ▼             ▼
Execute      Return
Operation    Error

Current: allow all (development)
Production: check auth + user role
```

---

## Import/Export Diagram

### What Each File Imports

```
inventory.html
    │
    └─ import from firebase-config.js
       ├─ db
       ├─ collection
       ├─ addDoc
       ├─ getDocs
       ├─ doc
       ├─ updateDoc
       ├─ deleteDoc
       ├─ onSnapshot
       └─ serverTimestamp

staff.html
    │
    └─ import from firebase-config.js
       ├─ db
       ├─ collection
       ├─ getDocs
       ├─ doc
       ├─ updateDoc
       ├─ query
       ├─ where
       ├─ onSnapshot
       └─ serverTimestamp

index.html
    │
    └─ import from firebase-config.js
       ├─ db
       ├─ collection
       ├─ addDoc
       └─ serverTimestamp
```

---

## Performance & Scalability

```
Number of Items    Time to Load    Real-Time Sync    Storage Used
────────────────────────────────────────────────────────────────
10 items           <100ms          Instant           <1MB
100 items          100-200ms       Instant           <5MB
1,000 items        200-500ms       Instant           <50MB
10,000 items       500ms-1s        Instant           <500MB
100,000 items      1-2s            Instant           <5GB

Firebase Free Tier: 1GB storage
Good for: Small to medium coffee shop
Scales to: Enterprise with paid plan
```

---

## Security Considerations

### Development (Current - Test Mode)
```javascript
✅ Easy to use
✅ No authentication needed
✅ Perfect for testing

❌ ANYONE can access data
❌ NOT secure for production
```

### Production (With Rules)
```javascript
✅ Only authenticated users
✅ Role-based access control
✅ Data encrypted
✅ HIPAA compliant options

❌ Requires authentication setup
```

---

## Error Handling Flow

```
Firebase Operation
    │
    ├─ Network Error
    │   └─ User offline?
    │       └─ Check internet connection
    │
    ├─ Permission Denied
    │   └─ Check Firestore Rules
    │       └─ Make sure rules are published
    │
    ├─ Document Not Found
    │   └─ Check document ID (case-sensitive)
    │       └─ Verify document exists in console
    │
    ├─ Invalid Field
    │   └─ Check field name spelling
    │       └─ Verify data structure
    │
    ├─ Quota Exceeded
    │   └─ Upgrade Firebase plan
    │       └─ Reduce requests
    │
    ├─ Authentication Required
    │   └─ User not logged in
    │       └─ Implement sign-in
    │
    └─ Other Error
        └─ Check browser console
            └─ See error message details
```

---

## Summary: How It All Works

1. **User Action** (Click button, submit form)
   ↓
2. **JavaScript Event** (add/update/delete)
   ↓
3. **Firebase Operation** (async function)
   ↓
4. **Security Check** (Rules validated)
   ↓
5. **Database Update** (Save to Google Servers)
   ↓
6. **Real-Time Broadcast** (Firestore sends update)
   ↓
7. **All Listeners Updated** (Every connected device)
   ↓
8. **UI Updates** (Automatically, no refresh needed!)

---

## Next Reading

- **Setup Guide:** README_FIREBASE.md
- **Complete Docs:** FIREBASE_GUIDE.md
- **Code Examples:** firebase-examples.js
- **Quick Snippets:** FIREBASE_QUICK_REFERENCE.js
- **Migration Steps:** MIGRATION_GUIDE.md

---

**Key Takeaway:** Firebase handles the complexity of storing and syncing data across devices. Your code sends simple commands (add, get, update, delete), and Firebase takes care of the rest! 🚀
