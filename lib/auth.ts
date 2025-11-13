/**
 * Simple password-based authentication system
 * Passwords are hashed and stored in localStorage
 */

const AUTH_STORAGE_KEY = 'ptk_event_auth';
const USER_ID_STORAGE_KEY = 'ptk_user_id';

// Hash a password using Web Crypto API (client-side only)
async function hashPassword(password: string): Promise<string> {
  if (typeof window === 'undefined') {
    // Server-side: use Node.js crypto (for API routes)
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(password).digest('hex');
  }
  
  // Client-side: use Web Crypto API
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get valid passwords from environment variable
function getValidPasswords(): string[] {
  if (typeof window === 'undefined') {
    // Server-side: get from environment
    const passwords = process.env.NEXT_PUBLIC_EVENT_PASSWORDS || '';
    return passwords.split(',').filter(p => p.trim().length > 0);
  } else {
    // Client-side: get from environment (Next.js exposes NEXT_PUBLIC_ vars)
    const passwords = process.env.NEXT_PUBLIC_EVENT_PASSWORDS || '';
    return passwords.split(',').filter(p => p.trim().length > 0);
  }
}

/**
 * Authenticate a user with a password
 * Returns true if password is valid, false otherwise
 */
export async function authenticate(password: string): Promise<boolean> {
  const validPasswords = getValidPasswords();
  
  // If no passwords configured, reject authentication
  if (validPasswords.length === 0) {
    console.error('No passwords configured. Please set NEXT_PUBLIC_EVENT_PASSWORDS environment variable.');
    return false;
  }
  
  // Check if password is in valid list (case-sensitive, exact match)
  const isValid = validPasswords.some(validPass => validPass.trim() === password.trim());
  
  if (isValid) {
    // Hash the password to create a unique user ID
    const userId = await hashPassword(password);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(USER_ID_STORAGE_KEY, userId);
    }
    
    return true;
  }
  
  return false;
}

/**
 * Check if user is currently authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
}

/**
 * Get the current user's ID (hashed password)
 */
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USER_ID_STORAGE_KEY);
}

/**
 * Logout the current user
 */
export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(USER_ID_STORAGE_KEY);
}

/**
 * Verify if a user can edit an event (check if they are the creator)
 */
export function canEditEvent(eventCreatorId: string | null | undefined): boolean {
  if (!isAuthenticated()) return false;
  if (!eventCreatorId) return false;
  
  const currentUserId = getCurrentUserId();
  return currentUserId === eventCreatorId;
}

