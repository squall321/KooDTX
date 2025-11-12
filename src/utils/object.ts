/**
 * Object utility functions
 */

import {omit, pick, isEqual, cloneDeep, merge} from 'lodash';

/**
 * Removes specified keys from object
 * @param obj - Object to modify
 * @param keys - Keys to remove
 * @returns New object without specified keys
 */
export const removeKeys = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  return omit(obj, keys) as Omit<T, K>;
};

/**
 * Picks specified keys from object
 * @param obj - Object to pick from
 * @param keys - Keys to pick
 * @returns New object with only specified keys
 */
export const pickKeys = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> => {
  return pick(obj, keys) as Pick<T, K>;
};

/**
 * Deep clones an object
 * @param obj - Object to clone
 * @returns Cloned object
 */
export const deepClone = <T>(obj: T): T => {
  return cloneDeep(obj);
};

/**
 * Deep merges objects
 * @param target - Target object
 * @param sources - Source objects to merge
 * @returns Merged object
 */
export const deepMerge = <T extends object>(
  target: T,
  ...sources: Partial<T>[]
): T => {
  return merge({}, target, ...sources);
};

/**
 * Checks if two objects are deeply equal
 * @param obj1 - First object
 * @param obj2 - Second object
 * @returns True if objects are equal
 */
export const areEqual = <T>(obj1: T, obj2: T): boolean => {
  return isEqual(obj1, obj2);
};

/**
 * Checks if object is empty
 * @param obj - Object to check
 * @returns True if object has no keys
 */
export const isEmptyObject = (obj: object): boolean => {
  return Object.keys(obj).length === 0;
};

/**
 * Gets nested value from object safely
 * @param obj - Object to get value from
 * @param path - Path to value (e.g., 'user.profile.name')
 * @param defaultValue - Default value if path doesn't exist
 * @returns Value at path or default value
 */
export const getNestedValue = <T>(
  obj: unknown,
  path: string,
  defaultValue?: T,
): T => {
  const keys = path.split('.');
  let result: unknown = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key];
    } else {
      return defaultValue as T;
    }
  }

  return result as T;
};

/**
 * Sets nested value in object
 * @param obj - Object to set value in
 * @param path - Path to value (e.g., 'user.profile.name')
 * @param value - Value to set
 * @returns Modified object
 */
export const setNestedValue = <T extends object>(
  obj: T,
  path: string,
  value: unknown,
): T => {
  const keys = path.split('.');
  const result = deepClone(obj);
  let current: unknown = result;

  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (
      !current ||
      typeof current !== 'object' ||
      !(key in current) ||
      typeof (current as Record<string, unknown>)[key] !== 'object'
    ) {
      (current as Record<string, unknown>)[key] = {};
    }
    current = (current as Record<string, unknown>)[key];
  }

  if (current && typeof current === 'object') {
    (current as Record<string, unknown>)[keys[keys.length - 1]] = value;
  }

  return result;
};

/**
 * Converts object to query string
 * @param obj - Object to convert
 * @returns Query string
 */
export const toQueryString = (obj: Record<string, unknown>): string => {
  return Object.entries(obj)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');
};
