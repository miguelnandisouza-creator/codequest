import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import path from "node:path";

import { LocalUser } from "@/application/auth/localAuth";
import { getSupabaseServerClient } from "@/infrastructure/supabase/serverClient";

const dataDir = path.join(process.cwd(), ".data");
const usersFile = path.join(dataDir, "users.json");
const canWriteLocalFiles = process.env.VERCEL !== "1";

type StoredUser = LocalUser & {
  passwordHash?: string;
  passwordSalt?: string;
  passwordVersion?: number;
};

type SupabaseUserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  password_salt: string;
  password_version: number;
  created_at: string;
};

export async function readStoredUsers() {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("codequest_users")
      .select("id, name, email, password_hash, password_salt, password_version, created_at")
      .order("created_at", { ascending: true });

    if (!error && data) {
      return data.map(mapSupabaseUser);
    }

    console.warn("Supabase read codequest_users failed:", error?.message);
  }

  try {
    const rawUsers = await readFile(usersFile, "utf8");
    const users = JSON.parse(rawUsers);

    return Array.isArray(users) ? users as StoredUser[] : [];
  } catch {
    return [];
  }
}

export async function writeStoredUsers(users: LocalUser[]) {
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const rows = users.map((user) => {
      const securedUser = secureUserPassword(user);

      return {
        id: securedUser.id,
        name: securedUser.name,
        email: securedUser.email,
        password_hash: securedUser.passwordHash,
        password_salt: securedUser.passwordSalt,
        password_version: securedUser.passwordVersion ?? 1,
        created_at: securedUser.createdAt,
      };
    });
    const { error } = await supabase
      .from("codequest_users")
      .upsert(rows, { onConflict: "id" });

    if (!error) {
      return;
    }

    console.warn("Supabase write codequest_users failed:", error.message);
  }

  await writeLocalUsers(users);
}

export async function findStoredUserByCredentials(email: string, password: string) {
  const users = await readStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  return users.find((user) => (
    user.email === normalizedEmail &&
    verifyPassword(user, password)
  )) ?? null;
}

export async function createStoredUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readStoredUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error("Ja existe uma conta com esse email.");
  }

  const user = secureUserPassword({
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    createdAt: new Date().toISOString(),
  });

  await writeStoredUsers([...users, user]);

  return user;
}

export async function updateStoredUserName(userId: string, name: string) {
  const nextName = name.trim();

  if (nextName.length < 2) {
    throw new Error("Digite um nome com pelo menos 2 letras.");
  }

  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error: userError } = await supabase
      .from("codequest_users")
      .update({ name: nextName })
      .eq("id", userId);
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ name: nextName })
      .eq("id", userId);

    if (!userError && !profileError) {
      return;
    }

    console.warn("Supabase update user name failed:", userError?.message ?? profileError?.message);
  }

  const users = await readStoredUsers();
  const updatedUsers = users.map((user) => (
    user.id === userId
      ? { ...user, name: nextName }
      : user
  ));

  await writeLocalUsers(updatedUsers);
}

export async function resetStoredUserPassword(userId: string, password: string) {
  if (password.trim().length < 6) {
    throw new Error("A senha precisa ter pelo menos 6 caracteres.");
  }

  const passwordData = createPasswordData(password);
  const supabase = getSupabaseServerClient();

  if (supabase) {
    const { error } = await supabase
      .from("codequest_users")
      .update({
        password_hash: passwordData.passwordHash,
        password_salt: passwordData.passwordSalt,
        password_version: passwordData.passwordVersion,
      })
      .eq("id", userId);

    if (!error) {
      return;
    }

    console.warn("Supabase reset user password failed:", error.message);
  }

  const users = await readStoredUsers();
  const updatedUsers = users.map((user) => (
    user.id === userId
      ? {
        ...user,
        password,
        ...passwordData,
      }
      : user
  ));

  await writeLocalUsers(updatedUsers);
}

function mapSupabaseUser(row: SupabaseUserRow): StoredUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    password: "",
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    passwordVersion: row.password_version,
    createdAt: row.created_at,
  };
}

function secureUserPassword(user: StoredUser): StoredUser {
  if (user.passwordHash && user.passwordSalt) {
    return user;
  }

  return {
    ...user,
    ...createPasswordData(user.password),
  };
}

function createPasswordData(password: string) {
  const passwordSalt = randomBytes(16).toString("hex");

  return {
    passwordHash: hashPassword(password, passwordSalt),
    passwordSalt,
    passwordVersion: 1,
  };
}

function verifyPassword(user: StoredUser, password: string) {
  if (user.passwordHash && user.passwordSalt) {
    const expected = Buffer.from(user.passwordHash, "hex");
    const actual = Buffer.from(hashPassword(password, user.passwordSalt), "hex");

    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  return user.password === password;
}

function hashPassword(password: string, salt: string) {
  return scryptSync(password, salt, 64).toString("hex");
}

async function writeLocalUsers(users: StoredUser[]) {
  if (!canWriteLocalFiles) {
    throw new Error("Banco de usuarios indisponivel em producao.");
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
}
