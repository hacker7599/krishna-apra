import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const PAYMENT_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const ID_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["application/pdf", "pdf"],
]);

const MAX_BYTES = 4 * 1024 * 1024;

async function saveToSubdir(file: File, allowed: Map<string, string>, subdir: string): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("FILE_EMPTY");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  const ext = allowed.get(file.type);
  if (!ext) {
    throw new Error("FILE_TYPE");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "uploads", subdir);
  await mkdir(dir, { recursive: true });
  const full = path.join(dir, name);
  await writeFile(full, buf);
  return path.posix.join(subdir, name);
}

export async function savePaymentProof(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  return saveToSubdir(file as File, PAYMENT_TYPES, "payment-proofs");
}

export async function saveIdProof(file: File): Promise<string> {
  return saveToSubdir(file, ID_TYPES, "id-proofs");
}

const BANNER_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const BANNER_MAX_BYTES = 5 * 1024 * 1024;

export async function saveBannerImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("FILE_EMPTY");
  }
  if (file.size > BANNER_MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  const ext = BANNER_TYPES.get(file.type);
  if (!ext) {
    throw new Error("FILE_TYPE");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "uploads", "banners");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return `banners/${name}`;
}
