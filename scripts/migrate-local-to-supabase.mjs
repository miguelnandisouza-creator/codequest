import { createClient } from "@supabase/supabase-js";
import { randomBytes, scryptSync } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();

loadEnvFile(".env.local");
loadEnvFile(".env");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Preencha NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de migrar.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const usersPath = path.join(root, ".data", "users.json");
const progressDir = path.join(root, ".data", "progress");

const users = readJson(usersPath, []);

if (!Array.isArray(users)) {
  console.error(".data/users.json nao parece ser uma lista.");
  process.exit(1);
}

if (users.length > 0) {
  const rows = users.map((user) => {
    const securedUser = secureUser(user);

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

  await upsert("codequest_users", rows, "id");
  await upsert("profiles", rows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  })), "id");
}

const progressRows = existsSync(progressDir)
  ? readdirSync(progressDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      const userId = fileName.replace(/\.json$/, "");
      const player = readJson(path.join(progressDir, fileName), null);

      return player
        ? {
          user_id: userId,
          player: {
            ...player,
            id: userId,
          },
          updated_at: player.updatedAt ?? new Date().toISOString(),
        }
        : null;
    })
    .filter(Boolean)
  : [];

if (progressRows.length > 0) {
  await upsert("player_progress", progressRows, "user_id");
}

console.log(`Migracao concluida: ${users.length} contas e ${progressRows.length} progressos enviados.`);

function loadEnvFile(fileName) {
  const envPath = path.join(root, fileName);

  if (!existsSync(envPath)) {
    return;
  }

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine || trimmedLine.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    const value = trimmedLine.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, "");

    process.env[key] ??= value;
  }
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function upsert(table, rows, onConflict) {
  const { error } = await supabase
    .from(table)
    .upsert(rows, { onConflict });

  if (error) {
    console.error(`Falha ao migrar ${table}:`, error.message);
    process.exit(1);
  }
}

function secureUser(user) {
  if (user.passwordHash && user.passwordSalt) {
    return user;
  }

  const passwordSalt = randomBytes(16).toString("hex");

  return {
    ...user,
    passwordHash: hashPassword(user.password ?? "", passwordSalt),
    passwordSalt,
    passwordVersion: 1,
  };
}

function hashPassword(password, salt) {
  return scryptSync(password, salt, 64).toString("hex");
}
