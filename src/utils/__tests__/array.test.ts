/**
 * Tests for array utilities
 */

import {
  removeDuplicates,
  removeDuplicatesByKey,
  chunkArray,
  sortBy,
  groupBy,
  compact,
  getRandomElement,
  isEmpty,
  first,
  last,
} from '../array';

describe('array utilities', () => {
  describe('removeDuplicates', () => {
    it('should remove duplicate values', () => {
      const result = removeDuplicates([1, 2, 2, 3, 3, 3]);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('removeDuplicatesByKey', () => {
    it('should remove duplicate objects by key', () => {
      const items = [
        {id: 1, name: 'A'},
        {id: 2, name: 'B'},
        {id: 1, name: 'C'},
      ];
      const result = removeDuplicatesByKey(items, 'id');
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[1].id).toBe(2);
    });
  });

  describe('chunkArray', () => {
    it('should chunk array into smaller arrays', () => {
      const result = chunkArray([1, 2, 3, 4, 5], 2);
      expect(result).toEqual([[1, 2], [3, 4], [5]]);
    });
  });

  describe('sortBy', () => {
    it('should sort array by key ascending', () => {
      const items = [{age: 30}, {age: 20}, {age: 25}];
      const result = sortBy(items, 'age', 'asc');
      expect(result[0].age).toBe(20);
      expect(result[2].age).toBe(30);
    });

    it('should sort array by key descending', () => {
      const items = [{age: 30}, {age: 20}, {age: 25}];
      const result = sortBy(items, 'age', 'desc');
      expect(result[0].age).toBe(30);
      expect(result[2].age).toBe(20);
    });
  });

  describe('groupBy', () => {
    it('should group array by key', () => {
      const items = [
        {type: 'A', value: 1},
        {type: 'B', value: 2},
        {type: 'A', value: 3},
      ];
      const result = groupBy(items, 'type');
      expect(result.A).toHaveLength(2);
      expect(result.B).toHaveLength(1);
    });
  });

  describe('compact', () => {
    it('should filter out falsy values', () => {
      const result = compact([1, null, 2, undefined, 3, false, 0]);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('getRandomElement', () => {
    it('should return random element from array', () => {
      const items = [1, 2, 3, 4, 5];
      const result = getRandomElement(items);
      expect(items).toContain(result);
    });

    it('should return undefined for empty array', () => {
      const result = getRandomElement([]);
      expect(result).toBeUndefined();
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty array', () => {
      expect(isEmpty([])).toBe(true);
    });

    it('should return false for non-empty array', () => {
      expect(isEmpty([1, 2, 3])).toBe(false);
    });
  });

  describe('first', () => {
    it('should return first element', () => {
      expect(first([1, 2, 3])).toBe(1);
    });

    it('should return undefined for empty array', () => {
      expect(first([])).toBeUndefined();
    });
  });

  describe('last', () => {
    it('should return last element', () => {
      expect(last([1, 2, 3])).toBe(3);
    });

    it('should return undefined for empty array', () => {
      expect(last([])).toBeUndefined();
    });
  });
});
