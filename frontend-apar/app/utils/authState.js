export const clearAuthState = () => {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('remember_me');
};

const decodeJwtPayload = (token) => {
  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
      '='
    );

    return JSON.parse(atob(paddedPayload));
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('token');

  if (!token) {
    clearAuthState();
    return false;
  }

  const payload = decodeJwtPayload(token);
  const expiresAt = payload?.exp ? payload.exp * 1000 : null;

  if (expiresAt && expiresAt <= Date.now()) {
    clearAuthState();
    return false;
  }

  return true;
};
