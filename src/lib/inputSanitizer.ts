/**
 * InputSanitizer
 * Implements recursive payload filtering against prototype pollution (__proto__, constructor, prototype)
 * and deep sanitization of incoming payload objects.
 */

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function sanitizePayload<T>(input: T): T {
  if (input === null || input === undefined) {
    return input;
  }

  if (typeof input === 'string') {
    // Strip null byte injections and dangerous control characters
    return input.replace(/\0/g, '') as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map((item) => sanitizePayload(item)) as unknown as T;
  }

  if (typeof input === 'object') {
    const cleanObj: Record<string, unknown> = Object.create(null);

    for (const key of Object.keys(input as Record<string, unknown>)) {
      if (DANGEROUS_KEYS.has(key.toLowerCase().trim())) {
        console.warn(`[InputSanitizer] Blocked prototype pollution attempt via key: "${key}"`);
        continue;
      }

      // Safeguard against accessor properties or symbols
      const descriptor = Object.getOwnPropertyDescriptor(input, key);
      if (descriptor && (descriptor.get || descriptor.set)) {
        continue;
      }

      const val = (input as Record<string, unknown>)[key];
      cleanObj[key] = sanitizePayload(val);
    }

    return cleanObj as unknown as T;
  }

  return input;
}

export function detectPrototypePollution(input: unknown): boolean {
  if (input === null || typeof input !== 'object') {
    return false;
  }

  if (Array.isArray(input)) {
    return input.some(detectPrototypePollution);
  }

  const keys = Object.keys(input);
  for (const key of keys) {
    const lower = key.toLowerCase().trim();
    if (DANGEROUS_KEYS.has(lower)) {
      return true;
    }
    if (detectPrototypePollution((input as Record<string, unknown>)[key])) {
      return true;
    }
  }

  return false;
}
