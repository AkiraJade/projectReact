import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = 'http://localhost:4001/api/v1';

test('DOSNOVENTA PHASE 5: REGISTRATION, ADDRESSES & AVATAR TEST SUITE', async (t) => {
  const timestamp = Date.now();
  const testEmail1 = `rider_${timestamp}_1@test.com`;
  const testEmail2 = `rider_${timestamp}_2@test.com`;
  const testEmail3 = `rider_${timestamp}_3@test.com`;

  let token1 = '';
  let token2 = '';
  let address1Id = '';
  let address2Id = '';

  // 1. REGISTRATION TESTS
  await t.test('1. Customer Registration Scenarios', async (t2) => {
    // 1.1 Register without address or avatar
    await t2.test('Registering without address or avatar succeeds with empty addresses', async () => {
      const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Pau Gasol',
          email: testEmail1,
          password: 'password123'
        })
      });

      assert.equal(res.status, 201, 'Should return 201 Created');
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.token);
      assert.ok(data.user);
      assert.equal(data.user.name, 'Pau Gasol');
      assert.equal(data.user.email, testEmail1);
      assert.equal(Array.isArray(data.user.addresses), true);
      assert.equal(data.user.addresses.length, 0, 'Addresses should be empty');
      assert.ok(data.user.avatar.url, 'Should have default avatar');
      token1 = data.token;
    });

    // 1.2 Partial address rejection
    await t2.test('Submitting a partially completed address produces validation error (400)', async () => {
      const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Incomplete Rider',
          email: `incomplete_${timestamp}@test.com`,
          password: 'password123',
          addressLine1: 'Carrer de Girona 42' // Missing recipient, phone, city, postalCode, country
        })
      });

      assert.equal(res.status, 400, 'Should return 400 Bad Request');
      const data = await res.json();
      assert.equal(data.success, false);
      assert.ok(data.message.includes('Incomplete delivery address'));
    });

    // 1.3 Register with complete address
    await t2.test('Registering with complete address succeeds and saves default address', async () => {
      const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Marco Gomez',
          email: testEmail2,
          password: 'password123',
          recipientName: 'Marco Gomez',
          phone: '+34 600 123 456',
          addressLine1: 'Carrer dels Tallers 12',
          addressLine2: 'Attic B',
          city: 'Barcelona',
          province: 'Catalunya',
          postalCode: '08001',
          country: 'Spain',
          label: 'Atelier Home'
        })
      });

      assert.equal(res.status, 201, 'Should return 201 Created');
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.user.addresses.length, 1);
      assert.equal(data.user.addresses[0].isDefault, true);
      assert.equal(data.user.addresses[0].city, 'Barcelona');
      assert.equal(data.user.addresses[0].label, 'Atelier Home');
      token2 = data.token;
      address1Id = data.user.addresses[0]._id;
    });
  });

  // 2. SAVED ADDRESS MANAGEMENT (CRUD & OWNERSHIP)
  await t.test('2. Saved Address Management', async (t2) => {
    // 2.1 Get addresses for user 1 (empty initially)
    await t2.test('Retrieve authenticated customer saved addresses', async () => {
      const res = await fetch(`${BASE_URL}/me/addresses`, {
        headers: { Authorization: `Bearer ${token1}` }
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.deepEqual(data.addresses, []);
    });

    // 2.2 Add new address for user 1
    await t2.test('Customer can add a new address and it becomes default if first', async () => {
      const res = await fetch(`${BASE_URL}/me/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`
        },
        body: JSON.stringify({
          label: 'Home',
          recipientName: 'Pau Gasol',
          phone: '+34 611 222 333',
          addressLine1: 'Passeig de Gracia 92',
          city: 'Barcelona',
          postalCode: '08008',
          country: 'Spain'
        })
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.addresses.length, 1);
      assert.equal(data.addresses[0].isDefault, true);
      address1Id = data.addresses[0]._id;
    });

    // 2.3 Add second address (marked as default)
    await t2.test('Adding second address with isDefault=true unsets previous default', async () => {
      const res = await fetch(`${BASE_URL}/me/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`
        },
        body: JSON.stringify({
          label: 'Studio / Velodrome',
          recipientName: 'Pau Gasol Studio',
          phone: '+34 622 333 444',
          addressLine1: 'Carrer de Mallorca 240',
          city: 'Barcelona',
          postalCode: '08008',
          country: 'Spain',
          isDefault: true
        })
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.addresses.length, 2);

      const first = data.addresses.find((a) => a._id === address1Id);
      const second = data.addresses.find((a) => a._id !== address1Id);

      assert.equal(first.isDefault, false, 'Previous default should be unset');
      assert.equal(second.isDefault, true, 'New address should be default');
      address2Id = second._id;
    });

    // 2.4 Update an address
    await t2.test('Customer can update an existing address', async () => {
      const res = await fetch(`${BASE_URL}/me/addresses/${address1Id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`
        },
        body: JSON.stringify({
          city: 'Girona',
          label: 'Girona HQ'
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      const updated = data.addresses.find((a) => a._id === address1Id);
      assert.equal(updated.city, 'Girona');
      assert.equal(updated.label, 'Girona HQ');
    });

    // 2.5 Set address as default
    await t2.test('Setting address as default updates default flag correctly', async () => {
      const res = await fetch(`${BASE_URL}/me/addresses/${address1Id}/default`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token1}` }
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      const first = data.addresses.find((a) => a._id === address1Id);
      const second = data.addresses.find((a) => a._id === address2Id);

      assert.equal(first.isDefault, true);
      assert.equal(second.isDefault, false);
    });

    // 2.6 IDOR Protection: User 2 cannot access or delete User 1's address
    await t2.test('IDOR Protection: Customer cannot modify or delete another customer address', async () => {
      const res = await fetch(`${BASE_URL}/me/addresses/${address1Id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token2}` } // token2 belongs to Marco, address1Id belongs to Pau
      });

      assert.equal(res.status, 404, 'Should not find address in user2 account');
    });

    // 2.7 Delete address with default promotion
    await t2.test('Deleting default address promotes remaining address to default', async () => {
      // address1Id is currently default
      const res = await fetch(`${BASE_URL}/me/addresses/${address1Id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token1}` }
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.addresses.length, 1);
      assert.equal(data.addresses[0]._id, address2Id);
      assert.equal(data.addresses[0].isDefault, true, 'Remaining address should now be default');
    });
  });

  // 3. PROFILE & AVATAR TESTS
  await t.test('3. Profile & Avatar Integrity', async (t2) => {
    await t2.test('Customer profile returns avatar, name, email and addresses', async () => {
      const res = await fetch(`${BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${token1}` }
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.user.avatar);
      assert.ok(data.user.addresses);
      assert.equal(data.user.password, undefined, 'Password must not be returned');
    });

    await t2.test('Customer profile can update display name and email', async () => {
      const res = await fetch(`${BASE_URL}/me/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token1}`
        },
        body: JSON.stringify({
          name: 'Pau Gasol Updated'
        })
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.user.name, 'Pau Gasol Updated');
    });
  });
});
