import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { NextRequest } from 'next/server';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the current time, respecting TEST_MODE for deterministic testing
 */
export function getCurrentTime(request?: NextRequest): Date {
  if (process.env.TEST_MODE === '1' && request) {
    const testNowMs = request.headers.get('x-test-now-ms');
    if (testNowMs) {
      const timestamp = parseInt(testNowMs, 10);
      if (!isNaN(timestamp)) {
        return new Date(timestamp);
      }
    }
  }
  return new Date();
}
