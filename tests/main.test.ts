import * as assert from 'assert';
import KeyedArray from '../dist/main.js';

interface Item {
  id: number;
  name: string;
}

function getKA(immutable: boolean): KeyedArray<number, Item> {
  const ka = new KeyedArray<number, Item>(immutable, (it) => it.id);
  ka.push({ id: 1, name: '1' });
  return ka;
}

it('Immutable', () => {
  const ka = getKA(true);
  assert.strictEqual(ka.immutable, true);

  // Push
  let before = ka.array;
  ka.push({ id: -1, name: '-1' }, { id: 1, name: '1' });
  let after = ka.array;
  assert.ok(before !== after);
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

  // Remove
  before = ka.array;
  ka.remove(0);
  after = ka.array;
  assert.ok(before !== after);
  assert.deepStrictEqual(ka.array, [{ id: -1, name: '-1' }]);
  assert.deepStrictEqual(
    ka.map,
    new Map<number, Item>([[-1, { id: -1, name: '-1' }]]),
  );

  // Insert
  before = ka.array;
  ka.insert(1, { id: 2, name: '2' });
  after = ka.array;
  assert.ok(before !== after);
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

  // Remove
  before = ka.array;
  ka.remove(0);
  after = ka.array;
  assert.ok(before === after);
  assert.deepStrictEqual(ka.array, [{ id: -1, name: '-1' }]);
  assert.deepStrictEqual(
    ka.map,
    new Map<number, Item>([[-1, { id: -1, name: '-1' }]]),
  );

  // Insert
  before = ka.array;
  ka.insert(1, { id: 2, name: '2' });
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
});

it('onArrayChanged', () => {
  const ka = getKA(true);

  let counter = 0;
  ka.onArrayChanged = () => counter++;

  // Push
  ka.push({ id: -1, name: '-1' }, { id: 1, name: '1' });
  assert.strictEqual(counter, 1);

  // Remove
  ka.remove(0);
  assert.strictEqual(counter, 2);

  // Insert
  ka.insert(1, { id: 2, name: '2' });
  assert.strictEqual(counter, 3);
});
