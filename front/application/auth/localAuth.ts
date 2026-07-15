export type LocalUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
};

export type LocalSession = {
  userId: string;
  email: string;
  name: string;
  startedAt: string;
};

const usersKey = "codequest-users";
const sessionKey = "codequest-session";
const authEventName = "codequest-auth-change";

export function getLocalUsers() {
  try {
    const rawUsers = localStorage.getItem(usersKey);
    const users = rawUsers ? JSON.parse(rawUsers) : [];

    return Array.isArray(users) ? users as LocalUser[] : [];
  } catch {
    return [];
  }
}

export function getLocalSession() {
  try {
    const rawSession = localStorage.getItem(sessionKey);

    return rawSession ? JSON.parse(rawSession) as LocalSession : null;
  } catch {
    return null;
  }
}

export function registerLocalUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = getLocalUsers();
  const exists = users.some((user) => user.email === normalizedEmail);

  if (exists) {
    throw new Error("Ja existe uma conta com esse email.");
  }

  const user: LocalUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  };

  const session = createSession(user);

  localStorage.setItem(usersKey, JSON.stringify([...users, user]));
  localStorage.setItem(sessionKey, JSON.stringify(session));
  emitAuthChange();

  return session;
}

export function loginLocalUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const user = getLocalUsers().find((localUser) => (
    localUser.email === normalizedEmail &&
    localUser.password === password
  ));

  if (!user) {
    throw new Error("Email ou senha invalidos.");
  }

  const session = createSession(user);
  localStorage.setItem(sessionKey, JSON.stringify(session));
  emitAuthChange();

  return session;
}

export function logoutLocalUser() {
  localStorage.removeItem(sessionKey);
  emitAuthChange();
}

export function subscribeToLocalAuth(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(authEventName, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(authEventName, callback);
  };
}

export function getLocalSessionSnapshot() {
  try {
    return localStorage.getItem(sessionKey) ?? "";
  } catch {
    return "";
  }
}

export function getServerLocalSessionSnapshot() {
  return "";
}

function createSession(user: LocalUser): LocalSession {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    startedAt: new Date().toISOString(),
  };
}

function emitAuthChange() {
  window.dispatchEvent(new Event(authEventName));
}
