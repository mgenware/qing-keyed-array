import {
  arrayInsertAt,
  arrayRemoveAt,
  pureArrayInsertAt,
  pureArrayRemoveAt,
  pureArraySet,
} from 'f-array.splice';

// Event info for `onArrayChanged`.
export interface ArrayChangedEvent<K> {
  // Number of changed keys.
  numberOfChanges: number;
  // Updated keys.
  updated?: K[];
  // Added keys.
  added?: K[];
  // Removed keys.
  removed?: K[];
}

export default class KeyedArray<K, T> {
  #array: T[] = [];
  #map = new Map<K, T>();
  #keyFn: (item: T) => K;

  // Fires when the internal array changes, immutable mode only.
  // eslint-disable-next-line class-methods-use-this
  onArrayChanged: (sender: this, e: ArrayChangedEvent<K>) => void = () => {};

  get count(): number {
    return this.#array.length;
  }

  get array(): ReadonlyArray<T> {
    return this.#array;
  }

  get map(): Readonly<Map<K, T>> {
    return this.#map;
  }

  constructor(public readonly immutable: boolean, keyFn: (item: T) => K) {
    this.#keyFn = keyFn;
  }

  push(...items: T[]): number {
    const filtered = this.addItemsToMap(items);
    if (this.immutable) {
      this.#array = [...this.#array, ...filtered];
      this.onArrayChanged(this, {
        numberOfChanges: filtered.length,
        added: filtered.map((it) => this.#keyFn(it)),
      });
    } else {
      this.#array.push(...filtered);
    }
    return filtered.length;
  }

  insert(index: number, ...items: T[]): number {
    const filtered = this.addItemsToMap(items);
    if (this.immutable) {
      this.#array = pureArrayInsertAt(this.#array, index, ...filtered);
      this.onArrayChanged(this, {
        numberOfChanges: filtered.length,
        added: filtered.map((it) => this.#keyFn(it)),
      });
    } else {
      arrayInsertAt(this.#array, index, ...filtered);
    }
    return filtered.length;
  }

  deleteByIndex(index: number) {
    const item = this.#array[index];
    if (!item) {
      return;
    }
    const key = this.#keyFn(item);
    this.deleteInternal(key, index);
  }

  deleteByKey(key: K) {
    const item = this.#map.get(key);
    if (!item) {
      return;
    }
    const index = this.#array.indexOf(item);
    if (index < 0) {
      return;
    }
    this.deleteInternal(key, index);
  }

  update(newItem: T) {
    const key = this.#keyFn(newItem);
    const item = this.#map.get(key);
    if (!item) {
      return;
    }
    const index = this.#array.indexOf(item);
    if (index < 0) {
      return;
    }
    this.#map.set(key, newItem);
    if (this.immutable) {
      this.#array = pureArraySet(this.#array, index, newItem);
      this.onArrayChanged(this, { numberOfChanges: 0, updated: [key] });
    } else {
      this.#array[index] = newItem;
    }
  }

  private deleteInternal(key: K, index: number) {
    this.#map.delete(key);
    if (this.immutable) {
      this.#array = pureArrayRemoveAt(this.#array, index);
      this.onArrayChanged(this, { numberOfChanges: -1, removed: [key] });
    } else {
      arrayRemoveAt(this.#array, index);
    }
  }

  containsKey(key: K): boolean {
    return this.#map.has(key);
  }

  private addItemsToMap(items: T[]): T[] {
    const filtered = items.filter((it) => !this.containsKey(this.#keyFn(it)));
    filtered.forEach((it) => this.#map.set(this.#keyFn(it), it));
    return filtered;
  }
}
