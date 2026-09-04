import { get, set } from 'idb-keyval';

// Simple fallback encryption wrapper for IndexedDB using AES-GCM
// Generates a random key per session or uses a fixed client-side key for demo purposes.
// In production, you'd manage this key more securely or derive it from user auth.
const ENCRYPTION_KEY_NAME = 'trustline-pHash-key';

async function getEncryptionKey(): Promise<CryptoKey> {
  let keyBytes = await get<Uint8Array>(ENCRYPTION_KEY_NAME);
  if (!keyBytes) {
    keyBytes = crypto.getRandomValues(new Uint8Array(32));
    await set(ENCRYPTION_KEY_NAME, keyBytes);
  }
  return crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function cachePHashSecurely(pHash: string, data: any): Promise<void> {
  try {
    const key = await getEncryptionKey();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encodedData
    );
    
    await set(`phash_${pHash}`, {
      iv,
      data: encrypted
    });
  } catch (error) {
    console.error('Failed to cache pHash securely', error);
  }
}

export async function getSecurePHash(pHash: string): Promise<any | null> {
  try {
    const cached = await get<{ iv: Uint8Array, data: ArrayBuffer }>(`phash_${pHash}`);
    if (!cached) return null;
    
    const key = await getEncryptionKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: cached.iv },
      key,
      cached.data
    );
    
    const decodedText = new TextDecoder().decode(decrypted);
    return JSON.parse(decodedText);
  } catch (error) {
    console.error('Failed to decrypt cached pHash', error);
    return null;
  }
}
