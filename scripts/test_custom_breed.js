/**
 * Automated Verification Script for Custom & Searchable Breed Field
 */

async function testBreedWorkflow() {
  const base = 'http://localhost:5000/api';

  console.log('========================================================');
  console.log('🧪 TESTING CUSTOM & SEARCHABLE BREED WORKFLOW');
  console.log('========================================================\n');

  // Step 1: Admin Login
  console.log('[1/7] Logging in as Admin...');
  const loginRes = await fetch(`${base}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dhakadsourabh648@gmail.com',
      password: 'MAhadev@123',
    }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.token) {
    throw new Error('Admin login failed: ' + (loginData.message || loginRes.statusText));
  }
  const token = loginData.token;
  console.log('  -> PASS: Admin logged in with JWT token.\n');

  // Step 2: Add Puppy with an Existing Predefined Breed
  console.log('[2/7] Adding puppy with existing breed "Labrador Retriever"...');
  const existingBreedPayload = {
    name: 'Rocky',
    breed: 'Labrador Retriever',
    age: '45 Days',
    gender: 'Male',
    price: 24000,
    availability: 'Available',
    description: 'Charming playful Labrador Retriever puppy.',
    images: ['https://images.unsplash.com/photo-1591769225440-811ad7d6eab2?auto=format&fit=crop&w=800&q=80'],
  };
  const addExistingRes = await fetch(`${base}/puppies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(existingBreedPayload),
  });
  const addExistingData = await addExistingRes.json();
  if (addExistingRes.status !== 201 || !addExistingData.success) {
    throw new Error('Add existing breed puppy failed: ' + JSON.stringify(addExistingData));
  }
  const existingPuppyId = addExistingData.data._id || addExistingData.data.id;
  if (addExistingData.data.breed !== 'Labrador Retriever') {
    throw new Error(`Expected breed "Labrador Retriever", got "${addExistingData.data.breed}"`);
  }
  console.log(`  -> PASS: Puppy "Rocky" created with existing breed "${addExistingData.data.breed}" (ID: ${existingPuppyId}).\n`);

  // Step 3: Add Puppy with a New Custom Breed (with leading/trailing spaces to test trimming)
  console.log('[3/7] Adding puppy with custom breed "   Indian Spitz   "...');
  const customBreedPayload = {
    name: 'Sheru',
    breed: '   Indian Spitz   ',
    age: '50 Days',
    gender: 'Male',
    price: 18000,
    availability: 'Available',
    description: 'Alert and fluffy white Indian Spitz puppy raised in home nursery.',
    images: ['https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80'],
  };
  const addCustomRes = await fetch(`${base}/puppies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(customBreedPayload),
  });
  const addCustomData = await addCustomRes.json();
  if (addCustomRes.status !== 201 || !addCustomData.success) {
    throw new Error('Add custom breed puppy failed: ' + JSON.stringify(addCustomData));
  }
  const customPuppyId = addCustomData.data._id || addCustomData.data.id;
  if (addCustomData.data.breed !== 'Indian Spitz') {
    throw new Error(`Expected trimmed breed "Indian Spitz", got "${addCustomData.data.breed}"`);
  }
  console.log(`  -> PASS: Puppy "Sheru" created with trimmed custom breed "${addCustomData.data.breed}" (ID: ${customPuppyId}).\n`);

  // Step 4: Edit Custom Breed
  console.log('[4/7] Editing custom breed to "Indian Spitz (Snow White)"...');
  const editRes = await fetch(`${base}/puppies/${customPuppyId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      breed: '  Indian Spitz (Snow White)  ',
      price: 19500,
    }),
  });
  const editData = await editRes.json();
  if (!editData.success || editData.data.breed !== 'Indian Spitz (Snow White)') {
    throw new Error('Edit custom breed failed: ' + JSON.stringify(editData));
  }
  console.log(`  -> PASS: Puppy breed successfully updated to "${editData.data.breed}".\n`);

  // Step 5: Test Public Endpoint Display
  console.log('[5/7] Testing Public User Website display of custom breed...');
  const getPubRes = await fetch(`${base}/puppies/${customPuppyId}`);
  const getPubData = await getPubRes.json();
  if (!getPubData.success || getPubData.data.breed !== 'Indian Spitz (Snow White)') {
    throw new Error('Public user fetch of custom breed failed: ' + JSON.stringify(getPubData));
  }
  console.log(`  -> PASS: Public user endpoint returns breed "${getPubData.data.breed}" correctly.\n`);

  // Step 6: Test Search & Filter by Custom Breed
  console.log('[6/7] Testing search and filter by custom breed...');
  // 6a: Search by partial breed keyword "Spitz"
  const searchRes = await fetch(`${base}/puppies?search=Spitz`);
  const searchData = await searchRes.json();
  const searchFound = searchData.data?.some((p) => (p._id || p.id) === customPuppyId);
  if (!searchFound) {
    throw new Error('Search by "Spitz" did not return custom breed puppy');
  }
  console.log(`  -> PASS: Search for "Spitz" returned puppy (matched ${searchData.count} items).`);

  // 6b: Filter by exact breed name
  const filterRes = await fetch(`${base}/puppies?breed=${encodeURIComponent('Indian Spitz (Snow White)')}`);
  const filterData = await filterRes.json();
  const filterFound = filterData.data?.some((p) => (p._id || p.id) === customPuppyId);
  if (!filterFound) {
    throw new Error('Filter by exact custom breed failed');
  }
  console.log(`  -> PASS: Filter for "Indian Spitz (Snow White)" matched successfully.`);

  // Step 7: Validation Test - Empty Breed Rejected
  console.log('\n[7/7] Testing validation: Empty breed rejection...');
  const invalidRes = await fetch(`${base}/puppies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      ...customBreedPayload,
      name: 'Test Invalid',
      breed: '    ',
    }),
  });
  const invalidData = await invalidRes.json();
  if (invalidRes.status !== 400 || invalidData.success) {
    throw new Error('Empty breed was unexpectedly accepted!');
  }
  console.log('  -> PASS: Empty / whitespace-only breed correctly rejected with 400 Bad Request.\n');

  // Cleanup test puppies
  console.log('Cleaning up test puppies...');
  await fetch(`${base}/puppies/${existingPuppyId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  await fetch(`${base}/puppies/${customPuppyId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Cleanup complete.\n');

  console.log('========================================================');
  console.log('✨ ALL 7 CUSTOM BREED VERIFICATION TESTS PASSED!');
  console.log('========================================================');
}

testBreedWorkflow().catch((err) => {
  console.error('\n❌ Test Failure:', err.message);
  process.exit(1);
});
