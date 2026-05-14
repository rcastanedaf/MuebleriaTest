// src/App.tsx
import React, { useState, useMemo } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { AuthStoreCtx } from "./store/authStore";
import { CartStoreCtx } from "./store/cartStore";
import { LangCtx, type Lang, useToast } from "./shared/hooks";
import { Toast } from "./shared/components";
import type { AuthUser, CartItem } from "./core/types";
import { PortalApp } from "./pages/portal/PortalApp";
import { AdminApp }  from "./pages/admin/AdminApp";

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
.portal-nav{display:none}
@media(max-width:768px){
  .portal-nav{display:flex}
  :root{--nav-padding:48px}
}
`;

// Navigation component using router hooks
function PortalNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname === "/admin";
  const isPortal = location.pathname === "/";

  return (
    <nav className="portal-nav" style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      height: 48,
      background: "rgba(26, 23, 20, 0.95)",
      backdropFilter: "blur(8px)",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      zIndex: 9999,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: "0 16px",
    }}>
      <button
        onClick={() => navigate("/")}
        style={{
          padding: "8px 16px",
          borderRadius: "var(--radius)",
          border: isPortal ? "2px solid var(--gold)" : "1px solid rgba(255,255,255,0.2)",
          background: isPortal ? "var(--gold)" : "transparent",
          color: isPortal ? "#fff" : "rgba(255,255,255,0.7)",
          fontSize: 13,
          fontWeight: isPortal ? 600 : 500,
          cursor: "pointer",
          transition: "all 0.2s",
          fontFamily: "inherit",
        }}
      >
        🛒 Portal
      </button>
      <button
        onClick={() => navigate("/admin")}
        style={{
          padding: "8px 16px",
          borderRadius: "var(--radius)",
          border: isAdmin ? "2px solid var(--gold)" : "1px solid rgba(255,255,255,0.2)",
          background: isAdmin ? "var(--gold)" : "transparent",
          color: isAdmin ? "#fff" : "rgba(255,255,255,0.7)",
          fontSize: 13,
          fontWeight: isAdmin ? 600 : 500,
          cursor: "pointer",
          transition: "all 0.2s",
          fontFamily: "inherit",
        }}
      >
        ⚙️ Admin
      </button>
    </nav>
  );
}

export default function App() {
  const [user,       setUser]       = useState<AuthUser | null>(null);
  const [cartItems,  setCartItems]  = useState<CartItem[]>([]);
  const [lang,       setLang]       = useState<Lang>("es");
  const { toasts, show: showToast } = useToast();

  const authValue  = useMemo(() => ({ user, setUser: (u: AuthUser) => setUser(u), clearUser: () => setUser(null) }), [user]);
  const cartValue  = useMemo(() => ({ items: cartItems, setItems: setCartItems }), [cartItems]);
  const langValue  = useMemo(() => ({ lang, setLang }), [lang]);

  return (
    <Router>
      <>
      <style>{CSS}</style>
      <PortalNav />
      <div style={{ paddingTop: "var(--nav-padding, 0)" }}>
        <AuthStoreCtx.Provider value={authValue}>
          <CartStoreCtx.Provider value={cartValue}>
            <LangCtx.Provider value={langValue}>
              <Routes>
                <Route path="/" element={<PortalApp showToast={showToast} />} />
                <Route path="/admin" element={<AdminApp showToast={showToast} />} />
              </Routes>

              <Toast toasts={toasts} />
            </LangCtx.Provider>
          </CartStoreCtx.Provider>
        </AuthStoreCtx.Provider>
      </div>
      </>
    </Router>
  );
}
