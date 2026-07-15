import { mkdir, readFile, writeFile } from "node:fs/promises";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import path from "node:path";

import { LocalUser } from "@/application/auth/localAuth";
import { getSupabaseServerClient } from "@/infrastructure/supabase/serverClient";

const dataDir = path.join(process.cwd(), ".data");
const usersFile = path.join(dataDir, "users.json");

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

  await mkdir(dataDir, { recursive: true });
  await writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
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

  const passwordSalt = randomBytes(16).toString("hex");

  return {
    ...user,
    passwordHash: hashPassword(user.password, passwordSalt),
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
