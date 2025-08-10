const API_URL = 'http://localhost:3000/orders';

// Event to notify all open windows/tabs of data changes
function notifyDataChange() {
    localStorage.setItem('lastUpdate', Date.now().toString());
}

// Listen for changes from other windows/tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'lastUpdate') {
        // Refresh the current page's data
        if (typeof refreshDashboard === 'function') {
            refreshDashboard();
        }
        if (typeof renderAllRecordedOrdersTable === 'function') {
            renderAllRecordedOrdersTable();
        }
    }
});

// Fetch all orders from backend
async function fetchOrders() {
    const res = await fetch(API_URL);
    return await res.json();
}

// Add a new order
async function addOrder(order) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });
    const result = await res.json();
    notifyDataChange(); // Notify other windows/tabs
    return result;
}

// Delete an order
async function deleteOrder(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    notifyDataChange(); // Notify other windows/tabs
}

// Update an order
async function updateOrder(id, updates) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    const result = await res.json();
    notifyDataChange(); // Notify other windows/tabs
    return result;
}

// Render orders table
async function renderOrdersTable(tableId, filterFn = null) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const orders = await fetchOrders();
    const filteredOrders = filterFn ? orders.filter(filterFn) : orders;
    
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';

    filteredOrders.forEach(order => {
        const row = document.createElement('tr');
        const statusOptions = ['Awaiting Payment', 'Pending', 'Completed', 'Back Order']
            .map(status => 
                `<option value="${status}"${status === order.status ? ' selected' : ''}>${status}</option>`
            ).join('');

        row.innerHTML = `
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.quantity}</td>
            <td>R${order.price.toFixed(2)}</td>
            <td>R${order.total.toFixed(2)}</td>
            <td>
                <select class="form-select form-select-sm status-select" data-id="${order.id}">
                    ${statusOptions}
                </select>
            </td>
            <td>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${order.id}">
                    <i class="fa fa-trash"></i> Delete
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}