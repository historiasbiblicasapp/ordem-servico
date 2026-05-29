export const db = {
  list<T>(entity: string): T[] {
    const raw = localStorage.getItem(`os:${entity}`);
    if (!raw) return [];
    try { return JSON.parse(raw) as T[]; } catch { return []; }
  },

  get<T extends { id: string }>(entity: string, id: string): T | undefined {
    return db.list<T>(entity).find((x) => x.id === id);
  },

  create<T extends { id: string }>(entity: string, data: Omit<T, "id"> & { id?: string }): T {
    const list = db.list<T>(entity);
    const id = data.id || (Date.now().toString(36) + Math.random().toString(36).substring(2, 8));
    const item = { ...data, id } as T;
    list.push(item);
    localStorage.setItem(`os:${entity}`, JSON.stringify(list));
    syncToSupabase(entity, item, "create");
    return item;
  },

  update<T extends { id: string }>(entity: string, id: string, data: Partial<T>): T | undefined {
    const list = db.list<T>(entity);
    const idx = list.findIndex((x) => x.id === id);
    if (idx === -1) return undefined;
    list[idx] = { ...list[idx], ...data };
    localStorage.setItem(`os:${entity}`, JSON.stringify(list));
    syncToSupabase(entity, list[idx], "update");
    return list[idx];
  },

  remove(entity: string, id: string): boolean {
    const list = db.list<any>(entity);
    const filtered = list.filter((x: any) => x.id !== id);
    if (filtered.length === list.length) return false;
    localStorage.setItem(`os:${entity}`, JSON.stringify(filtered));
    syncToSupabase(entity, { id }, "delete");
    return true;
  },
};

const pendingSync: Array<{ entity: string; data: any; action: "create" | "update" | "delete" }> = [];
let syncing = false;

function syncToSupabase(entity: string, data: any, action: "create" | "update" | "delete") {
  pendingSync.push({ entity, data, action });
  if (!syncing) processSyncQueue();
}

