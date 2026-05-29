import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://yissxqzhufvqpbjsmlxb.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlpc3N4cXpodWZ2cXBianNtbHhiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5MDI4MTQsImV4cCI6MjA5NTQ3ODgxNH0.1dwuqnafH0qW854rRIyRZMJ8zm8PpNhMSPsqrP3fwFk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const TABLES = ["users", "equipamentos", "setores", "tems", "revisoes", "atividades", "ordens"];

export async function syncAllToSupabase() {
  for (const table of TABLES) {
    const local = JSON.parse(localStorage.getItem(`os:${table}`) || "[]");
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
      const { error } = await supabase.from(table).upsert(record, { onConflict: "id" });
      if (error) console.error(`Erro sync ${table} ${item.id}:`, error);
    }
  }
}
