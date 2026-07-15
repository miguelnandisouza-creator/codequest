import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { LocalUser } from "@/application/auth/localAuth";

const dataDir = path.join(process.cwd(), ".data");
const usersFile = path.join(dataDir, "users.json");

export async function readStoredUsers() {
  try {
    const rawUsers = await readFile(usersFile, "utf8");
    const users = JSON.parse(rawUsers);

    return Array.isArray(users) ? users as LocalUser[] : [];
  } catch {
    return [];
  }
}

export async function writeStoredUsers(users: LocalUser[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(usersFile, JSON.stringify(users, null, 2), "utf8");
}

