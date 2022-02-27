import {
  arrayInsertAt,
  arrayRemoveAt,
  pureArrayInsertAt,
  pureArrayRemoveAt,
  pureArraySet,
} from 'f-array.splice';

// Contains information about a change in immutable mode.
export interface ChangeInfo<K> {
  // Number of changed keys.
  numberOfChanges: number;
  // Number of added items (negative if elements removed).
  countDelta: number;
  // The index associated with the change.
  index: number;
  // Updated keys.
  updated?: K[];
  // Added keys.
  added?: K[];
  // Removed keys.
  removed?: K[];
  // An extra piece of data associated with this change.
  tag?: unknown;
}

export class KeyedObservableArray<K, T> {
  #array: T[] = [];
  #map = new Map<K, T>();
  #keyFn: (item: T) => K;

  // Fires when the internal array changes, immutable mode only.
  changed?: (sender: this, e: ChangeInfo<K>) => void;

  // An extra piece of data associated with this change.
  // It gets reset every time `changed` fires.
  tag?: unknown;

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
      this.onArrayChanged({
        numberOfChanges: filtered.length,
        countDelta: filtered.length,
        index: this.count,
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
      this.#array = pureArrayInsertAt(this.#array, index, ...filtered) as T[];
      this.onArrayChanged({
        numberOfChanges: filtered.length,
        countDelta: filtered.length,
        index,
        added: filtered.map((it) => this.#keyFn(it)),
      });
    } else {
      arrayInsertAt(this.#array, index, ...filtered);
    }
    return filtered.length;
  }

  deleteByIndex(index: number): boolean {
    if (index < 0 || index >= this.count) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = this.#array[index]!;
    const key = this.#keyFn(item);
    this.deleteInternal(key, index);
    return true;
  }

  deleteByKey(key: K): boolean {
    const item = this.#map.get(key);
    if (item === undefined) {
      return false;
    }
    const index = this.#array.indexOf(item);
    if (index < 0) {
      return false;
    }
    this.deleteInternal(key, index);
    return true;
  }

  update(newItem: T): boolean {
    const key = this.#keyFn(newItem);
    const item = this.#map.get(key);
    if (item === undefined) {
      return false;
    }
    const index = this.#array.indexOf(item);
    if (index < 0) {
      return false;
    }
    this.#map.set(key, newItem);
    if (this.immutable) {
      this.#array = pureArraySet(this.#array, index, newItem) as T[];
      this.onArrayChanged({ numberOfChanges: 1, countDelta: 0, index, updated: [key] });
    } else {
      this.#array[index] = newItem;
    }
    return true;
  }

  containsKey(key: K): boolean {
    return this.#map.has(key);
  }

  private deleteInternal(key: K, index: number) {
    this.#map.delete(key);
    if (this.immutable) {
      this.#array = pureArrayRemoveAt(this.#array, index) as T[];
      this.onArrayChanged({ numberOfChanges: 1, countDelta: -1, index, removed: [key] });
    } else {
      arrayRemoveAt(this.#array, index);
    }
  }

  private addItemsToMap(items: T[]): T[] {
    const filtered = items.filter((it) => !this.containsKey(this.#keyFn(it)));
    filtered.forEach((it) => this.#map.set(this.#keyFn(it), it));
    return filtered;
  }

  protected onArrayChanged(e: ChangeInfo<K>) {
    if (this.tag !== undefined) {
      e.tag = this.tag;
    }
    this.tag = undefined;
    this.changed?.(this, e);
  }
}

export default KeyedObservableArray;
