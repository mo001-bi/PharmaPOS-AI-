/**
 * PharmaPOS AI - Utility Functions
 * 
 * Helper functions for stock status, expiry alerts,
 * alternative medicine lookup, and common calculations.
 */

// ============================================
// STOCK & EXPIRY UTILITIES
// ============================================

/**
 * Determine stock status color based on quantity and expiry date
 * @param {number} stock - Current stock quantity
 * @param {string} expiry - Expiry date (YYYY-MM-DD)
 * @returns {string} 'green', 'orange', or 'red'
 */
function getStockStatus(stock, expiry) {
    if (stock <= 0) return "red";
    if (stock < 10) return "orange";
    
    const expDate = new Date(expiry);
    const today = new Date();
    const diffDays = (expDate - today) / (1000 * 3600 * 24);
    
    if (diffDays < 30) return "red";
    if (diffDays < 90) return "orange";
    return "green";
}

/**
 * Get CSS class name for stock status
 * @param {number} stock - Stock quantity
 * @param {string} expiry - Expiry date
 * @returns {string} CSS class name
 */
function getStockStatusClass(stock, expiry) {
    const status = getStockStatus(stock, expiry);
    switch(status) {
        case 'green': return 'stock-green';
        case 'orange': return 'stock-orange';
        case 'red': return 'stock-red';
        default: return '';
    }
}

/**
 * Check if a medicine is expired
 * @param {string} expiry - Expiry date (YYYY-MM-DD)
 * @returns {boolean}
 */
function isExpired(expiry) {
    return new Date(expiry) < new Date();
}

/**
 * Get medicines expiring within next N days
 * @param {number} days - Number of days threshold
 * @returns {Array} List of expiring medicines
 */
function getExpiringMedicines(days = 30) {
    const today = new Date();
    const threshold = new Date();
    threshold.setDate(today.getDate() + days);
    
    return medicines.filter(med => {
        const expDate = new Date(med.expiry);
        return expDate <= threshold && expDate >= today && med.stock > 0;
    });
}

// ============================================
// ALTERNATIVE MEDICINE LOOKUP
// ============================================

/**
 * Find alternative medicines with same salt composition
 * @param {Object} medicine - Medicine object
 * @returns {Array} List of alternative medicines (in stock)
 */
function findAlternatives(medicine) {
    return medicines.filter(m => 
        m.salt === medicine.salt && 
        m.id !== medicine.id && 
        m.stock > 0
    );
}

/**
 * Get therapeutic alternatives by category
 * @param {string} category - Medicine category
 * @returns {Array} Medicines in same category
 */
function getAlternativesByCategory(category) {
    return medicines.filter(m => 
        m.category === category && m.stock > 0
    );
}

// ============================================
// FINANCIAL CALCULATIONS
// ============================================

/**
 * Calculate total inventory value (purchase price basis)
 * @returns {number}
 */
function calculateInventoryValue() {
    return medicines.reduce((sum, med) => sum + (med.stock * med.purchasePrice), 0);
}

/**
 * Calculate total retail value of inventory
 * @returns {number}
 */
function calculateInventoryRetailValue() {
    return medicines.reduce((sum, med) => sum + (med.stock * med.sellingPrice), 0);
}

/**
 * Calculate potential profit margin if all inventory sold
 * @returns {number}
 */
function calculatePotentialProfit() {
    return calculateInventoryRetailValue() - calculateInventoryValue();
}

/**
 * Calculate expiry loss value
 * @returns {number}
 */
function calculateExpiryLoss() {
    return medicines
        .filter(med => isExpired(med.expiry))
        .reduce((sum, med) => sum + (med.stock * med.purchasePrice), 0);
}

/**
 * Get low stock items (below threshold)
 * @param {number} threshold - Minimum stock threshold
 * @returns {Array}
 */
function getLowStockItems(threshold = 10) {
    return medicines.filter(med => med.stock > 0 && med.stock < threshold);
}

// ============================================
// CART & BILLING UTILITIES
// ============================================

/**
 * Calculate cart totals including GST
 * @param {Array} cartItems - Cart array
 * @param {number} discount - Discount amount
 * @returns {Object} Subtotal, GST, total, item count
 */
function calculateCartTotals(cartItems, discount = 0) {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const gst = subtotal * 0.05; // 5% GST for pharmacy items
    const total = subtotal + gst - discount;
    const itemCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
    
    return { subtotal, gst, total, itemCount };
}

/**
 * Format currency in Indian Rupees
 * @param {number} amount
 * @returns {string}
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
}

// ============================================
// EXPORTS FOR GLOBAL ACCESS
// ============================================

window.getStockStatus = getStockStatus;
window.getStockStatusClass = getStockStatusClass;
window.isExpired = isExpired;
window.getExpiringMedicines = getExpiringMedicines;
window.findAlternatives = findAlternatives;
window.getAlternativesByCategory = getAlternativesByCategory;
window.calculateInventoryValue = calculateInventoryValue;
window.calculateExpiryLoss = calculateExpiryLoss;
window.getLowStockItems = getLowStockItems;
window.calculateCartTotals = calculateCartTotals;
window.formatCurrency = formatCurrency;