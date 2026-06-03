import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import OSForm from "@/pages/OSForm";
import BlankOS from "@/pages/BlankOS";
import Reports from "@/pages/Reports";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AtividadesPage from "@/pages/admin/AtividadesPage";
import EquipamentosPage from "@/pages/admin/EquipamentosPage";
import SetoresPage from "@/pages/admin/SetoresPage";
import TEMsPage from "@/pages/admin/TEMsPage";
import RevisoesPage from "@/pages/admin/RevisoesPage";
import PreventivasCalendar from "@/pages/admin/PreventivasCalendar";
import UsuariosPage from "@/pages/admin/UsuariosPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
          <Route path="/" element={<Dashboard />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/os-branco" element={<BlankOS />} />
          <Route path="/nova" element={<OSForm />} />
          <Route path="/nova-corretiva" element={<OSForm />} />
            <Route path="/editar/:id" element={<OSForm />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/atividades"
              element={
                <AdminRoute>
                  <AtividadesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/equipamentos"
              element={
                <AdminRoute>
                  <EquipamentosPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/setores"
              element={
                <AdminRoute>
                  <SetoresPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/tems"
              element={
                <AdminRoute>
                  <TEMsPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/revisoes"
              element={
                <AdminRoute>
                  <RevisoesPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/preventivas"
              element={
                <AdminRoute>
                  <PreventivasCalendar />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/usuarios"
              element={
                <AdminRoute>
                  <UsuariosPage />
                </AdminRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
