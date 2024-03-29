import * as assert from 'assert';
import { KeyedObservableArray, ChangeInfo } from '../dist/main.js';

interface Item {
  id: number;
  name: string;
}

function getKA(immutable: boolean) {
  const ka = new KeyedObservableArray<number, Item>(immutable, (it) => it.id);
  ka.push([{ id: 1, name: '1' }]);
  return ka;
}

function getFalsyValueKA(immutable: boolean) {
  const ka = new KeyedObservableArray<number, number>(immutable, (it) => it);
  for (let i = 0; i < 5; i++) {
    ka.push([i]);
  }
  return ka;
}

function testKAContent<K, T>(ka: KeyedObservableArray<K, T>, expected: T[], keyFn: (item: T) => K) {
  const keys = expected.map((el) => keyFn(el));
  assert.deepStrictEqual(new Set(ka.map.keys()), new Set(keys));
  assert.deepStrictEqual(new Set(ka.map.values()), new Set(expected));
  assert.deepStrictEqual(ka.array, expected);
}

it('Immutable', () => {
  const ka = getKA(true);
  assert.strictEqual(ka.immutable, true);

  let e: ChangeInfo<number> | undefined;
  ka.changed = (_, c) => (e = c);

  // Push
  let before = ka.array;
  ka.push(
    [
      { id: -1, name: '-1' },
      { id: 1, name: '1' },
    ],
    { tag: 'push' },
  );
  let after = ka.array;
  assert.ok(before !== after);
  assert.deepStrictEqual(e, {
    numberOfChanges: 1,
    countDelta: 1,
    added: [-1],
    tag: 'push',
    index: 2,
  });
  testKAContent(
    ka,
    [
      { id: 1, name: '1' },
      { id: -1, name: '-1' },
    ],
    (el) => el.id,
  );

  // Delete by index
  before = ka.array;
  ka.deleteByIndex(0, { tag: 'del' });
  after = ka.array;
  assert.ok(before !== after);
  // Key of the item at index 0 is 1.
  assert.deepStrictEqual(e, {
    numberOfChanges: 1,
    countDelta: -1,
    removed: [1],
    tag: 'del',
    index: 0,
  });
  testKAContent(ka, [{ id: -1, name: '-1' }], (el) => el.id);

  // Insert
  before = ka.array;
  ka.insert(
    1,
    [
      { id: 2, name: '2' },
      { id: -1, name: '-1' },
    ],
    { tag: 'ins' },
  );
  after = ka.array;
  assert.ok(before !== after);
  assert.deepStrictEqual(e, {
    numberOfChanges: 1,
    countDelta: 1,
    added: [2],
    tag: 'ins',
    index: 1,
  });
  testKAContent(
    ka,
    [
      { id: -1, name: '-1' },
      { id: 2, name: '2' },
    ],
    (el) => el.id,
  );

  // Delete by key
  before = ka.array;
  ka.deleteByKey(2, { tag: 'delByKey' });
  after = ka.array;
  assert.ok(before !== after);
  assert.deepStrictEqual(e, {
    numberOfChanges: 1,
    countDelta: -1,
    removed: [2],
    tag: 'delByKey',
    index: 1,
  });
  testKAContent(ka, [{ id: -1, name: '-1' }], (el) => el.id);

  // Update by key
  before = ka.array;
  ka.update({ id: -1, name: '-1 updated' }, { tag: 'upd' });
  after = ka.array;
  assert.ok(before !== after);
  assert.deepStrictEqual(e, {
    numberOfChanges: 1,
    countDelta: 0,
    updated: [-1],
    tag: 'upd',
    index: 0,
  });
  testKAContent(ka, [{ id: -1, name: '-1 updated' }], (el) => el.id);

  // Reset
  before = ka.array;
  ka.reset(
    [
      { id: 1, name: '1' },
      { id: 3, name: '3' },
      { id: 2, name: '2' },
    ],
    { tag: 'reset' },
  );
  after = ka.array;
  assert.ok(before !== after);
  assert.deepStrictEqual(e, {
    numberOfChanges: 3,
    countDelta: 2,
    tag: 'reset',
    index: 0,
  });
  testKAContent(
    ka,
    [
      { id: 1, name: '1' },
      { id: 3, name: '3' },
      { id: 2, name: '2' },
    ],
    (el) => el.id,
  );

  // Sort
  before = ka.array;
  ka.sort((a, b) => a.id - b.id, { tag: 'sort' });
  after = ka.array;
  assert.ok(before !== after);
  assert.deepStrictEqual(e, {
    numberOfChanges: 3,
    countDelta: 0,
    tag: 'sort',
    index: 0,
  });
  testKAContent(
    ka,
    [
      { id: 1, name: '1' },
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ],
    (el) => el.id,
  );
});

