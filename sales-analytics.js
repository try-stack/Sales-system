// sales-analytics.js
// Sales analytics for best-selling products, top customers, and sales trends

function getUserOrders() {
    const user = JSON.parse(localStorage.getItem('salesUser') || 'null');
    if (!user) return [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    return orders.filter(o => o.username === user.username);
}

function getBestSellingProducts(orders, topN = 3) {
    const productMap = {};
    orders.forEach(order => {
        if (!productMap[order.product]) productMap[order.product] = 0;
        productMap[order.product] += order.quantity;
    });
    return Object.entries(productMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([product, qty]) => ({ product, qty }));
}

function getTopCustomers(orders, topN = 3) {
    const customerMap = {};
    orders.forEach(order => {
        if (!customerMap[order.customer]) customerMap[order.customer] = 0;
        customerMap[order.customer] += order.total;
    });
    return Object.entries(customerMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN)
        .map(([customer, total]) => ({ customer, total }));
}

function getSalesTrends(orders) {
    // Group by month
    const monthMap = {};
    orders.forEach(order => {
        const month = order.date ? order.date.slice(0, 7) : 'Unknown';
        if (!monthMap[month]) monthMap[month] = 0;
        monthMap[month] += order.total;
    });
    return Object.entries(monthMap)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([month, total]) => ({ month, total }));
}

function getRecommendations(orders) {
    const bestProducts = getBestSellingProducts(orders, 1);
    if (bestProducts.length && bestProducts[0].qty > 5) {
        return `Consider stocking up on "${bestProducts[0].product}". It's selling fast!`;
    }
    if (orders.length === 0) {
        return 'No sales data yet. Start recording orders!';
    }
    return 'Keep tracking your sales for more insights.';
}

// Example usage: Call this on dashboard or analytics page
function renderSalesAnalytics() {
    const orders = getUserOrders();
    const bestProducts = getBestSellingProducts(orders);
    const topCustomers = getTopCustomers(orders);
    const trends = getSalesTrends(orders);
    const recommendation = getRecommendations(orders);

    // Render to HTML (assumes you have these elements)
    const bestProductsEl = document.getElementById('bestProducts');
    const topCustomersEl = document.getElementById('topCustomers');
    const salesTrendsEl = document.getElementById('salesTrends');
    const recommendationEl = document.getElementById('salesRecommendation');

    if (bestProductsEl) {
        bestProductsEl.innerHTML = bestProducts.map(p => `<li>${p.product} (${p.qty} sold)</li>`).join('') || '<li>No data</li>';
    }
    if (topCustomersEl) {
        topCustomersEl.innerHTML = topCustomers.map(c => `<li>${c.customer} (R${c.total.toFixed(2)})</li>`).join('') || '<li>No data</li>';
    }
    if (salesTrendsEl) {
        salesTrendsEl.innerHTML = trends.map(t => `<li>${t.month}: R${t.total.toFixed(2)}</li>`).join('') || '<li>No data</li>';
    }
    if (recommendationEl) {
        recommendationEl.textContent = recommendation;
    }
}

// To use: Add <ul id="bestProducts"></ul>, <ul id="topCustomers"></ul>, <ul id="salesTrends"></ul>, <div id="salesRecommendation"></div> to your dashboard or analytics page, and call renderSalesAnalytics() on load.
