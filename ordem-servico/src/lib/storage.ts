import { OrdemServico } from "@/types";

const STORAGE_KEY = "ordem-servico:os";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

export function getAll(): OrdemServico[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OrdemServico[];
  } catch {
    return [];
  }
}

export function getById(id: string): OrdemServico | undefined {
  return getAll().find((os) => os.id === id);
}

export function create(data: Omit<OrdemServico, "id" | "createdAt" | "updatedAt">): OrdemServico {
  const list = getAll();
  const now = new Date().toISOString();
  const os: OrdemServico = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  list.push(os);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return os;
}

export function update(id: string, data: Partial<OrdemServico>): OrdemServico | undefined {
  const list = getAll();
  const idx = list.findIndex((os) => os.id === id);
  if (idx === -1) return undefined;
  list[idx] = { ...list[idx], ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return list[idx];
}

export function remove(id: string): boolean {
  const list = getAll();
  const filtered = list.filter((os) => os.id !== id);
  if (filtered.length === list.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
