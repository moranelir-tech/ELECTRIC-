import { promises as fs } from "fs";
import path from "path";
import type { Lead, Provider } from "./types";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const PROVIDERS_FILE = path.join(DATA_DIR, "providers.json");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

// תור כתיבה פשוט כדי למנוע כתיבות מקבילות לאותו קובץ
let queue: Promise<unknown> = Promise.resolve();
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = queue.then(fn, fn);
  queue = run.catch(() => undefined);
  return run;
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(file, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, file);
}

// בהפעלה ראשונה על דיסק ריק (DATA_DIR חדש) משתמשים בנתוני הדוגמה שבתוך הקוד
const SEED_FILE = path.join(process.cwd(), "data", "providers.json");

async function loadProviders(): Promise<Provider[]> {
  try {
    await fs.access(PROVIDERS_FILE);
  } catch {
    return readJson<Provider[]>(SEED_FILE, []);
  }
  return readJson<Provider[]>(PROVIDERS_FILE, []);
}

export async function getProviders(): Promise<Provider[]> {
  const list = await loadProviders();
  return list.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getActiveProviders(): Promise<Provider[]> {
  return (await getProviders()).filter((p) => p.active);
}

export function saveProviders(list: Provider[]): Promise<void> {
  return serial(() => writeJson(PROVIDERS_FILE, list));
}

export function registerClick(slug: string): Promise<Provider | null> {
  return serial(async () => {
    const list = await loadProviders();
    const p = list.find((x) => x.slug === slug && x.active);
    if (!p) return null;
    p.clicks = (p.clicks || 0) + 1;
    await writeJson(PROVIDERS_FILE, list);
    return p;
  });
}

export async function getLeads(): Promise<Lead[]> {
  const list = await readJson<Lead[]>(LEADS_FILE, []);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addLead(lead: Lead): Promise<void> {
  return serial(async () => {
    const list = await readJson<Lead[]>(LEADS_FILE, []);
    list.push(lead);
    await writeJson(LEADS_FILE, list);
  });
}
