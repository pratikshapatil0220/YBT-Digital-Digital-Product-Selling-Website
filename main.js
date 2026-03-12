// YBT Digital - Main JavaScript

// Theme Management
class ThemeManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.setupThemeToggle();
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }
    
    setupThemeToggle() {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.addEventListener('click', () => this.toggleTheme());
        }
    }
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }
    
    updateThemeIcon(theme) {
        const toggle = document.querySelector('.theme-toggle');
        if (toggle) {
            toggle.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        }
    }
}

// Mobile Navigation
class MobileNavigation {
    constructor() {
        this.init();
    }
    
    init() {
        this.updateActiveNav();
        this.setupNavigation();
    }
    
    updateActiveNav() {
        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.mobile-nav-item');
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === currentPath || 
                (currentPath === '/' && item.getAttribute('href') === '/index.php')) {
                item.classList.add('active');
            }
        });
    }
    
    setupNavigation() {
        // Handle navigation clicks
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                // Add loading state
                this.addLoadingState(item);
            });
        });
    }
    
    addLoadingState(element) {
        element.style.opacity = '0.6';
        setTimeout(() => {
            element.style.opacity = '1';
        }, 300);
    }
}

// Shopping Cart
class ShoppingCart {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }
    
    init() {
        this.updateCartUI();
        this.setupCartEvents();
    }
    
    addToCart(productId, quantity = 1) {
        const existingItem = this.cart.find(item => item.product_id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({ product_id: productId, quantity });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.showNotification('Product added to cart', 'success');
    }
    
    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.product_id !== productId);
        this.saveCart();
        this.updateCartUI();
        this.showNotification('Product removed from cart', 'info');
    }
    
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.product_id === productId);
        if (item) {
            item.quantity = Math.max(1, quantity);
            this.saveCart();
            this.updateCartUI();
        }
    }
    
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    }
    
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }
    
    updateCartUI() {
        const cartCount = document.querySelector('.cart-count');
        const cartTotal = document.querySelector('.cart-total');
        
        if (cartCount) {
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
            cartCount.style.display = totalItems > 0 ? 'inline-block' : 'none';
        }
        
        // Update cart total if on cart page
        if (cartTotal && typeof updateCartTotal === 'function') {
            updateCartTotal();
        }
    }
    
    setupCartEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart')) {
                e.preventDefault();
                const productId = e.target.dataset.productId;
                this.addToCart(parseInt(productId));
            }
        });
        
        // Remove from cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-from-cart')) {
                e.preventDefault();
                const productId = e.target.dataset.productId;
                this.removeFromCart(parseInt(productId));
            }
        });
        
        // Quantity inputs
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('quantity-input')) {
                const productId = e.target.dataset.productId;
                const quantity = parseInt(e.target.value);
                this.updateQuantity(parseInt(productId), quantity);
            }
        });
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} notification-toast`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 250px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Form Validation
class FormValidator {
    constructor(form) {
        this.form = form;
        this.rules = {};
        this.init();
    }
    
    init() {
        this.form.addEventListener('submit', (e) => {
            if (!this.validate()) {
                e.preventDefault();
            }
        });
        
        // Real-time validation
        this.form.addEventListener('input', (e) => {
            if (e.target.classList.contains('form-control')) {
                this.validateField(e.target);
            }
        });
    }
    
    addRule(fieldName, rules) {
        this.rules[fieldName] = rules;
    }
    
    validate() {
        let isValid = true;
        const fields = this.form.querySelectorAll('.form-control');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    validateField(field) {
        const fieldName = field.name;
        const value = field.value.trim();
        const rules = this.rules[fieldName];
        
        if (!rules) return true;
        
        let isValid = true;
        let errorMessage = '';
        
        // Required validation
        if (rules.required && !value) {
            isValid = false;
            errorMessage = `${fieldName} is required`;
        }
        
        // Email validation
        if (rules.email && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
        
        // Min length validation
        if (rules.minLength && value.length < rules.minLength) {
            isValid = false;
            errorMessage = `${fieldName} must be at least ${rules.minLength} characters`;
        }
        
        // Password confirmation
        if (rules.match && value) {
            const matchField = this.form.querySelector(`[name="${rules.match}"]`);
            if (matchField && value !== matchField.value) {
                isValid = false;
                errorMessage = 'Passwords do not match';
            }
        }
        
        this.showFieldError(field, isValid, errorMessage);
        return isValid;
    }
    
    showFieldError(field, isValid, message) {
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup.querySelector('.field-error') || document.createElement('div');
        
        errorElement.className = 'field-error text-danger mt-1';
        errorElement.style.fontSize = '0.875rem';
        
        if (!isValid) {
            errorElement.textContent = message;
            field.classList.add('is-invalid');
            if (!formGroup.querySelector('.field-error')) {
                formGroup.appendChild(errorElement);
            }
        } else {
            errorElement.textContent = '';
            field.classList.remove('is-invalid');
        }
    }
    
    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// Search Functionality
class SearchManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupSearch();
    }
    
    setupSearch() {
        const searchInput = document.querySelector('.search-input');
        const searchResults = document.querySelector('.search-results');
        
        if (searchInput) {
            let searchTimeout;
            
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                const query = e.target.value.trim();
                
                if (query.length >= 2) {
                    searchTimeout = setTimeout(() => {
                        this.performSearch(query);
                    }, 300);
                } else {
                    this.hideSearchResults();
                }
            });
            
            // Hide results when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    this.hideSearchResults();
                }
            });
        }
    }
    
    async performSearch(query) {
        try {
            const response = await fetch(`index.php?page=search&q=${encodeURIComponent(query)}`);
            const data = await response.json();
            this.displaySearchResults(data);
        } catch (error) {
            console.error('Search error:', error);
        }
    }
    
    displaySearchResults(results) {
        const searchResults = document.querySelector('.search-results');
        if (!searchResults) return;
        
        if (results.length === 0) {
            searchResults.innerHTML = '<div class="p-3 text-muted">No products found</div>';
        } else {
            searchResults.innerHTML = results.map(product => `
                <a href="index.php?page=products&action=detail&id=${product.id}" class="search-result-item d-flex align-center gap-3 p-3">
                    <img src="${product.thumbnail || 'assets/images/placeholder.jpg'}" alt="${product.title}" class="search-result-image" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">
                    <div class="flex-1">
                        <div class="font-semibold">${product.title}</div>
                        <div class="text-primary">${formatPrice(product.price)}</div>
                    </div>
                </a>
            `).join('');
        }
        
        searchResults.style.display = 'block';
    }
    
    hideSearchResults() {
        const searchResults = document.querySelector('.search-results');
        if (searchResults) {
            searchResults.style.display = 'none';
        }
    }
}

// Utility Functions
function formatPrice(amount) {
    return '$' + parseFloat(amount).toFixed(2);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function showLoadingSpinner(element) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    spinner.style.cssText = 'margin: 20px auto;';
    element.appendChild(spinner);
    return spinner;
}

function hideLoadingSpinner(spinner) {
    if (spinner) {
        spinner.remove();
    }
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new MobileNavigation();
    new ShoppingCart();
    new SearchManager();
    
    // Setup form validation for all forms
    document.querySelectorAll('form[data-validate]').forEach(form => {
        const validator = new FormValidator(form);
        
        // Add common validation rules
        form.querySelectorAll('input[required]').forEach(input => {
            validator.addRule(input.name, { required: true });
        });
        
        form.querySelectorAll('input[type="email"]').forEach(input => {
            validator.addRule(input.name, { email: true });
        });
        
        form.querySelectorAll('input[type="password"]').forEach(input => {
            validator.addRule(input.name, { minLength: 8 });
        });
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .is-invalid {
        border-color: var(--danger-color) !important;
    }
    
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
    }
    
    [data-theme="dark"] .search-results {
        background: #374151;
        border-color: var(--border-color);
    }
    
    .search-result-item {
        text-decoration: none;
        color: inherit;
        transition: background-color 0.2s;
    }
    
    .search-result-item:hover {
        background-color: rgba(99, 102, 241, 0.1);
    }
    
    .cart-count {
        position: absolute;
        top: -8px;
        right: -8px;
        background: var(--danger-color);
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }
`;
document.head.appendChild(style);
