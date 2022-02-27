/* eslint-disable no-underscore-dangle */
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
  private _array: T[] = [];
  private _map = new Map<K, T>();
  private _keyFn: (item: T) => K;

  // Fires when the internal array changes, immutable mode only.
  changed?: (sender: this, e: ChangeInfo<K>) => void;

  // An extra piece of data associated with this change.
  // It gets reset every time `changed` fires.
  tag?: unknown;

  get count(): number {
    return this._array.length;
  }

  get array(): ReadonlyArray<T> {
    return this._array;
  }

  get map(): Readonly<Map<K, T>> {
    return this._map;
  }

  constructor(public readonly immutable: boolean, keyFn: (item: T) => K) {
    this._keyFn = keyFn;
  }

  push(...items: T[]): number {
    const filtered = this.addItemsToMap(items);
    if (this.immutable) {
      this._array = [...this._array, ...filtered];
      this.onArrayChanged({
        numberOfChanges: filtered.length,
        countDelta: filtered.length,
        index: this.count,
        added: filtered.map((it) => this._keyFn(it)),
      });
    } else {
      this._array.push(...filtered);
    }
    return filtered.length;
  }

  insert(index: number, ...items: T[]): number {
    const filtered = this.addItemsToMap(items);
    if (this.immutable) {
      this._array = pureArrayInsertAt(this._array, index, ...filtered) as T[];
      this.onArrayChanged({
        numberOfChanges: filtered.length,
        countDelta: filtered.length,
        index,
        added: filtered.map((it) => this._keyFn(it)),
      });
    } else {
      arrayInsertAt(this._array, index, ...filtered);
    }
    return filtered.length;
  }

  deleteByIndex(index: number): boolean {
    if (index < 0 || index >= this.count) {
      return false;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const item = this._array[index]!;
    const key = this._keyFn(item);
    this.deleteInternal(key, index);
    return true;
  }

  deleteByKey(key: K): boolean {
    const item = this._map.get(key);
    if (item === undefined) {
      return false;
    }
    const index = this._array.indexOf(item);
    if (index < 0) {
      return false;
    }
    this.deleteInternal(key, index);
    return true;
  }

  update(newItem: T): boolean {
    const key = this._keyFn(newItem);
    const item = this._map.get(key);
    if (item === undefined) {
      return false;
    }
    const index = this._array.indexOf(item);
    if (index < 0) {
      return false;
    }
    this._map.set(key, newItem);
    if (this.immutable) {
      this._array = pureArraySet(this._array, index, newItem) as T[];
      this.onArrayChanged({ numberOfChanges: 1, countDelta: 0, index, updated: [key] });
    } else {
      this._array[index] = newItem;
    }
    return true;
  }

  containsKey(key: K): boolean {
    return this._map.has(key);
  }

  private deleteInternal(key: K, index: number) {
    this._map.delete(key);
    if (this.immutable) {
      this._array = pureArrayRemoveAt(this._array, index) as T[];
      this.onArrayChanged({ numberOfChanges: 1, countDelta: -1, index, removed: [key] });
    } else {
      arrayRemoveAt(this._array, index);
    }
  }

  private addItemsToMap(items: T[]): T[] {
    const filtered = items.filter((it) => !this.containsKey(this._keyFn(it)));
    filtered.forEach((it) => this._map.set(this._keyFn(it), it));
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
