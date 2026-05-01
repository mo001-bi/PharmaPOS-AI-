/**
 * PharmaPOS AI - Enterprise Pharmacy Suite
 * Core Application Module
 * 
 * This module manages the global application state, data models,
 * localStorage persistence, and shared functions across all pages.
 * 
 * @version 1.0.0
 * @author PharmaPOS Team
 */

// ============================================
// DATA MODELS - Enterprise Pharmacy Inventory
// ============================================

/**
 * Master medicines inventory with batch tracking, expiry, pricing
 * @type {Array<Object>}
 */
let medicines = [
    { id: 1, name: "Crocin 650mg", salt: "Paracetamol", dosage: "650mg", batch: "B23A", expiry: "2025-08-15", stock: 0, purchasePrice: 12, sellingPrice: 25, supplier: "SunPharma", margin: 108, schedule: "H", interactionGroup: "NSAID", category: "Analgesic" },
    { id: 2, name: "Dolo 650mg", salt: "Paracetamol", dosage: "650mg", batch: "D44C", expiry: "2026-01-10", stock: 85, purchasePrice: 14, sellingPrice: 29, supplier: "Micro Labs", margin: 107, schedule: "G", category: "Analgesic" },
    { id: 3, name: "Calpol 650mg", salt: "Paracetamol", dosage: "650mg", batch: "C99X", expiry: "2025-12-20", stock: 42, purchasePrice: 13, sellingPrice: 28, supplier: "GSK", margin: 115, schedule: "G", category: "Analgesic" },
    { id: 4, name: "Azithral 500", salt: "Azithromycin", dosage: "500mg", batch: "Z12E", expiry: "2024-12-01", stock: 6, purchasePrice: 85, sellingPrice: 145, supplier: "Cipla", margin: 70, schedule: "H", category: "Antibiotic" },
    { id: 5, name: "Zyrox 500", salt: "Azithromycin", dosage: "500mg", batch: "ZR9T", expiry: "2026-03-22", stock: 28, purchasePrice: 78, sellingPrice: 140, supplier: "Mankind", margin: 79, schedule: "H", category: "Antibiotic" },
    { id: 6, name: "Metformin SR 500", salt: "Metformin", dosage: "500mg", expiry: "2026-07-19", stock: 200, purchasePrice: 8, sellingPrice: 18, supplier: "USV", margin: 125, category: "Antidiabetic" },
    { id: 7, name: "Glimet 500", salt: "Metformin", dosage: "500mg", expiry: "2025-11-30", stock: 55, purchasePrice: 9, sellingPrice: 21, supplier: "Cipla", margin: 133, category: "Antidiabetic" }
];

/**
 * Customer database for loyalty program and CRM
 */
let customersList = [
    { id: 1, name: "Rajesh Kumar", mobile: "9876543210", totalSpent: 3450, loyaltyPoints: 340, lastPurchase: "2025-02-10", medSubscription: "Metformin" },
    { id: 2, name: "Sneha Patil", mobile: "9988776655", totalSpent: 1290, loyaltyPoints: 90, lastPurchase: "2025-03-01", medSubscription: null }
];

/**
 * Supplier directory with lead times and ratings
 */
let suppliers = [
    { id: 1, name: "SunPharma", contact: "9876500001", leadTime: 3, rating: 4.5 },
    { id: 2, name: "Cipla", contact: "9876500002", leadTime: 2, rating: 4.8 },
    { id: 3, name: "Mankind", contact: "9876500003", leadTime: 4, rating: 4.2 }
];

/**
 * Employee records for role-based access control
 */
let employees = [
    { id: 1, name: "Dr. Mehta", role: "owner", permissions: "all" },
    { id: 2, name: "Rahul", role: "pharmacist", permissions: "inventory,billing" },
    { id: 3, name: "Sonia", role: "cashier", permissions: "billing" }
];

// ============================================
// APPLICATION STATE
// ============================================

let cart = [];                    // Current shopping cart
let currentDiscount = 0;         // Applied discount amount
let selectedCustomer = null;     // Currently selected customer for billing
let currentUserRole = "owner";   // Active user role (owner/pharmacist/cashier)
let language = "en";             // UI language preference
let offlineMode = false;         // Offline mode flag

// ============================================
// LOCALSTORAGE PERSISTENCE
// ============================================

/**
 * Save entire application state to localStorage
 * Ensures data persistence across page reloads
 */
function saveAppState() {
    const state = {
        medicines,
        customersList,
        suppliers,
        employees,
        cart,
        currentDiscount,
        selectedCustomer,
        currentUserRole,
        language,
        offlineMode
    };
    localStorage.setItem('pharmapos_state', JSON.stringify(state));
}

/**
 * Load application state from localStorage
 * Restores previous session data
 */
