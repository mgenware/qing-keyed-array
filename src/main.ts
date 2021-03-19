import { arrayInsertAt, arrayRemoveAt, pureArrayInsertAt, pureArrayRemoveAt } from 'f-array.splice';

export default class KeyedArray<K, T> {
  #array: T[] = [];
  #map = new Map<K, T>();
  #keyFn: (item: T) => K;

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
    } else {
      this.#array.push(...filtered);
    }
    return filtered.length;
  }

  insert(index: number, ...items: T[]): number {
    const filtered = this.addItemsToMap(items);
    if (this.immutable) {
      this.#array = pureArrayInsertAt(this.#array, index, ...items);
    } else {
      arrayInsertAt(this.#array, index, ...items);
    }
    return filtered.length;
  }

  remove(index: number) {
    const item = this.#array[index];
    if (!item) {
      return;
    }
    const key = this.#keyFn(item);
    this.#map.delete(key);
    if (this.immutable) {
      this.#array = pureArrayRemoveAt(this.#array, index);
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
