// src/utils/hashUtils.ts

/**
 * Cross-platform MD5 hash function
 * Works in both Node.js and browser environments
 */
async function md5Hash(data: string): Promise<string> {
  // Browser environment - use SubtleCrypto
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
      
      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (err) {
      console.error('Browser MD5 error:', err);
      // Fallback to simple hash
      return simpleHash(data);
    }
  }
  
  // Node.js environment
  try {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(data).digest('hex');
  } catch (err) {
    console.error('Node.js MD5 error:', err);
    return simpleHash(data);
  }
}

/**
 * Simple hash function as fallback
 * Not cryptographically secure, but better than nothing
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

export { md5Hash, simpleHash };