it('Mutable', () => {
  const ka = getKA(false);
  assert.strictEqual(ka.immutable, false);

  // Push
  let before = ka.array;
  ka.push([
    { id: -1, name: '-1' },
    { id: 1, name: '1' },
  ]);
  let after = ka.array;
  assert.ok(before === after);
  testKAContent(
    ka,
    [
      { id: 1, name: '1' },
      { id: -1, name: '-1' },
    ],
    (el) => el.id,
  );

  // Delete by index
  before = ka.array;
  ka.deleteByIndex(0);
  after = ka.array;
  assert.ok(before === after);
  testKAContent(ka, [{ id: -1, name: '-1' }], (el) => el.id);

  // Insert
  before = ka.array;
  ka.insert(1, [
    { id: 2, name: '2' },
    { id: -1, name: '-1' },
  ]);
  after = ka.array;
  assert.ok(before === after);
  testKAContent(
    ka,
    [
      { id: -1, name: '-1' },
      { id: 2, name: '2' },
    ],
    (el) => el.id,
  );

  // Delete by key
  before = ka.array;
  ka.deleteByKey(2);
  after = ka.array;
  assert.ok(before === after);
  testKAContent(ka, [{ id: -1, name: '-1' }], (el) => el.id);

  // Update by key
  before = ka.array;
  ka.update({ id: -1, name: '-1 updated' });
  after = ka.array;
  assert.ok(before === after);
  testKAContent(ka, [{ id: -1, name: '-1 updated' }], (el) => el.id);

  // Reset
  before = ka.array;
  ka.reset([
    { id: 1, name: '1' },
    { id: 3, name: '3' },
    { id: 2, name: '2' },
  ]);
  after = ka.array;
  // This is expected. `reset` moves the original array pointer.
  assert.ok(before !== after);
  testKAContent(
    ka,
    [
      { id: 1, name: '1' },
      { id: 3, name: '3' },
      { id: 2, name: '2' },
    ],
    (el) => el.id,
  );

  // Sort
  before = ka.array;
  ka.sort((a, b) => a.id - b.id);
  after = ka.array;
  assert.ok(before === after);
  testKAContent(
    ka,
    [
      { id: 1, name: '1' },
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ],
    (el) => el.id,
  );
});

it('changed event', () => {
  const ka = getKA(true);

  let counter = 0;
  ka.changed = () => counter++;

  // Push
  ka.push([
    { id: -1, name: '-1' },
    { id: 1, name: '1' },
  ]);
  assert.strictEqual(counter, 1);

  // Remove
  ka.deleteByIndex(0);
  assert.strictEqual(counter, 2);

  // Insert
  ka.insert(1, [{ id: 2, name: '2' }]);
  assert.strictEqual(counter, 3);

  // Update
  ka.update({ id: 2, name: 'a' });
  assert.strictEqual(counter, 4);

  // Update (silent)
  ka.update({ id: 2, name: 'b' }, { silent: true });
  assert.strictEqual(counter, 4);
});

it('Delete by index (immutable)', () => {
  const ka = getFalsyValueKA(true);

  assert.ok(ka.deleteByIndex(4));
  testKAContent(ka, [0, 1, 2, 3], (el) => el);

  assert.strictEqual(ka.deleteByIndex(4), false);
  testKAContent(ka, [0, 1, 2, 3], (el) => el);
});

it('Delete by index (mutable)', () => {
  const ka = getFalsyValueKA(false);

  assert.ok(ka.deleteByIndex(4));
  testKAContent(ka, [0, 1, 2, 3], (el) => el);

  assert.strictEqual(ka.deleteByIndex(4), false);
  testKAContent(ka, [0, 1, 2, 3], (el) => el);
});

it('Delete by key (immutable)', () => {
  const ka = getFalsyValueKA(true);

  assert.ok(ka.deleteByKey(4));
  testKAContent(ka, [0, 1, 2, 3], (el) => el);

  assert.strictEqual(ka.deleteByKey(4), false);
  testKAContent(ka, [0, 1, 2, 3], (el) => el);
});

it('Delete by key (mutable)', () => {
  const ka = getFalsyValueKA(false);

  assert.ok(ka.deleteByKey(4));
  testKAContent(ka, [0, 1, 2, 3], (el) => el);

  assert.strictEqual(ka.deleteByKey(4), false);
  testKAContent(ka, [0, 1, 2, 3], (el) => el);
});

it('Update (immutable)', () => {
  const ka = getFalsyValueKA(true);

  assert.ok(ka.update(4));
  testKAContent(ka, [0, 1, 2, 3, 4], (el) => el);

  assert.strictEqual(ka.update(5), false);
  testKAContent(ka, [0, 1, 2, 3, 4], (el) => el);
});

it('Update (mutable)', () => {
  const ka = getFalsyValueKA(false);

  assert.ok(ka.update(4));
  testKAContent(ka, [0, 1, 2, 3, 4], (el) => el);

  assert.strictEqual(ka.update(5), false);
  testKAContent(ka, [0, 1, 2, 3, 4], (el) => el);
});
