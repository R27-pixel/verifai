/**
 * Utility functions for cryptographic operations
 */

/**
 * Canonicalizes a JSON object by sorting keys recursively
 */
export function canonicalizeJSON(obj: any): any {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(canonicalizeJSON);
  }
  
  const sorted: any = {};
  Object.keys(obj)
    .sort()
    .forEach(key => {
      sorted[key] = canonicalizeJSON(obj[key]);
    });
  
  return sorted;
}

/**
 * Generates a SHA-256 hash of a JSON object
 */
export async function hashJSON(obj: any): Promise<string> {
  const canonical = canonicalizeJSON(obj);
  const jsonString = JSON.stringify(canonical);
  
  const encoder = new TextEncoder();
  const data = encoder.encode(jsonString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}
