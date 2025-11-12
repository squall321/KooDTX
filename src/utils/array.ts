/**
 * Array utility functions
 */

import {chunk, uniq, uniqBy, orderBy, groupBy as _groupBy} from 'lodash';

/**
 * Removes duplicate values from array
 * @param array - Array to deduplicate
 * @returns Array with unique values
 */
export const removeDuplicates = <T>(array: T[]): T[] => {
  return uniq(array);
};

/**
 * Removes duplicate objects by key
 * @param array - Array of objects
 * @param key - Key to use for uniqueness
 * @returns Array with unique objects
 */
export const removeDuplicatesByKey = <T>(array: T[], key: keyof T): T[] => {
  return uniqBy(array, key);
};

/**
 * Chunks array into smaller arrays
 * @param array - Array to chunk
 * @param size - Size of each chunk
 * @returns Array of chunks
 */
export const chunkArray = <T>(array: T[], size: number): T[][] => {
  return chunk(array, size);
};

/**
 * Sorts array by key
 * @param array - Array to sort
 * @param key - Key to sort by
 * @param order - Sort order ('asc' or 'desc')
 * @returns Sorted array
 */
export const sortBy = <T>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc',
): T[] => {
  return orderBy(array, [key], [order]);
};

/**
 * Groups array by key
 * @param array - Array to group
 * @param key - Key to group by
 * @returns Grouped object
 */
export const groupBy = <T>(array: T[], key: keyof T): Record<string, T[]> => {
  return _groupBy(array, key) as Record<string, T[]>;
};

/**
 * Filters array to only truthy values
 * @param array - Array to filter
 * @returns Filtered array
 */
export const compact = <T>(array: (T | null | undefined)[]): T[] => {
  return array.filter(Boolean) as T[];
};

/**
 * Gets random element from array
 * @param array - Array to pick from
 * @returns Random element
 */
export const getRandomElement = <T>(array: T[]): T | undefined => {
  if (array.length === 0) {
    return undefined;
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

/**
 * Gets random elements from array
 * @param array - Array to pick from
 * @param count - Number of elements to pick
 * @returns Array of random elements
 */
export const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

/**
 * Checks if array is empty
 * @param array - Array to check
 * @returns True if array is empty
 */
export const isEmpty = <T>(array: T[]): boolean => {
  return array.length === 0;
};

/**
 * Gets first element of array
 * @param array - Array to get first element from
 * @returns First element or undefined
 */
export const first = <T>(array: T[]): T | undefined => {
  return array[0];
};

/**
 * Gets last element of array
 * @param array - Array to get last element from
 * @returns Last element or undefined
 */
export const last = <T>(array: T[]): T | undefined => {
  return array[array.length - 1];
};
