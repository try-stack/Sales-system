// Enhanced Order Tracking Functions
// This file contains all order tracking specific functionality

// Order tracking configuration
const ORDER_TRACKING_CONFIG = {
    statuses: ['Awaiting Payment', 'Pending', 'In Progress', 'Completed', 'Back Order', 'Cancelled'],
    priorityLevels: ['Low', 'Medium', 'High', 'Urgent'],
    defaultStatus: 'Awaiting Payment'
};

// Order analytics functions
class OrderAnalytics {
    static getOrderStatusSummary(orders) {
        const summary = {};
        ORDER_TRACKING_CONFIG.statuses.forEach(status => {
            summary[status] = orders.filter(order => order.status === status).length;
        });
        return summary;
    }
    
    static getTopCustomers(orders, limit = 5) {
        const customerTotals = {};
        orders.forEach(order => {
            if (!customerTotals[order.customer]) {
                customerTotals[order.customer] = { total: 0, count: 0 };
            }
            customerTotals[order.customer].total += order.total || 0;
            customerTotals[order.customer].count += 1;
        });
        
        return Object.entries(customerTotals)
            .sort((a, b) => b[1].total - a[1].total)
            .slice(0, limit)
            .map(([customer, data]) => ({ customer, ...data }));
    }
    
    static getOrdersByDateRange(orders, startDate, endDate) {
        return orders.filter(order => {
            const orderDate = new Date(order.createdAt || order.date);
            return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
        });
    }
    
    static getOrderMetrics(orders) {
        const totalOrders = orders.length;
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        const completedOrders = orders.filter(order => order.status === 'Completed');
        const pendingOrders = orders.filter(order => ['Pending', 'In Progress'].includes(order.status));
        const completionRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;
        
        return {
            totalOrders,
            totalRevenue,
            avgOrderValue,
            completedOrders: completedOrders.length,
            pendingOrders: pendingOrders.length,
            completionRate
        };
    }
}

// Order tracking utilities
class OrderTracker {
    static generateOrderNumber(existingOrders) {
        const lastOrderNumber = existingOrders.length > 0 ? 
            Math.max(...existingOrders.map(o => o.orderNumber || 0)) : 0;
        return lastOrderNumber + 1;
    }
    
    static createStatusHistoryEntry(status, updatedBy = 'system') {
        return {
            status,
            timestamp: new Date().toISOString(),
            updatedBy
        };
    }
    
    static updateOrderStatus(order, newStatus, updatedBy = 'system') {
        const updatedOrder = { ...order };
        updatedOrder.status = newStatus;
        updatedOrder.updatedAt = new Date().toISOString();
        
        if (!updatedOrder.statusHistory) {
            updatedOrder.statusHistory = [];
        }
        
        updatedOrder.statusHistory.push(
            OrderTracker.createStatusHistoryEntry(newStatus, updatedBy)
        );
        
        return updatedOrder;
    }
    
    static validateOrder(orderData) {
        const required = ['customer', 'product', 'quantity', 'price'];
        const missing = required.filter(field => !orderData[field]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required fields: ${missing.join(', ')}`);
        }
        
        if (orderData.quantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }
        
        if (orderData.price <= 0) {
            throw new Error('Price must be greater than 0');
        }
        
        return true;
    }
}

// Order search and filtering
class OrderFilter {
    static applyFilters(orders, filters) {
        let filteredOrders = [...orders];
        
        if (filters.query) {
            const query = filters.query.toLowerCase();
            filteredOrders = filteredOrders.filter(order =>
                order.customer.toLowerCase().includes(query) ||
                order.product.toLowerCase().includes(query) ||
                (order.orderNumber && order.orderNumber.toString().includes(query))
            );
        }
        
        if (filters.status) {
            filteredOrders = filteredOrders.filter(order => order.status === filters.status);
        }
        
        if (filters.customer) {
            filteredOrders = filteredOrders.filter(order =>
                order.customer.toLowerCase().includes(filters.customer.toLowerCase())
            );
        }
        
        if (filters.startDate) {
            filteredOrders = filteredOrders.filter(order =>
                new Date(order.createdAt || order.date) >= new Date(filters.startDate)
            );
        }
        
        if (filters.endDate) {
            filteredOrders = filteredOrders.filter(order =>
                new Date(order.createdAt || order.date) <= new Date(filters.endDate)
            );
        }
        
        return filteredOrders;
    }
    
    static sortOrders(orders, sortBy = 'orderNumber', direction = 'desc') {
        return orders.sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];
            
            if (sortBy === 'createdAt' || sortBy === 'date') {
                aVal = new Date(aVal);
                bVal = new Date(bVal);
            }
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        OrderAnalytics,
        OrderTracker,
        OrderFilter,
        ORDER_TRACKING_CONFIG
    };
}