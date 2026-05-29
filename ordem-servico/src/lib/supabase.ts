import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yissxqzhufvqpbjsmlxb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpc3N4cXpodWZ2cXBianNtbHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDI4MTQsImV4cCI6MjA5NTQ3ODgxNH0.1dwuqnafH0qW854rRIyRZMJ8zm8PpNhMSPsqrP3fwFk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLES = ["users", "equipamentos", "setores", "tems", "revisoes", "atividades", "ordens"];

export async function syncAllToSupabase(): Promise<string[]> {
  const errors: string[] = [];
  for (const table of TABLES) {
    const raw = localStorage.getItem(`os:${table}`);
    const local = JSON.parse(raw || "[]");
    if (local.length === 0) continue;
    for (const item of local) {
      const record: any = {};
      for (const [key, value] of Object.entries(item)) {
        const col = key.replace(/([A-Z])/g, "_$1").toLowerCase();
        if (Array.isArray(value)) {
          record[col] = JSON.stringify(value);
        } else {
          record[col] = value;
        }
      }
      try {
        const { data: existing } = await supabase.from(table).select("id").eq("id", record.id).maybeSingle();
        let error: any;
        if (!existing) {
          ({ error } = await supabase.from(table).insert(record));
        } else {
          ({ error } = await supabase.from(table).update(record).eq("id", record.id));
        }
        if (error) {
          const msg = `Erro [${table} id=${item.id}]: ${error.message}`;
          console.error(msg, error);
          errors.push(msg);
        } else {
          console.log(`OK [${table}] id=${item.id}`);
        }
      } catch (e) {
        const msg = `Exceção [${table} id=${item.id}]: ${(e as Error).message}`;
        console.error(msg, e);
        errors.push(msg);
      }
    }
  }
  return errors;
}

export function gerarInsertSQL(entity: string): string {
  const raw = localStorage.getItem(`os:${entity}`);
  if (!raw) return `-- Nenhum dado encontrado para ${entity}`;
  let data: any[];
  try { data = JSON.parse(raw); } catch { return `-- Erro ao parsear ${entity}`; }
  let sql = `-- BACKUP ${entity.toUpperCase()} - ${new Date().toISOString()}\n`;
  for (const item of data) {
    const cols: string[] = [];
    const vals: string[] = [];
    for (const [key, value] of Object.entries(item)) {
      const col = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      cols.push(col);
      if (value === null || value === undefined) {
        vals.push("NULL");
      } else if (typeof value === "string") {
        vals.push(`'${(value as string).replace(/'/g, "''")}'`);
      } else if (Array.isArray(value)) {
        vals.push(`'${JSON.stringify(value).replace(/'/g, "''")}'`);
      } else {
        vals.push(String(value));
      }
    }
    sql += `INSERT INTO public.${entity} (${cols.join(", ")}) VALUES (${vals.join(", ")});\n`;
  }
  sql += `\n-- Total: ${data.length} registros\n`;
  return sql;
}
