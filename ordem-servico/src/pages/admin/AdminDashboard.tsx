import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ListTodo, Wrench, Building2, Hash, FileClock, Image as ImageIcon, Upload, Trash2, CalendarCheck, Users, CloudUpload, Loader2, CheckCircle2, AlertCircle, Database } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const cards = [
  { to: "/admin/atividades", icon: ListTodo, title: "Atividades", desc: "Gerenciar modelos de atividade com itens" },
  { to: "/admin/equipamentos", icon: Wrench, title: "Equipamentos", desc: "Cadastro de equipamentos" },
  { to: "/admin/setores", icon: Building2, title: "Setores", desc: "Gerenciar setores" },
  { to: "/admin/tems", icon: Hash, title: "Códigos TEM", desc: "Gerenciar códigos padrão" },
  { to: "/admin/revisoes", icon: FileClock, title: "Revisões", desc: "Gerenciar revisões" },
  { to: "/admin/preventivas", icon: CalendarCheck, title: "Preventivas", desc: "Organograma de preventivas (R/P)" },
  { to: "/admin/usuarios", icon: Users, title: "Usuários", desc: "Gerenciar usuários do sistema" },
];

export default function AdminDashboard() {
  const { isSuperAdmin } = useAuth();
  const [wallpaperUrl, setWallpaperUrl] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncOk, setSyncOk] = useState(false);
  const [syncErrors, setSyncErrors] = useState<string[]>([]);

  useEffect(() => {
    setWallpaperUrl(localStorage.getItem("wallpaper"));
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      localStorage.setItem("wallpaper", url);
      setWallpaperUrl(url);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    localStorage.setItem("wallpaper", "");
    setWallpaperUrl(null);
  };

  const handleSync = async () => {
    setSyncing(true);
    setSyncOk(false);
    setSyncErrors([]);
    try {
      const { syncAllToSupabase } = await import("@/lib/supabase");
      const errs = await syncAllToSupabase();
      if (errs.length === 0) {
        setSyncOk(true);
        setTimeout(() => setSyncOk(false), 4000);
      } else {
        setSyncErrors(errs);
      }
    } catch (e) {
      setSyncErrors([(e as Error).message]);
    }
    setSyncing(false);
  };

  const inp = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent";

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-6">Administração</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 hover:shadow-md hover:border-amber-300 transition-all group"
          >
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
              <c.icon className="h-5 w-5 text-amber-700" />
            </div>
            <h2 className="font-semibold text-slate-800">{c.title}</h2>
            <p className="text-sm text-slate-500 mt-1">{c.desc}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-4">
          <ImageIcon className="h-5 w-5 text-amber-600" />
          <h2 className="font-semibold text-slate-800">Papel de Parede</h2>
        </div>

        {wallpaperUrl && (
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-2">Wallpaper atual:</p>
            <div className="w-full h-24 sm:h-32 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
              <img src={wallpaperUrl} alt="Wallpaper" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <label className="cursor-pointer bg-amber-600 text-white px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-1.5 min-h-[44px]">
            <Upload className="h-4 w-4" />
            {wallpaperUrl ? "Trocar imagem" : "Enviar imagem"}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
          {wallpaperUrl && (
            <button onClick={handleRemove} className="bg-slate-200 text-slate-700 px-4 py-2.5 sm:py-2 rounded-lg text-sm font-medium hover:bg-red-200 hover:text-red-700 transition-colors flex items-center gap-1.5 min-h-[44px]">
              <Trash2 className="h-4 w-4" /> Remover
            </button>
          )}
          {!wallpaperUrl && (
            <p className="text-sm text-slate-500">Nenhum wallpaper definido</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-5 w-5 text-purple-600" />
          <h2 className="font-semibold text-slate-800">Numeração OS em Branco</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Define o número inicial da OS em Branco. A cada impressão o número é incrementado automaticamente.
        </p>
        <div className="flex items-center gap-3">
          <input type="number" defaultValue={(() => { try { return parseInt(localStorage.getItem("os:blank_os_counter") || "1071", 10); } catch { return 1071; } })()}
            onChange={(e) => localStorage.setItem("os:blank_os_counter", e.target.value)}
            className="w-32 border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[44px] text-center"
          />
          <span className="text-sm text-slate-500">Próximo número na impressão</span>
        </div>
      </div>

      {isSuperAdmin && (
      <>
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <CloudUpload className="h-5 w-5 text-blue-600" />
          <h2 className="font-semibold text-slate-800">Sincronizar com Servidor</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Envia todos os dados do navegador para o Supabase (nuvem). Use após cadastrar dados no localhost para que apareçam no Vercel.
        </p>
        <button onClick={handleSync} disabled={syncing}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-h-[44px]">
          {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : syncOk ? <CheckCircle2 className="h-4 w-4" /> : <CloudUpload className="h-4 w-4" />}
          {syncing ? "Sincronizando..." : syncOk ? "Sincronizado!" : "Sincronizar agora"}
        </button>
        {syncErrors.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
              <AlertCircle className="h-4 w-4" />
              Erros ao sincronizar:
            </div>
            <ul className="text-xs text-red-600 space-y-1 ml-6 list-disc">
              {syncErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 sm:p-5 mt-6">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-5 w-5 text-green-600" />
          <h2 className="font-semibold text-slate-800">Backup SQL</h2>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Gera comandos INSERT SQL dos equipamentos para colar no Supabase SQL Editor.
        </p>
        <button onClick={async () => {
          const { gerarInsertSQL } = await import("@/lib/supabase");
          const sql = gerarInsertSQL("equipamentos");
          try { await navigator.clipboard.writeText(sql); alert("SQL copiado! Cole no Supabase SQL Editor."); }
          catch { prompt("Copie o SQL abaixo:", sql); }
        }}
          className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-2 min-h-[44px]">
          <Database className="h-4 w-4" />
          Gerar SQL dos Equipamentos
        </button>
      </div>
      </>)}
    </div>
  );
}
