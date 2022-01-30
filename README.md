# qing-keyed-array

[![Build Status](https://github.com/mgenware/qing-keyed-array/workflows/Build/badge.svg)](https://github.com/mgenware/qing-keyed-array/actions)
[![npm version](https://img.shields.io/npm/v/qing-keyed-array.svg?style=flat-square)](https://npmjs.com/package/qing-keyed-array)
[![Node.js Version](http://img.shields.io/node/v/qing-keyed-array.svg?style=flat-square)](https://nodejs.org/en/)

Keyed, and observable array.

## Installation

```sh
npm add qing-keyed-array
```

## Usage

```ts
import KeyedArray from 'qing-keyed-array';

// Contains information about a change in immutable mode.
export interface ChangeInfo<K> {
  // Number of changed keys.
  numberOfChanges: number;
  // Updated keys.
  updated?: K[];
  // Added keys.
  added?: K[];
  // Removed keys.
  removed?: K[];
  // An extra piece of data associated with this change.
  tag?: unknown;
}

class KeyedObservableArray<K, T> {
  // Creates an instance of `KeyedObservableArray`.
  // `immutable` if `this.array` will be changed in a immutable way.
  // `keyFn` function to get the key from an array element.
  constructor(immutable: boolean, keyFn: (item: T) => K);

  // Whether the internal array is immutable.
  readonly immutable: boolean;

  // Fires when the internal array changes in immutable mode.
  changed?: (sender: this, e: ChangeInfo<K>) => void;

  // An extra piece of data associated with this change.
  // It gets reset every time `changed` fires.
  tag?: unknown;

  // Gets the number of elements.
  get count(): number;

  // Gets the internal array.
  get array(): ReadonlyArray<T>;

  // Gets the internal map.
  get map(): Readonly<Map<K, T>>;

  // Appends the given items to the end of the array.
  push(...items: T[]): number;

  // Inserts items into the given index.
  insert(index: number, ...items: T[]): number;

  // Removes an item at the given index.
  deleteByIndex(index: number): void;

  // Removes the item associated with the given key.
  deleteByKey(key: K): void;

  // Replaces the item associated with the given item key with the new item.
  update(newItem: T);

  // Returns if the internal map contains the given key.
  containsKey(key: K): boolean;
}
```
