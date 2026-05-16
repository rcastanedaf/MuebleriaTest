// src/App.tsx
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthStoreCtx } from "./store/authStore";
import { CartStoreCtx } from "./store/cartStore";
import { LangCtx, type Lang, useToast } from "./shared/hooks";
import { Toast } from "./shared/components";
import type { AuthUser, CartItem } from "./core/types";
import { PortalApp }      from "./pages/portal/PortalApp";
import { AdminApp }       from "./pages/admin/AdminApp";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { authRepository } from "./features/auth/data/authRepository";
import { tokenStorage, userStorage, modulesStorage } from "./core/api/apiClient";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f7f3ec;--bg2:#faf7f2;--bg3:#ffffff;
  --dark:#1a1714;--darkMid:#2e2a25;
  --olive:#4a5240;--oliveMid:#6b7560;
  --gold:#8c7245;--sand:#e0d5c2;--sandDark:#c8baa2;
  --txt:#1a1714;--txtMid:#4a4540;--txtMuted:#8a8278;
  --danger:#b83232;--success:#2e6b4f;
  --radius:8px;--radiusLg:14px;
  --shadow:0 2px 16px rgba(26,23,20,.10);
  --shadowMd:0 4px 32px rgba(26,23,20,.14);
  --nav-padding:0;
}
html,body{background:var(--bg);color:var(--txt);font-family:'DM Sans',sans-serif;font-size:15px;line-height:1.6;min-height:100vh}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-thumb{background:var(--sandDark);border-radius:2px}
button,input,select,textarea{font-family:inherit}
@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes spin{to{transform:rotate(360deg)}}
.fadeUp{animation:fadeUp .4s cubic-bezier(.16,1,.3,1) forwards}
.fadeIn{animation:fadeIn .3s ease forwards}
@media(max-width:640px){html{font-size:14px}body{padding-bottom:64px}}
`;

// ── Ruta /admin con guardia ───────────────────────────────────
function AdminRoute({
  user, allowedModules, showToast, onLogout,
}: {
  user: AuthUser | null;
  allowedModules: string[] | null;
  showToast: (msg: string, type?: "success" | "error") => void;
  onLogout: () => void;
}) {
  if (!user || user.role === "cliente") {
    return <AdminLoginPage showToast={showToast} />;
  }
  return <AdminApp showToast={showToast} allowedModules={allowedModules} onLogout={onLogout} />;
}

export default function App() {
  const [user, setUser] = useState<AuthUser | null>(() =>
    tokenStorage.get() ? userStorage.get<AuthUser>() : null
  );
  const [allowedModulesRaw, setAllowedModulesRaw] = useState<string[] | null>(() =>
    tokenStorage.get() ? modulesStorage.get() : null
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [lang,      setLang]      = useState<Lang>("es");
  const { toasts, show: showToast } = useToast();

  // Wrap setter so every change is also persisted to localStorage
  const setAllowedModules = useCallback((m: string[] | null) => {
    setAllowedModulesRaw(m);
    modulesStorage.set(m);
  }, []);

  // On mount: re-validate token and refresh permissions for non-client users
  useEffect(() => {
    const token     = tokenStorage.get();
    const savedUser = userStorage.get<AuthUser>();
    if (!token || !savedUser || savedUser.role === "cliente") return;

    authRepository.getMisPermisos()
      .then(perms => {
        setAllowedModules(perms.esAdmin ? null : (perms.modulos ?? []));
      })
      .catch(() => {
        // Token expired or revoked — clear session
        authRepository.logout();
        modulesStorage.clear();
        setUser(null);
        setAllowedModulesRaw(null);
      });
  }, []); // eslint-disable-line

  const handleLogout = () => {
    authRepository.logout();
    modulesStorage.clear();
    setUser(null);
    setAllowedModulesRaw(null);
  };

  const authValue = useMemo(() => ({
    user,
    setUser: (u: AuthUser) => setUser(u),
    clearUser: () => {
      authRepository.logout();
      modulesStorage.clear();
      setUser(null);
      setAllowedModulesRaw(null);
    },
    allowedModules: allowedModulesRaw,
    setAllowedModules,
  }), [user, allowedModulesRaw, setAllowedModules]);

  const cartValue = useMemo(() => ({ items: cartItems, setItems: setCartItems }), [cartItems]);
  const langValue = useMemo(() => ({ lang, setLang }), [lang]);

  return (
    <Router>
      <style>{CSS}</style>
      <AuthStoreCtx.Provider value={authValue}>
        <CartStoreCtx.Provider value={cartValue}>
          <LangCtx.Provider value={langValue}>
            <Routes>
              <Route path="/" element={<PortalApp showToast={showToast} />} />
              <Route path="/admin" element={
                <AdminRoute
                  user={user}
                  allowedModules={allowedModulesRaw}
                  showToast={showToast}
                  onLogout={handleLogout}
                />
              } />
            </Routes>
            <Toast toasts={toasts} />
          </LangCtx.Provider>
        </CartStoreCtx.Provider>
      </AuthStoreCtx.Provider>
    </Router>
  );
}
