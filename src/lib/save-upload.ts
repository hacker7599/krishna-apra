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

function bufferMatchesMagic(buf: Buffer, magic: number[], offset = 0): boolean {
  if (buf.length < offset + magic.length) return false;
  return magic.every((byte, i) => buf[offset + i] === byte);
}

function detectExtFromBuffer(buf: Buffer, allowed: Map<string, string>): string | null {
  if (bufferMatchesMagic(buf, [0xff, 0xd8, 0xff]) && allowed.has("image/jpeg")) return "jpg";
  if (bufferMatchesMagic(buf, [0x89, 0x50, 0x4e, 0x47]) && allowed.has("image/png")) return "png";
  if (
    bufferMatchesMagic(buf, [0x52, 0x49, 0x46, 0x46]) &&
    buf.length >= 12 &&
    buf.toString("ascii", 8, 12) === "WEBP" &&
    allowed.has("image/webp")
  ) {
    return "webp";
  }
  if (bufferMatchesMagic(buf, [0x25, 0x50, 0x44, 0x46]) && allowed.has("application/pdf")) return "pdf";
  return null;
}

async function saveToSubdir(file: File, allowed: Map<string, string>, subdir: string): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("FILE_EMPTY");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  if (!allowed.has(file.type)) {
    throw new Error("FILE_TYPE");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectExtFromBuffer(buf, allowed);
  if (!ext || allowed.get(file.type) !== ext) {
    throw new Error("FILE_TYPE");
  }
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

export async function saveBlogImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("FILE_EMPTY");
  }
  if (file.size > BANNER_MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  if (!BANNER_TYPES.has(file.type)) {
    throw new Error("FILE_TYPE");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectExtFromBuffer(buf, BANNER_TYPES);
  if (!ext || BANNER_TYPES.get(file.type) !== ext) {
    throw new Error("FILE_TYPE");
  }
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "uploads", "blog");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return `blog/${name}`;
}

export async function saveBannerImage(file: File): Promise<string> {
  if (!file || file.size === 0) {
    throw new Error("FILE_EMPTY");
  }
  if (file.size > BANNER_MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  if (!BANNER_TYPES.has(file.type)) {
    throw new Error("FILE_TYPE");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectExtFromBuffer(buf, BANNER_TYPES);
  if (!ext || BANNER_TYPES.get(file.type) !== ext) {
    throw new Error("FILE_TYPE");
  }
  const name = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "uploads", "banners");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return `banners/${name}`;
}
