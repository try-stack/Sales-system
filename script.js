const API_URL = 'http://localhost:3000/orders';

// Example array holding sales orders
let salesOrders = [
    // { id: 1, completed: false, ... }
];

// Function to delete an order by ID with confirmation
function deleteOrder(orderId) {
    if (confirm('Are you sure you want to delete this order?')) {
        salesOrders = salesOrders.filter(order => order.id !== orderId);
        renderSalesOrders();
    }
}

// Function to render sales orders
function renderSalesOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    ordersContainer.innerHTML = '';

    if (salesOrders.length === 0) {
        ordersContainer.textContent = 'No sales orders recorded.';
        return;
    }

    salesOrders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.textContent = `Order #${order.id} `;

        // Completed checkbox
        const completedCheckbox = document.createElement('input');
        completedCheckbox.type = 'checkbox';
        completedCheckbox.disabled = true;
        completedCheckbox.checked = !!order.completed;
        completedCheckbox.title = 'Completed';
        orderDiv.appendChild(completedCheckbox);

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteOrder(order.id);
        orderDiv.appendChild(deleteBtn);

        ordersContainer.appendChild(orderDiv);
    });
}

// Fetch all orders from backend
async function fetchOrders() {
    const res = await fetch(API_URL);
    return res.json();
}

// Add a new order
async function addOrder(order) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
    });
    return res.json();
}

// Delete an order by id
async function deleteOrder(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
}

// Update an order by id
async function updateOrder(id, updates) {
    const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    return res.json();
}

// Render all recorded orders
async function renderAllRecordedOrdersTable() {
    const tableBody = document.querySelector('#allRecordedOrdersTable tbody');
    tableBody.innerHTML = '';
    const orders = await fetchOrders();
    orders.forEach((order, idx) => {
        const row = document.createElement('tr');
        // Status dropdown
        const statusOptions = ['Awaiting Payment', 'Pending', 'Completed', 'Back Order']
            .map(status =>
                `<option value="${status}"${order.status === status ? ' selected' : ''}>${status}</option>`
            ).join('');
        row.innerHTML = `
            <td>${order.customer}</td>
            <td>${order.product}</td>
            <td>${order.quantity}</td>
            <td>R${order.price.toFixed(2)}</td>
            <td>R${order.total.toFixed(2)}</td>
            <td>
                <select class="form-select form-select-sm order-status-select" data-id="${order.id}">
                    ${statusOptions}
                </select>
            </td>
            <td>${dayjs(order.date).format('YYYY-MM-DD HH:mm')}</td>
            <td><button class="btn btn-danger btn-sm delete-order" data-id="${order.id}"><i class="fa fa-trash"></i> Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}
 document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('orderForm');
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const user = getSessionUser();
                if (!user) return; // extra safety
                const customer = document.getElementById('customer').value.trim();
                const product = document.getElementById('product').value.trim();
                const quantity = parseInt(document.getElementById('quantity').value, 10);
                const price = parseFloat(document.getElementById('price').value);
                const status = document.getElementById('status').value;
                const date = new Date().toISOString();
                const total = quantity * price;

                const order = { customer, product, quantity, price, total, status, date, username: user.username };

                // Save to localStorage
                const orders = JSON.parse(localStorage.getItem('orders')) || [];
                orders.push(order);
                localStorage.setItem('orders', JSON.stringify(orders));
                renderSalesOrders();
                form.reset();
            });
        });

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('orderForm');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const customer = document.getElementById('customer').value.trim();
        const product = document.getElementById('product').value.trim();
        const quantity = parseInt(document.getElementById('quantity').value, 10);
        const price = parseFloat(document.getElementById('price').value);
        const status = document.getElementById('status').value;
        const date = new Date().toISOString();
        const total = quantity * price;

        const order = { customer, product, quantity, price, total, status, date };
        await addOrder(order);
        await renderAllRecordedOrdersTable();
        form.reset();
    });

    // Delegate delete and status change events
    document.querySelector('#allRecordedOrdersTable tbody').addEventListener('click', async function(e) {
        if (e.target.closest('.delete-order')) {
            const id = e.target.closest('.delete-order').getAttribute('data-id');
            if (confirm('Are you sure you want to delete this order?')) {
                await deleteOrder(id);
                await renderAllRecordedOrdersTable();
            }
        }
    });
        const sales = [];

    function addSale() {
      const item = document.getElementById('item').value;
      const price = document.getElementById('price').value;
      if (item && price) {
        sales.push({ item, price });
        const li = document.createElement('li');
        li.textContent = `${item}: R${price}`;
        document.getElementById('salesList').appendChild(li);
        document.getElementById('item').value = '';
        document.getElementById('price').value = '';
      }
    }

    function saveSales() {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const dayStr = now.toLocaleString('en-us', { weekday: 'long' });
      const filename = `sales_${dateStr}_${dayStr}.txt`;

      let content = `Sales Report - ${dayStr}, ${dateStr}\n`;
      content += '-'.repeat(40) + '\n';
      sales.forEach(s => {
        content += `${s.item}: R${s.price}\n`;
      });
      content += '-'.repeat(40) + '\n';
      content += `Total Items Sold: ${sales.length}\n`;

      const blob = new Blob([content], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }

    document.querySelector('#allRecordedOrdersTable tbody').addEventListener('change', async function(e) {
        if (e.target.classList.contains('order-status-select')) {
            const id = e.target.getAttribute('data-id');
            const newStatus = e.target.value;
            await updateOrder(id, { status: newStatus });
            await renderAllRecordedOrdersTable();
        }
    });

    // Initial render
    renderAllRecordedOrdersTable();
});
// Initial total sales render
renderTotalSales();
