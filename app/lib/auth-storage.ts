export type CmsUser = {
  id: number;
  name: string;
  email: string;
  role: string;
  clinicId: number;
  clinicName: string;
  clinicCode: string;
};

const TOKEN_KEY = "cms_token";
const USER_KEY = "cms_user";

export function setAuth(token: string, user: CmsUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("cms-auth"));
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("cms-auth"));
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getUser(): CmsUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CmsUser;
  } catch {
    return null;
  }
}

export function subscribeAuth(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("cms-auth", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("cms-auth", onStoreChange);
  };
}

export function getAuthSnapshot() {
  const token = getToken();
  const user = getUser();
  return JSON.stringify({ token, user });
}

export function getAuthServerSnapshot() {
  return JSON.stringify({ token: null, user: null });
}
