import { OWNER_PROFILE } from './data/profile.js';

const SESSION_KEY = 'allcaps-session';

// PBKDF2-SHA256 of the owner password. The plaintext is not stored anywhere in the code.
const OWNER_CREDENTIAL = {
  email: 'balajiincse@gmail.com',
  salt: '1f35939c438ef5878b7db36ae4076934',
  iterations: 200000,
  hash: 'a221c186a2db82b45e8295d4572b473f5f2a12d3969e38cdc1c3a394451bbd34',
};

const toHex = (buffer) => Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');

const fromHex = (hex) => Uint8Array.from(hex.match(/.{2}/g), (pair) => parseInt(pair, 16));

async function deriveHash(password, saltHex, iterations) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: fromHex(saltHex), iterations, hash: 'SHA-256' },
    key,
    256,
  );
  return toHex(bits);
}

export async function signIn(email, password) {
  const emailMatches = email.trim().toLowerCase() === OWNER_CREDENTIAL.email;
  const hash = await deriveHash(password, OWNER_CREDENTIAL.salt, OWNER_CREDENTIAL.iterations);
  if (!emailMatches || hash !== OWNER_CREDENTIAL.hash) {
    throw new Error('Invalid email or password.');
  }
  const session = { user: OWNER_PROFILE };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export const getStoredSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY)) ?? null;
  } catch {
    return null;
  }
};

export const signOut = () => sessionStorage.removeItem(SESSION_KEY);
