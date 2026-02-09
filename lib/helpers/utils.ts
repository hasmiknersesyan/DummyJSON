/**
 * Utility functions for API testing
 */

/**
 * Generate a random product title
 */
export function generateRandomProductTitle(): string {
  const adjectives = ['Amazing', 'Premium', 'Professional', 'Deluxe', 'Ultimate'];
  const nouns = ['Gadget', 'Device', 'Product', 'Item', 'Tool'];
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const timestamp = Date.now();
  
  return `${randomAdj} ${randomNoun} ${timestamp}`;
}

/**
 * Generate random price
 */
export function generateRandomPrice(min: number = 10, max: number = 1000): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

/**
 * Delay execution for specified milliseconds
 */
export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if a string is a valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate random stock number
 */
export function generateRandomStock(min: number = 0, max: number = 200): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random rating
 */
export function generateRandomRating(): number {
  return Math.round(Math.random() * 5 * 10) / 10;
}

/**
 * Sanitize string for comparison
 */
export function sanitizeString(str: string): string {
  return str.trim().toLowerCase();
}

/**
 * Check if response time is acceptable (under specified threshold in ms)
 */
export function isResponseTimeAcceptable(responseTime: number, threshold: number = 2000): boolean {
  return responseTime < threshold;
}
