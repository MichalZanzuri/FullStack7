import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:5001';

test('FullStack E-Commerce API Suite', async (t) => {
  let adminToken = '';
  let customerToken = '';
  let customerId = null;
  let testOrderId = null;
  let sampleProductId = null;

  await t.test('1. GET /api/products returns catalog from MongoDB', async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0, 'Catalog should have seeded products');
    sampleProductId = data[0]._id;
    assert.ok(data[0].name);
    assert.ok(data[0].customizationOptions);
  });

  await t.test('2. POST /api/auth/login logs in default admin', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@store.com',
        password: 'admin'
      })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.token);
    assert.equal(data.user.role, 'admin');
    adminToken = data.token;
  });

  await t.test('3. POST /api/auth/register creates a new customer user in MySQL', async () => {
    const testEmail = `tester_${Date.now()}@example.com`;
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Customer',
        email: testEmail,
        password: 'password123',
        role: 'customer'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.token);
    assert.equal(data.user.name, 'Test Customer');
    assert.equal(data.user.role, 'customer');
    customerToken = data.token;
    customerId = data.user.id;
  });

  await t.test('4. GET /api/auth/profile validates JWT session in MySQL', async () => {
    const res = await fetch(`${BASE_URL}/api/auth/profile`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.name, 'Test Customer');
    assert.equal(data.role, 'customer');
  });

  await t.test('5. POST /api/orders places a customized order into MySQL', async () => {
    const orderPayload = {
      items: [
        {
          productId: sampleProductId,
          name: 'Custom Pro Build',
          price: 349,
          quantity: 2,
          selectedOptions: {
            'Color Finish': 'Midnight Black',
            'Material': 'Carbon Fiber'
          }
        }
      ],
      totalPrice: 698
    };

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${customerToken}`
      },
      body: JSON.stringify(orderPayload)
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.id || data.orderId);
    testOrderId = data.id || data.orderId;
  });

  await t.test('6. GET /api/orders allows admin to view pipeline orders with parsed JSON items', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(Array.isArray(data));
    const createdOrder = data.find(o => o.id === testOrderId);
    assert.ok(createdOrder, 'Created order should be in pipeline');
    assert.equal(createdOrder.status, 'Pending');
    assert.ok(Array.isArray(createdOrder.items));
    assert.equal(createdOrder.items[0].selectedOptions['Color Finish'], 'Midnight Black');
  });

  await t.test('7. PATCH /api/orders/:id/status advances order status (Admin Only)', async () => {
    const res = await fetch(`${BASE_URL}/api/orders/${testOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Processing' })
    });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'Processing');
  });

  await t.test('8. Non-admin customer cannot access admin routes (403 Forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    assert.equal(res.status, 403);
  });
});
