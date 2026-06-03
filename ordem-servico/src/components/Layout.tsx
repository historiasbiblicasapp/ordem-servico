import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { ClipboardList, Plus, FileText, Settings, LogOut, Shield, BarChart3, Menu, X, Printer } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [wallpaper, setWallpaper] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

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

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const linkClass = (path: string, activeColor = "bg-blue-50 text-blue-700") =>
    `block w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
      isActive(path) ? activeColor : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div className="min-h-screen bg-slate-100 relative">
      {wallpaper && (
        <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
          <img src={wallpaper} alt="" className="max-w-[70%] max-h-[70%] opacity-[0.08] object-contain" />
        </div>
      )}
      <div className="relative z-10">
        <header className="bg-white/95 border-b border-slate-200 shadow-sm no-print backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-3 sm:px-4">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <button onClick={() => setMenuOpen(!menuOpen)} className="sm:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100 -ml-1">
                  {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
                <ClipboardList className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600 shrink-0" />
                <h1 className="text-base sm:text-xl font-bold text-slate-800 truncate">Ordem de Serviço</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1 truncate max-w-[120px] sm:max-w-none">
                  {isAdmin && <Shield className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500 shrink-0" />}
                  <span className="truncate">{user?.nome}</span>
                </span>
                <button onClick={handleLogout} className="p-2 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Sair">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
            <nav className="hidden sm:flex items-center gap-1 pb-3 overflow-x-auto">
              <Link to="/" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive("/") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>
                <FileText className="h-4 w-4 inline mr-1" />
                OS
              </Link>
              <Link to="/nova" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive("/nova") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>
                <Plus className="h-4 w-4 inline mr-1" />
                Nova Preventiva
              </Link>
              <Link to="/nova-corretiva" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${location.pathname === "/nova-corretiva" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>
                <Plus className="h-4 w-4 inline mr-1" />
                Nova OS
              </Link>
              <Link to="/relatorios" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive("/relatorios") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>
                <BarChart3 className="h-4 w-4 inline mr-1" />
                Relatórios
              </Link>
              <Link to="/os-branco" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${isActive("/os-branco") ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100"}`}>
                <FileText className="h-4 w-4 inline mr-1" />
                OS em Branco
              </Link>
              {isAdmin && (
                <Link to="/admin" className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${location.pathname.startsWith("/admin") ? "bg-amber-50 text-amber-700" : "text-slate-600 hover:bg-slate-100"}`}>
                  <Settings className="h-4 w-4 inline mr-1" />
                  Admin
                </Link>
              )}
            </nav>
          </div>
        </header>

        {menuOpen && (
          <div className="fixed inset-0 z-50 sm:hidden">
            <div className="fixed inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
            <div className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-xl">
              <div className="flex items-center justify-between px-4 h-14 border-b border-slate-200">
                <span className="font-semibold text-slate-800">Navegação</span>
                <button onClick={() => setMenuOpen(false)} className="p-2 rounded-md text-slate-400 hover:bg-slate-100">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="p-3 space-y-1">
                <Link to="/" className={linkClass("/")}>
                  <FileText className="h-4 w-4 inline mr-2" />OS
                </Link>
                <Link to="/nova" className={linkClass("/nova")}>
                  <Plus className="h-4 w-4 inline mr-2" />Nova Preventiva
                </Link>
                <Link to="/nova-corretiva" className={linkClass("/nova-corretiva")}>
                  <Plus className="h-4 w-4 inline mr-2" />Nova OS
                </Link>
                <Link to="/relatorios" className={linkClass("/relatorios")}>
                  <BarChart3 className="h-4 w-4 inline mr-2" />Relatórios
                </Link>
                <Link to="/os-branco" className={linkClass("/os-branco")}>
                  <FileText className="h-4 w-4 inline mr-2" />OS em Branco
                </Link>
                {isAdmin && (
                  <>
                    <hr className="my-2 border-slate-200" />
                    <Link to="/admin" className={linkClass("/admin", "bg-amber-50 text-amber-700")}>
                      <Settings className="h-4 w-4 inline mr-2" />Admin
                    </Link>
                    <Link to="/admin/equipamentos" className={linkClass("/admin/equipamentos")}>
                      Equipamentos
                    </Link>
                    <Link to="/admin/atividades" className={linkClass("/admin/atividades")}>
                      Atividades
                    </Link>
                    <Link to="/admin/setores" className={linkClass("/admin/setores")}>
                      Setores
                    </Link>
                    <Link to="/admin/tems" className={linkClass("/admin/tems")}>
                      Códigos TEM
                    </Link>
                    <Link to="/admin/revisoes" className={linkClass("/admin/revisoes")}>
                      Revisões
                    </Link>
                    <Link to="/admin/preventivas" className={linkClass("/admin/preventivas")}>
                      Preventivas
                    </Link>
                    <Link to="/admin/usuarios" className={linkClass("/admin/usuarios")}>
                      Usuários
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </div>
        )}

        <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
