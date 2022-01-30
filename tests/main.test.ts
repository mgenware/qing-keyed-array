import * as assert from 'assert';
import { KeyedObservableArray, ChangeInfo } from '../dist/main.js';

interface Item {
  id: number;
  name: string;
}

function getKA(immutable: boolean) {
  const ka = new KeyedObservableArray<number, Item>(immutable, (it) => it.id);
  ka.push({ id: 1, name: '1' });
  return ka;
}

it('Immutable', () => {
  const ka = getKA(true);
  assert.strictEqual(ka.immutable, true);

  let e: ChangeInfo<number> = { numberOfChanges: 0 };
  ka.changed = (_, c) => (e = c);

  // Push
  let before = ka.array;
  ka.push({ id: -1, name: '-1' }, { id: 1, name: '1' });
  let after = ka.array;
  assert.ok(before !== after);
  assert.deepStrictEqual(e, { numberOfChanges: 1, added: [-1] });
  assert.deepStrictEqual(ka.array, [
    { id: 1, name: '1' },
    { id: -1, name: '-1' },
  ]);
  assert.deepStrictEqual(
    ka.map,
    new Map<number, Item>([
      [1, { id: 1, name: '1' }],
      [-1, { id: -1, name: '-1' }],
    ]),
  );

  // Delete by index
  before = ka.array;
  ka.deleteByIndex(0);
  after = ka.array;
  assert.ok(before !== after);
  // Key of the item at index 0 is 1.
  assert.deepStrictEqual(e, { numberOfChanges: -1, removed: [1] });
  assert.deepStrictEqual(ka.array, [{ id: -1, name: '-1' }]);
  assert.deepStrictEqual(ka.map, new Map<number, Item>([[-1, { id: -1, name: '-1' }]]));

  // Insert
  before = ka.array;
  ka.insert(1, { id: 2, name: '2' }, { id: -1, name: '-1' });
  after = ka.array;
  assert.ok(before !== after);
  assert.deepStrictEqual(e, { numberOfChanges: 1, added: [2] });
  assert.deepStrictEqual(ka.array, [
    { id: -1, name: '-1' },
    { id: 2, name: '2' },
  ]);
  assert.deepStrictEqual(
    ka.map,
    new Map<number, Item>([
      [-1, { id: -1, name: '-1' }],
      [2, { id: 2, name: '2' }],
    ]),
  );

  // Delete by key
  before = ka.array;
  ka.deleteByKey(2);
  after = ka.array;
  assert.ok(before !== after);
  assert.deepStrictEqual(e, { numberOfChanges: -1, removed: [2] });
  assert.deepStrictEqual(ka.array, [{ id: -1, name: '-1' }]);
  assert.deepStrictEqual(ka.map, new Map<number, Item>([[-1, { id: -1, name: '-1' }]]));

  // Update by key
  before = ka.array;
  ka.update({ id: -1, name: '-1 updated' });
  after = ka.array;
  assert.ok(before !== after);
  assert.deepStrictEqual(e, { numberOfChanges: 0, updated: [-1] });
  assert.deepStrictEqual(ka.array, [{ id: -1, name: '-1 updated' }]);
  assert.deepStrictEqual(ka.map, new Map<number, Item>([[-1, { id: -1, name: '-1 updated' }]]));
});

it('Mutable', () => {
  const ka = getKA(false);
  assert.strictEqual(ka.immutable, false);

  // Push
  let before = ka.array;
  ka.push({ id: -1, name: '-1' }, { id: 1, name: '1' });
  let after = ka.array;
  assert.ok(before === after);
  assert.deepStrictEqual(ka.array, [
    { id: 1, name: '1' },
    { id: -1, name: '-1' },
  ]);
  assert.deepStrictEqual(
    ka.map,
    new Map<number, Item>([
      [1, { id: 1, name: '1' }],
      [-1, { id: -1, name: '-1' }],
    ]),
  );

  // Delete by index
  before = ka.array;
  ka.deleteByIndex(0);
  after = ka.array;
  assert.ok(before === after);
  assert.deepStrictEqual(ka.array, [{ id: -1, name: '-1' }]);
  assert.deepStrictEqual(ka.map, new Map<number, Item>([[-1, { id: -1, name: '-1' }]]));

  // Insert
  before = ka.array;
  ka.insert(1, { id: 2, name: '2' }, { id: -1, name: '-1' });
  after = ka.array;
  assert.ok(before === after);
  assert.deepStrictEqual(ka.array, [
    { id: -1, name: '-1' },
    { id: 2, name: '2' },
  ]);
  assert.deepStrictEqual(
    ka.map,
    new Map<number, Item>([
      [-1, { id: -1, name: '-1' }],
      [2, { id: 2, name: '2' }],
    ]),
  );

  // Delete by key
  before = ka.array;
  ka.deleteByKey(2);
  after = ka.array;
  assert.ok(before === after);
  assert.deepStrictEqual(ka.array, [{ id: -1, name: '-1' }]);
  assert.deepStrictEqual(ka.map, new Map<number, Item>([[-1, { id: -1, name: '-1' }]]));

  // Update by key
  before = ka.array;
  ka.update({ id: -1, name: '-1 updated' });
  after = ka.array;
  assert.ok(before === after);
  assert.deepStrictEqual(ka.array, [{ id: -1, name: '-1 updated' }]);
  assert.deepStrictEqual(ka.map, new Map<number, Item>([[-1, { id: -1, name: '-1 updated' }]]));
});

it('onArrayChanged', () => {
  const ka = getKA(true);

  let counter = 0;
  ka.changed = () => counter++;

  // Push
  ka.push({ id: -1, name: '-1' }, { id: 1, name: '1' });
  assert.strictEqual(counter, 1);

  // Remove
  ka.deleteByIndex(0);
  assert.strictEqual(counter, 2);

  // Insert
  ka.insert(1, { id: 2, name: '2' });
  assert.strictEqual(counter, 3);
});
