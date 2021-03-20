# qing-keyed-array

[![Build Status](https://github.com/mgenware/qing-keyed-array/workflows/Build/badge.svg)](https://github.com/mgenware/qing-keyed-array/actions)
[![npm version](https://img.shields.io/npm/v/qing-keyed-array.svg?style=flat-square)](https://npmjs.com/package/qing-keyed-array)
[![Node.js Version](http://img.shields.io/node/v/qing-keyed-array.svg?style=flat-square)](https://nodejs.org/en/)

TypeScript array + map.

## Installation

```sh
yarn add qing-keyed-array
```

## Usage

```ts
import KeyedArray from 'qing-keyed-array';

class KeyedArray<K, T> {
  // Creates an instance of `KeyedArray`.
  // `immutable` if `this.array` will be changed in a immutable way.
  // `keyFn` function to get the key from an array element.
  constructor(immutable: boolean, keyFn: (item: T) => K);

  // Whether the internal array is immutable.
  readonly immutable: boolean;

  // Fires when array has changed in immutable mode.
  onArrayChanged: () => void;

  // Gets the number of elements in this container.
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
  remove(index: number): void;

  // Returns if the internal map contains the given key.
  containsKey(key: K): boolean;
}
```
