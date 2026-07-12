# Security Specification — Gram Setu

## 1. Data Invariants
- An issue cannot be created without a category, description, photoUrl, latitude, longitude, and status.
- Only the `Submitted`, `In Progress`, and `Resolved` states are valid.
- The `submittedByUid` must match the actual logged-in user's UID (`request.auth.uid`).
- Once an issue is created, fields like `category`, `description`, `photoUrl`, `latitude`, `longitude`, `submittedByUid`, and `createdAt` are immutable and cannot be changed during updates.
- Only `status`, `resolutionNote`, and `updatedAt` can be updated.

## 2. The "Dirty Dozen" Payloads
These payloads attempt to bypass identity, integrity, and state transition laws, and must be rejected:

1. **Unauthenticated Write**: Creating an issue without being signed in.
2. **Identity Spoofing**: Creating an issue where `submittedByUid` does not match the requester's UID.
3. **Invalid Category**: Creating an issue with an unlisted category (e.g., "UFO Landing").
4. **Massive Description**: Creating an issue with a description exceeding 1000 characters.
5. **Massive Photo URL**: Creating an issue with a photo URL exceeding 300,000 characters.
6. **Negative Location Range**: Coordinates that are invalid or not numbers.
7. **Bypassing Mandatory Fields**: Creating an issue without a photo.
8. **Malicious Role Update**: Updating the status of an issue to an unauthorized status value.
9. **Tampering with Immutable Fields**: Attempting to update the `description` or `category` of an existing issue.
10. **Altering Creation Timestamp**: Updating the `createdAt` timestamp of an existing issue.
11. **Injecting Ghost Fields**: Attempting to update an issue with an unmapped field (e.g., `adminSecret: "hack"`).
12. **Bypassing Client-provided UIDs**: Updating `submittedByUid` to a different UID on update.

## 3. Conceptual Test Suite (firestore.rules.test.ts)

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing';

// Verification suite for the 12 malicious payloads
describe('Gram Setu Security Rules', () => {
  let testEnv;

  beforeAll(async () => {
    testEnv = await initializeTestEnvironment({
      projectId: 'gen-lang-client-0565266851',
    });
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  it('blocks unauthenticated writes', async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(db.collection('issues').add({
      category: 'Road Damage',
      description: 'Pothole on main street',
      photoUrl: 'data:image/jpeg;base64,...',
      latitude: 17.5,
      longitude: 80.2,
      status: 'Submitted',
      submittedByUid: 'anon-123',
    }));
  });

  it('blocks identity spoofing', async () => {
    const db = testEnv.authenticatedContext('user-abc').firestore();
    await assertFails(db.collection('issues').add({
      category: 'Road Damage',
      description: 'Pothole on main street',
      photoUrl: 'data:image/jpeg;base64,...',
      latitude: 17.5,
      longitude: 80.2,
      status: 'Submitted',
      submittedByUid: 'spoofed-user', // does not match 'user-abc'
    }));
  });
});
```
