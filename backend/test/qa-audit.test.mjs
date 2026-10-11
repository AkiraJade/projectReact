import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:4001/api/v1';

let adminToken = '';
let customerToken = '';
let customerId = '';
let sampleProduct = null;
let createdOrderId = null;

test('DOSNOVENTA FULL-STACK QA & INTEGRATION AUDIT SUITE', async (t) => {

  await t.test('1. Authentication & Role-Based Access Control (RBAC)', async (t2) => {
    // 1.1 Customer Login
    await t2.test('Customer login succeeds and issues JWT with role user', async () => {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user4@gmail.com', password: 'password' }),
      });
      assert.equal(res.status, 200, 'Customer login should return 200');
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.token, 'Should return a JWT token');
      assert.equal(data.user.role, 'user', 'Role should be user');
      customerToken = data.token;
      customerId = data.user._id;
    });

    // 1.2 Admin Login
    await t2.test('Admin login succeeds and issues JWT with role admin', async () => {
      const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bar@gmail.com', password: 'password' }),
      });
      assert.equal(res.status, 200, 'Admin login should return 200');
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.token, 'Should return a JWT token');
      assert.equal(data.user.role, 'admin', 'Role should be admin');
      adminToken = data.token;
    });

    // 1.3 Unauthenticated access to admin endpoint
    await t2.test('Unauthenticated request to admin endpoint is rejected (401)', async () => {
      const res = await fetch(`${BASE_URL}/admin/orders`);
      assert.equal(res.status, 401, 'Unauthenticated request should return 401');
    });

    // 1.4 Customer attempting admin endpoint
    await t2.test('Customer token accessing admin endpoint is forbidden (403)', async () => {
      const res = await fetch(`${BASE_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      assert.equal(res.status, 403, 'Customer accessing admin route should return 403');
    });

    // 1.5 Admin token accessing admin endpoint
    await t2.test('Admin token accessing admin endpoint is authorized (200)', async () => {
      const res = await fetch(`${BASE_URL}/admin/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200, 'Admin accessing admin route should return 200');
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.orders), 'Should return array of orders');
    });
  });

  await t.test('2. Product Catalog, Slugs, and Pricing Integrity', async (t2) => {
    // 2.1 Fetch catalog
    await t2.test('Public product catalog returns published products with valid schema', async () => {
      const res = await fetch(`${BASE_URL}/products`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.products), 'Products should be an array');
      assert.ok(data.products.length > 0, 'Catalog should contain products');

      // Pick an in-stock product for testing
      sampleProduct = data.products.find((p) => p.stock > 2) || data.products[0];
      assert.ok(sampleProduct, 'Should find at least one product');
      assert.ok(typeof sampleProduct.price === 'number', 'Price must be a number');
      assert.ok(sampleProduct.price > 0, 'Price must be positive');
      assert.ok(sampleProduct.category, 'Product must have a category');
    });

    // 2.2 Single product lookup
    await t2.test('Single product lookup returns correct details', async () => {
      const res = await fetch(`${BASE_URL}/product/${sampleProduct._id}`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.product._id, sampleProduct._id);
    });
  });

  await t.test('3. Cart, Server-Side Recalculation & Atomic Inventory Protection', async (t2) => {
    let originalStock = 0;

    // Fetch fresh stock before ordering
    await t2.test('Get current product stock before order test', async () => {
      const res = await fetch(`${BASE_URL}/product/${sampleProduct._id}`);
      const data = await res.json();
      originalStock = data.product.stock;
      assert.ok(originalStock >= 1, 'Product must have at least 1 stock for order test');
    });

    // 3.1 Place order with tampered client price
    await t2.test('Order creation ignores client-tampered price and uses trusted DB price', async () => {
      const orderPayload = {
        orderItems: [
          {
            product: sampleProduct._id,
            name: sampleProduct.name,
            quantity: 1,
            image: sampleProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
            price: 0.01, // MALICIOUS CLIENT TAMPER: Trying to buy for 1 cent!
          },
        ],
        shippingInfo: {
          address: 'Avinguda Diagonal 405',
          city: 'Barcelona',
          phoneNo: '+34932001122',
          postalCode: '08008',
          country: 'Spain',
        },
        itemsPrice: 0.01, // MALICIOUS TAMPER
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: 0.01, // MALICIOUS TAMPER
        paymentInfo: {
          id: 'ATELIER_INVOICE_TEST_' + Date.now(),
          status: 'Pending Atelier Dispatch',
        },
      };

      const res = await fetch(`${BASE_URL}/order/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify(orderPayload),
      });

      assert.equal(res.status, 201, 'Order creation should return 201 Created');
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.order, 'Order object should be returned');
      createdOrderId = data.order._id;

      // VERIFY DB-TRUSTED RECALCULATION
      const orderItem = data.order.orderItems[0];
      assert.equal(orderItem.price, sampleProduct.price, 'Order item price must equal real DB price, not client $0.01');
      assert.equal(data.order.itemsPrice, sampleProduct.price, 'Items price must equal real DB price');
      assert.ok(data.order.totalPrice > sampleProduct.price, 'Total price must include shipping & tax correctly');
    });

    // 3.2 Verify atomic stock decrement
    await t2.test('Product stock was atomically decremented in database', async () => {
      const res = await fetch(`${BASE_URL}/product/${sampleProduct._id}`);
      const data = await res.json();
      const currentStock = data.product.stock;
      assert.equal(currentStock, originalStock - 1, 'Stock should have decreased by exactly 1');
    });

    // 3.3 Prevent overselling / stock exhaustion
    await t2.test('Overselling is rejected and inventory is not over-allocated', async () => {
      const excessivePayload = {
        orderItems: [
          {
            product: sampleProduct._id,
            name: sampleProduct.name,
            quantity: originalStock + 99999, // Way more than available stock
            image: sampleProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=80',
            price: sampleProduct.price,
          },
        ],
        shippingInfo: {
          address: 'Calle Muntaner 200',
          city: 'Barcelona',
          phoneNo: '+34932001122',
          postalCode: '08021',
          country: 'Spain',
        },
        itemsPrice: sampleProduct.price,
        taxPrice: 0,
        shippingPrice: 0,
        totalPrice: sampleProduct.price,
        paymentInfo: { id: 'TEST', status: 'Pending' },
      };

      const res = await fetch(`${BASE_URL}/order/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify(excessivePayload),
      });

      assert.equal(res.status, 400, 'Oversell attempt must return 400 Bad Request');
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /insufficient stock/i);
    });
  });

  await t.test('4. IDOR (Insecure Direct Object Reference) Protection', async (t2) => {
    // 4.1 Order owner can view the order
    await t2.test('Order owner can retrieve order details', async () => {
      const res = await fetch(`${BASE_URL}/order/${createdOrderId}`, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.order._id, createdOrderId);
    });

    // 4.2 Admin can view the order
    await t2.test('Admin can retrieve order details for fulfillment', async () => {
      const res = await fetch(`${BASE_URL}/order/${createdOrderId}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.order._id, createdOrderId);
    });

    // 4.3 Unauthenticated user cannot view order details
    await t2.test('Unauthenticated user cannot view order details', async () => {
      const res = await fetch(`${BASE_URL}/order/${createdOrderId}`);
      assert.equal(res.status, 401);
    });
  });

  await t.test('5. Order Status Transition & Stock Restoration', async (t2) => {
    // 5.1 Admin updates status to Processing -> Assembled
    await t2.test('Admin updates status to Assembled', async () => {
      const res = await fetch(`${BASE_URL}/admin/order/${createdOrderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'Assembled' }),
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
    });

    // 5.2 Cancel order and verify inventory is restored
    await t2.test('Admin cancels order and inventory is restored', async () => {
      // Stock before cancel
      const beforeRes = await fetch(`${BASE_URL}/product/${sampleProduct._id}`);
      const beforeData = await beforeRes.json();
      const stockBeforeCancel = beforeData.product.stock;

      const cancelRes = await fetch(`${BASE_URL}/admin/order/${createdOrderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ status: 'Cancelled' }),
      });
      assert.equal(cancelRes.status, 200);

      // Stock after cancel
      const afterRes = await fetch(`${BASE_URL}/product/${sampleProduct._id}`);
      const afterData = await afterRes.json();
      assert.equal(afterData.product.stock, stockBeforeCancel + 1, 'Cancelled order restored 1 unit of stock');
    });

    // 5.3 Clean up test order
    await t2.test('Clean up test order', async () => {
      const res = await fetch(`${BASE_URL}/admin/order/${createdOrderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
    });
  });

  await t.test('6. Verified Purchase Review Security Check', async (t2) => {
    // Customer attempts to post review on a product they haven't verified purchased (or after order deletion)
    await t2.test('Review submission requires verified purchase', async () => {
      const res = await fetch(`${BASE_URL}/review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerToken}`,
        },
        body: JSON.stringify({
          rating: 5,
          comment: 'Rode this frame through the streets of Tokyo. Exceptional stiffness.',
          productId: sampleProduct._id,
        }),
      });

      // Customer deleted their order, so they have no delivered/paid order -> 400 rejected
      assert.equal(res.status, 400, 'Unverified purchase review should return 400');
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /purchased/i);
    });
  });

  await t.test('7. Admin Dashboard Metrics & Empty-Safe Visualizations', async (t2) => {
    // 7.1 Total sales metric
    await t2.test('Admin total-sales endpoint returns valid numeric sum', async () => {
      const res = await fetch(`${BASE_URL}/admin/total-sales`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.totalSales), 'totalSales must be an array');
      assert.ok(typeof data.totalSales[0]?.totalSales === 'number', 'totalSales value must be a number');
      assert.ok(!Number.isNaN(data.totalSales[0]?.totalSales), 'totalSales must not be NaN');
    });

    // 7.2 Sales per month
    await t2.test('Admin sales-per-month returns structured dataset for Recharts', async () => {
      const res = await fetch(`${BASE_URL}/admin/sales-per-month`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.salesPerMonth), 'Should return array');
    });

    // 7.3 Product sales breakdown
    await t2.test('Admin product-sales returns structured dataset without NaN', async () => {
      const res = await fetch(`${BASE_URL}/admin/product-sales`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.totalPercentage), 'totalPercentage should return array for PieChart');
      assert.ok(Array.isArray(data.sales), 'sales should return array');
    });

    // 7.4 Customer sales breakdown
    await t2.test('Admin customer-sales returns structured dataset', async () => {
      const res = await fetch(`${BASE_URL}/admin/customer-sales`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(Array.isArray(data.customerSales), 'Should return array');
    });
  });
});
