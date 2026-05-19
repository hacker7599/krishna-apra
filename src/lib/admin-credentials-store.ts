import bcrypt from "bcryptjs";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type AdminCredentialsFile = {
  username: string;
  passwordHashB64: string;
  updatedAt: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const CREDENTIALS_PATH = path.join(DATA_DIR, "admin-credentials.json");

export function getAdminCredentialsPath() {
  return CREDENTIALS_PATH;
}

export function hashPasswordToB64(plain: string): string {
  const hash = bcrypt.hashSync(plain, 12);
  return Buffer.from(hash, "utf8").toString("base64");
}

export function decodeHashB64(b64: string): string | undefined {
  try {
    const decoded = Buffer.from(b64.trim(), "base64").toString("utf8");
    if (decoded.startsWith("$2")) return decoded;
  } catch {
    /* ignore */
  }
  return undefined;
}

export async function readAdminCredentialsFile(): Promise<AdminCredentialsFile | null> {
  try {
    const raw = await readFile(CREDENTIALS_PATH, "utf8");
    const parsed = JSON.parse(raw) as AdminCredentialsFile;
    if (
      typeof parsed.username === "string" &&
      parsed.username.length > 0 &&
      typeof parsed.passwordHashB64 === "string" &&
      parsed.passwordHashB64.length > 0
    ) {
      return parsed;
    }
  } catch {
    /* missing or invalid */
  }
  return null;
}

export async function writeAdminCredentials(username: string, plainPassword: string): Promise<AdminCredentialsFile> {
  const passwordHashB64 = hashPasswordToB64(plainPassword);
  const record: AdminCredentialsFile = {
    username: username.trim(),
    passwordHashB64,
    updatedAt: new Date().toISOString(),
  };
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(CREDENTIALS_PATH, JSON.stringify(record, null, 2), { mode: 0o600 });
  return record;
}

export async function hasAdminCredentialsFile(): Promise<boolean> {
  const file = await readAdminCredentialsFile();
  return file != null && decodeHashB64(file.passwordHashB64) != null;
}
