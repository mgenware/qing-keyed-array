import {
  arrayInsertAt,
  arrayRemoveAt,
  pureArrayInsertAt,
  pureArrayRemoveAt,
  pureArraySet,
} from 'f-array.splice';

export default class KeyedArray<K, T> {
  #array: T[] = [];
  #map = new Map<K, T>();
  #keyFn: (item: T) => K;

  onArrayChanged: () => void = () => {};

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
      this.onArrayChanged();
    } else {
      this.#array.push(...filtered);
    }
    return filtered.length;
  }

  insert(index: number, ...items: T[]): number {
    const filtered = this.addItemsToMap(items);
    if (this.immutable) {
      this.#array = pureArrayInsertAt(this.#array, index, ...items);
      this.onArrayChanged();
    } else {
      arrayInsertAt(this.#array, index, ...items);
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

  updateByKey(key: K, newItem: T) {
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
    } else {
      this.#array[index] = newItem;
    }
  }

  private deleteInternal(key: K, index: number) {
    this.#map.delete(key);
    if (this.immutable) {
      this.#array = pureArrayRemoveAt(this.#array, index);
      this.onArrayChanged();
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
