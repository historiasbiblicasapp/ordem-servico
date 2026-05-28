import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ClipboardList, Plus, FileText, Settings, LogOut, Shield, BarChart3 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [wallpaper, setWallpaper] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("wallpaper");
    if (stored === null) {
      localStorage.setItem("wallpaper", "/logo%20raitz%20branco.png");
      setWallpaper("/logo%20raitz%20branco.png");
    } else {
      setWallpaper(stored || null);
    }
    const handler = () => setWallpaper(localStorage.getItem("wallpaper") || null);
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 relative">
      {wallpaper && (
        <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
          <img src={wallpaper} alt="" className="max-w-[70%] max-h-[70%] opacity-[0.08] object-contain" />
        </div>
      )}
      <div className="relative z-10">
      <header className="bg-white/95 border-b border-slate-200 shadow-sm no-print backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-7 w-7 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800">Ordem de Serviço</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 flex items-center gap-1">
                {isAdmin && <Shield className="h-3.5 w-3.5 text-amber-500" />}
                {user?.nome}
              </span>
              <button onClick={handleLogout} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Sair">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
          <nav className="flex items-center gap-1 mt-3">
            <Link to="/" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive("/") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>
              <FileText className="h-4 w-4 inline mr-1" />
              OS
            </Link>
            <Link to="/nova" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive("/nova") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>
              <Plus className="h-4 w-4 inline mr-1" />
              Nova Preventiva
            </Link>
            <Link to="/nova-corretiva" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${location.pathname === "/nova-corretiva" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>
              <Plus className="h-4 w-4 inline mr-1" />
              Nova OS
            </Link>
            <Link to="/relatorios" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${isActive("/relatorios") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>
              <BarChart3 className="h-4 w-4 inline mr-1" />
              Relatórios
            </Link>
            {isAdmin && (
              <Link to="/admin" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${location.pathname.startsWith("/admin") ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-100"}`}>
                <Settings className="h-4 w-4 inline mr-1" />
                Admin
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
      </div>
    </div>
  );
}