async function processSyncQueue() {
  syncing = true;
  while (pendingSync.length > 0) {
    const job = pendingSync.shift()!;
    try {
      const { supabase } = await import("./supabase");
      if (job.action === "delete") {
        await supabase.from(job.entity).delete().eq("id", job.data.id);
      } else {
        const record = normalizeForSupabase(job.data);
        if (job.action === "create") {
          const { data: existing } = await supabase.from(job.entity).select("id").eq("id", record.id).maybeSingle();
          if (!existing) {
            await supabase.from(job.entity).insert(record);
          } else {
            await supabase.from(job.entity).update(record).eq("id", record.id);
          }
        } else {
          await supabase.from(job.entity).update(record).eq("id", record.id);
        }
      }
    } catch (e) {
      console.warn("Supabase sync failed (will retry):", e);
      pendingSync.unshift(job);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  syncing = false;
}

function normalizeForSupabase(data: any): any {
  const mapped: any = {};
  for (const [key, value] of Object.entries(data)) {
    const col = key.replace(/([A-Z])/g, "_$1").toLowerCase();
    if (key === "id" || key === "createdAt" || key === "updatedAt") {
      mapped[col] = value;
    } else if (Array.isArray(value)) {
      mapped[col] = JSON.stringify(value);
    } else {
      mapped[col] = value;
    }
  }
  return mapped;
}

export async function syncAllFromSupabase() {
  try {
    const { supabase } = await import("./supabase");
    const tables = ["users", "equipamentos", "setores", "tems", "revisoes", "atividades", "ordens"];
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*");
      if (error) continue;
      if (data && data.length > 0) {
        const normalized = data.map((row: any) => denormalizeFromSupabase(row));
        localStorage.setItem(`os:${table}`, JSON.stringify(normalized));
      }
    }
  } catch (e) {
    console.warn("Supabase sync failed:", e);
  }
}

function denormalizeFromSupabase(row: any): any {
  const denorm: any = {};
  for (const [key, value] of Object.entries(row)) {
    const camel = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    if (key === "created_at" || key === "updated_at") {
      denorm[camel === "createdAt" || camel === "updatedAt" ? camel : key] = value;
    } else if (typeof value === "string") {
      try { denorm[camel] = JSON.parse(value); } catch { denorm[camel] = value; }
    } else {
      denorm[camel] = value;
    }
  }
  return denorm;
}

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function seedUser(nome: string, email: string, senha: string, role: string) {
  const existing = db.list<any>("users").find((u) => u.email === email);
  if (existing) {
    db.update<any>("users", existing.id, { nome, senha: btoa(senha), role } as any);
  } else {
    db.create("users", { nome, email, senha: btoa(senha), role, createdAt: new Date().toISOString() } as any);
  }
}

export function seedInitialData() {
  const users = db.list("users");
  const isFirstRun = users.length === 0;

  seedUser("Administrador", "admin@admin.com", "admin123", "admin");
  seedUser("Leandro", "leandro@raitz.com", "leandro123", "user");
  seedUser("Carlos", "carlos@raitz.com", "carlos123", "user");
  seedUser("Marcos", "marcos@raitz.com", "marcos123", "user");
  seedUser("Diego", "diego@raitz.com", "diego123", "user");

  if (!isFirstRun) return;

  const now = new Date().toISOString();
  db.create("revisoes", { numero: "3", descricao: "Revisão atual" } as any);
  db.create("equipamentos", { nome: "PONTE ROLANTE", descricao: "Ponte rolante" } as any);
  db.create("equipamentos", { nome: "PONTE ROLANTE T01", descricao: "Ponte rolante T01" } as any);
  db.create("equipamentos", { nome: "PONTE ROLANTE T02", descricao: "Ponte rolante T02" } as any);
  db.create("equipamentos", { nome: "PONTE ROLANTE T03", descricao: "Ponte rolante T03" } as any);
  db.create("equipamentos", { nome: "PONTE ROLANTE T04", descricao: "Ponte rolante T04" } as any);
  db.create("equipamentos", { nome: "PONTE ROLANTE T05", descricao: "Ponte rolante T05" } as any);
  db.create("equipamentos", { nome: "PONTE ROLANTE T06", descricao: "Ponte rolante T06" } as any);
  db.create("equipamentos", { nome: "PONTE ROLANTE T07", descricao: "Ponte rolante T07" } as any);
  db.create("equipamentos", { nome: "PONTE ROLANTE T08", descricao: "Ponte rolante T08" } as any);
  db.create("equipamentos", { nome: "PONTE ROLANTE T09", descricao: "Ponte rolante T09" } as any);
  db.create("equipamentos", { nome: "PONTE ROLANTE T10", descricao: "Ponte rolante T10" } as any);
  db.create("setores", { nome: "Produção" } as any);
  db.create("setores", { nome: "Manutenção" } as any);
  db.create("setores", { nome: "Qualidade" } as any);
  db.create("atividades", {
    nome: "PONTE ROLANTE",
    descricao: "Inspeção de ponte rolante",
    itens: [
      { id: genId(), nome: "Verificar freios" },
      { id: genId(), nome: "Verificar cabos" },
      { id: genId(), nome: "Lubrificar trilhos" },
      { id: genId(), nome: "Inspecionar painel" },
      { id: genId(), nome: "Testar movimentação" },
    ],
  } as any);
}

let migrated = false;
export function migrateNumeros() {
  if (migrated) return;
  migrated = true;
  const ordens = db.list<any>("ordens");
  let changed = false;
  const counters: Record<string, number> = {};
  for (const os of ordens) {
    if (!os.tipo) { os.tipo = "corretiva"; changed = true; }
    if (!os.numero) {
      const ano = os.data ? os.data.split("-")[0] : new Date().getFullYear().toString();
      const key = `${os.tipo}-${ano}`;
      counters[key] = (counters[key] || 0) + 1;
      os.numero = `${counters[key]}/${ano}`;
      changed = true;
    }
  }
  if (changed) localStorage.setItem("os:ordens", JSON.stringify(ordens));
}
