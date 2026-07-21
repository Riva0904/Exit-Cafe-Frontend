const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

interface DecodedToken {
  sub?: string;
  [ROLE_CLAIM]?: string;
}

/** Decodes a JWT payload without verifying its signature — only for client-side UX checks, never for authorization. */
export function decodeJwt(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json) as DecodedToken;
  } catch {
    return null;
  }
}

export function getTokenUserId(token: string): string | undefined {
  return decodeJwt(token)?.sub;
}

export function getTokenRole(token: string): string | undefined {
  return decodeJwt(token)?.[ROLE_CLAIM];
}
