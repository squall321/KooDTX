/**
 * Date utility functions
 */

/**
 * Formats a timestamp to a readable date string
 * @param timestamp - Unix timestamp in milliseconds
 * @returns Formatted date string (YYYY-MM-DD HH:mm:ss)
 */
export const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toISOString().replace('T', ' ').substring(0, 19);
};

/**
 * Calculates duration between two timestamps
 * @param start - Start timestamp in milliseconds
 * @param end - End timestamp in milliseconds
 * @returns Duration object with hours, minutes, seconds
 */
export const calculateDuration = (
  start: number,
  end: number,
): {hours: number; minutes: number; seconds: number} => {
  const diff = Math.abs(end - start);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return {
    hours: hours,
    minutes: minutes % 60,
    seconds: seconds % 60,
  };
};

/**
 * Formats duration to a readable string (HH:mm:ss)
 * @param duration - Duration object
 * @returns Formatted duration string
 */
export const formatDuration = (duration: {
  hours: number;
  minutes: number;
  seconds: number;
}): string => {
  const {hours, minutes, seconds} = duration;
  return [hours, minutes, seconds]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
};

/**
 * Gets the current timestamp in milliseconds
 * @returns Current timestamp
 */
export const getCurrentTimestamp = (): number => {
  return Date.now();
};

/**
 * Checks if a date is today
 * @param timestamp - Timestamp to check
 * @returns True if the date is today
 */
export const isToday = (timestamp: number): boolean => {
  const date = new Date(timestamp);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Gets a relative time string (e.g., "2 hours ago")
 * @param timestamp - Timestamp to compare
 * @returns Relative time string
 */
export const getRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
};