function loadAppState() {
    const saved = localStorage.getItem('pharmapos_state');
    if (saved) {
        try {
            const state = JSON.parse(saved);
            medicines = state.medicines || medicines;
            customersList = state.customersList || customersList;
            suppliers = state.suppliers || suppliers;
            employees = state.employees || employees;
            cart = state.cart || [];
            currentDiscount = state.currentDiscount || 0;
            selectedCustomer = state.selectedCustomer || null;
            currentUserRole = state.currentUserRole || "owner";
            language = state.language || "en";
            offlineMode = state.offlineMode || false;
        } catch (e) {
            console.error("Failed to load state", e);
        }
    }
}

/**
 * Get current user role with permission checks
 * @returns {string} Current user role
 */
function getUserRole() {
    return currentUserRole;
}

/**
 * Check if current user has permission for an action
 * @param {string} action - Action name (e.g., 'billing', 'inventory')
 * @returns {boolean}
 */
function hasPermission(action) {
    if (currentUserRole === 'owner') return true;
    const user = employees.find(e => e.role === currentUserRole);
    if (!user || !user.permissions) return false;
    return user.permissions.includes(action) || user.permissions === 'all';
}

// ============================================
// INTERNATIONALIZATION
// ============================================

const translations = {
    en: { lowStock: "Low Stock", expiry: "Expiry", totalSales: "Today's Sales", totalStock: "Total Stock Units" },
    hi: { lowStock: "कम स्टॉक", expiry: "समाप्ति", totalSales: "आज की बिक्री", totalStock: "कुल स्टॉक यूनिट" },
    mr: { lowStock: "कमी स्टॉक", expiry: "समाप्ती", totalSales: "आजची विक्री", totalStock: "एकूण स्टॉक युनिट" }
};

function t(key) {
    return translations[language]?.[key] || key;
}

// ============================================
// CART MANAGEMENT
// ============================================

/**
 * Add item to cart with stock validation
 * @param {number} medId - Medicine ID
 * @param {number} qty - Quantity to add
 */
function addToCartDirect(medId, qty = 1) {
    const med = medicines.find(m => m.id === medId);
    if (!med) {
        console.error("Medicine not found");
        return;
    }
    
    if (med.stock >= qty) {
        const existing = cart.find(item => item.id === medId);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({
                id: med.id,
                name: med.name,
                price: med.sellingPrice,
                qty: qty,
                batch: med.batch,
                expiry: med.expiry
            });
        }
        saveAppState();
        // Dispatch custom event for billing page refresh
        window.dispatchEvent(new CustomEvent('cart-updated'));
    } else {
        alert(`Insufficient stock for ${med.name}. Available: ${med.stock}`);
    }
}

/**
 * Remove item from cart by index
 * @param {number} index - Cart item index
 */
function removeCartItem(index) {
    cart.splice(index, 1);
    saveAppState();
    window.dispatchEvent(new CustomEvent('cart-updated'));
}

/**
 * Update quantity of cart item
 * @param {number} index - Cart item index
 * @param {number} delta - Change in quantity (+1 or -1)
 */
function updateCartQty(index, delta) {
    if (cart[index]) {
        cart[index].qty += delta;
        if (cart[index].qty <= 0) {
            cart.splice(index, 1);
        }
        saveAppState();
        window.dispatchEvent(new CustomEvent('cart-updated'));
    }
}

/**
 * Clear entire cart
 */
function clearCart() {
    cart = [];
    currentDiscount = 0;
    selectedCustomer = null;
    saveAppState();
    window.dispatchEvent(new CustomEvent('cart-updated'));
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialize app on page load
 * Load saved state, set up event listeners
 */
function initApp() {
    loadAppState();
    
    // Setup dark mode from localStorage
    const darkMode = localStorage.getItem('darkMode') === 'true';
    if (darkMode) document.body.classList.add('dark');
    
    // Setup dark mode toggle listener
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark');
            localStorage.setItem('darkMode', document.body.classList.contains('dark'));
        });
    }
}

// Export for global access (for inline event handlers)
window.medicines = medicines;
window.customersList = customersList;
window.suppliers = suppliers;
window.employees = employees;
window.cart = cart;
window.currentDiscount = currentDiscount;
window.selectedCustomer = selectedCustomer;
window.currentUserRole = currentUserRole;
window.addToCartDirect = addToCartDirect;
window.removeCartItem = removeCartItem;
window.updateCartQty = updateCartQty;
window.clearCart = clearCart;
window.saveAppState = saveAppState;
window.hasPermission = hasPermission;
window.getUserRole = getUserRole;
window.t = t;

// Auto-init when DOM ready
document.addEventListener('DOMContentLoaded', initApp);