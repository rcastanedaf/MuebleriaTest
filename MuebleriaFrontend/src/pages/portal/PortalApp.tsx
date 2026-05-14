// src/pages/portal/PortalApp.tsx
import React, { useCallback, useEffect, useState } from "react";
import { useLang } from "../../shared/hooks";
import { Button, Badge, Spinner, Modal, Input, Toast } from "../../shared/components";
import { useCatalog } from "../../features/catalog/hooks/useCatalog";
import { useCart } from "../../features/cart/hooks/useCart";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useCheckout } from "../../features/checkout/hooks/useCheckout";
import { checkoutRepository } from "../../features/checkout/domain/checkoutDomain";
import { formatPrice, inStock } from "../../features/catalog/domain/catalogDomain";
import { formatQTZ } from "../../shared/utils";
import type { Articulo, OrderDetail, OrderDetailItem, OrderResult } from "../../core/types";

interface Props { showToast: (msg: string, type?: "success" | "error") => void; }

type View = "home" | "catalog" | "cart" | "checkout" | "account" | "login";

const T: Record<string, Record<"es"|"en"|"fr", string>> = {
  home:      { es: "Inicio",    en: "Home",     fr: "Accueil"  },
  catalog:   { es: "Catálogo",  en: "Catalog",  fr: "Catalogue"},
  cart:      { es: "Carrito",   en: "Cart",     fr: "Panier"   },
  account:   { es: "Mi Cuenta", en: "Account",  fr: "Compte"   },
  login:     { es: "Entrar",    en: "Sign In",  fr: "Connexion"},
  addCart:   { es: "Agregar",   en: "Add",      fr: "Ajouter"  },
  checkout:  { es: "Pagar",     en: "Checkout", fr: "Payer"    },
  register:  { es: "Registrarse", en: "Register", fr: "S'inscrire" },
  name:      { es: "Nombre",    en: "Name", fr: "Nom" },
  nit:       { es: "NIT / Documento", en: "NIT / Document", fr: "NIT / Document" },
  phone:     { es: "Teléfono",  en: "Phone", fr: "Téléphone" },
  address:   { es: "Dirección", en: "Address", fr: "Adresse" },
  city:      { es: "Ciudad",    en: "City", fr: "Ville" },
  country:   { es: "País",      en: "Country", fr: "Pays" },
  alreadyAccount: { es: "¿Ya tienes cuenta? Entrar", en: "Already have an account? Sign in", fr: "Vous avez déjà un compte ? Connectez-vous" },
  noAccount: { es: "¿No tienes cuenta? Regístrate", en: "No account yet? Register", fr: "Pas encore de compte ? Inscrivez-vous" },
  search:    { es: "Buscar...", en: "Search...",fr: "Rechercher..."},
  noStock:   { es: "Sin stock", en: "Out of stock", fr: "Rupture"},
  empty:     { es: "Tu carrito está vacío", en: "Your cart is empty", fr: "Panier vide"},
  orderOk:   { es: "¡Orden confirmada!", en: "Order confirmed!", fr: "Commande confirmée!"},
};
const t = (key: string, lang: "es"|"en"|"fr") => T[key]?.[lang] ?? key;
const orderStateLabel = (state: string, lang: "es"|"en"|"fr") => {
  return state === "P" ? (lang === "es" ? "Pendiente" : lang === "en" ? "Pending" : "En attente")
    : state === "A" ? (lang === "es" ? "Aprobada" : lang === "en" ? "Approved" : "Approuvée")
    : state === "D" ? (lang === "es" ? "Despachada" : lang === "en" ? "Dispatched" : "Expédiée")
    : state === "F" ? (lang === "es" ? "Finalizada" : lang === "en" ? "Finished" : "Terminée")
    : state === "C" ? (lang === "es" ? "Cancelada" : lang === "en" ? "Canceled" : "Annulée")
    : state;
};

export function PortalApp({ showToast }: Props) {
  const { lang, setLang } = useLang();
  const [view, setView] = useState<View>("home");
  const [selectedProduct, setSelectedProduct] = useState<Articulo | null>(null);

  const { products, filters, updateFilter, loading } = useCatalog();
  const { items, add, remove, updateQty, subtotal, tax, total, totalQty } = useCart();
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [orderDetailLoading, setOrderDetailLoading] = useState(false);
  const [orderDetailError, setOrderDetailError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setOrdersError(null);
      return;
    }

    setOrdersLoading(true);
    setOrdersError(null);
    try {
      const data = await checkoutRepository.getMyOrders(user.id);
      setOrders(data);
    } catch (err: any) {
      setOrdersError(err?.message ?? "Error al cargar pedidos");
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const handleOrderRefresh = async () => {
    await loadOrders();
    setView("account");
  };

  const loadOrderDetail = async (orderId: number) => {
    setOrderDetailLoading(true);
    setOrderDetailError(null);
    try {
      const detail = await checkoutRepository.getOrderById(orderId);
      setSelectedOrder(detail);
    } catch (err: any) {
      setOrderDetailError(err?.message ?? "Error al cargar detalles de pedido");
    } finally {
      setOrderDetailLoading(false);
    }
  };

  const handleAddToCart = (p: Articulo) => {
    if (!inStock(p)) return;
    add(p);
    showToast(`${p.nombreArticulo} agregado al carrito`);
  };

  // Bottom nav
  const NavItem = ({ v, icon, label }: { v: View; icon: string; label: string }) => (
    <button onClick={() => setView(v)} style={{
      flex: 1, display:"flex", flexDirection:"column", alignItems:"center",
      gap: 2, padding:"8px 4px", background:"none", border:"none",
      color: view===v ? "var(--olive)" : "var(--txtMuted)",
      fontSize: 10, fontWeight: view===v ? 600 : 400, cursor:"pointer",
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", paddingBottom: 64 }}>

      {/* Header */}
      <header style={{
        position:"sticky", top:0, zIndex:100, background:"rgba(247,243,236,0.92)",
        backdropFilter:"blur(8px)", borderBottom:"1px solid var(--sand)",
        padding:"0 16px", height:54, display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <span style={{ fontFamily:"Cormorant Garamond, serif", fontSize:18, fontWeight:600, letterSpacing:"0.04em" }}>
          Muebles Los Alpes
        </span>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {/* Lang selector */}
          <select value={lang} onChange={e => setLang(e.target.value as any)} style={{
            background:"none", border:"none", fontSize:12, color:"var(--txtMuted)",
            cursor:"pointer", fontFamily:"inherit",
          }}>
            <option value="es">ES</option>
            <option value="en">EN</option>
            <option value="fr">FR</option>
          </select>
          {/* Cart icon */}
          <button onClick={() => setView("cart")} style={{
            position:"relative", background:"none", border:"none", cursor:"pointer",
            fontSize:20, color:"var(--olive)",
          }}>
            🛒
            {totalQty > 0 && (
              <span style={{
                position:"absolute", top:-4, right:-4, background:"var(--danger)",
                color:"#fff", borderRadius:"50%", width:16, height:16,
                fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center",
              }}>{totalQty}</span>
            )}
          </button>
          {user ? (
            <button onClick={() => setView("account")} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"var(--olive)", fontWeight:500 }}>
              👤 {user.name.split(" ")[0]}
            </button>
          ) : (
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => { setAuthMode("login"); setShowAuthModal(true); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"var(--olive)", fontWeight:500 }}>
                {t("login", lang)}
              </button>
              <button onClick={() => { setAuthMode("register"); setShowAuthModal(true); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:12, color:"var(--olive)", fontWeight:500 }}>
                {t("register", lang)}
              </button>
            </div>
          )}
        </div>
      </header>

      {/* ── HOME ─────────────────────────────────────────────── */}
      {view === "home" && (
        <main className="fadeUp" style={{ padding:"32px 16px" }}>
          {/* Hero */}
          <div style={{
            borderRadius:"var(--radiusLg)", padding:"40px 24px", marginBottom:28, textAlign:"center",
            background:"linear-gradient(135deg, var(--dark) 0%, var(--darkMid) 100%)",
            color:"#fff",
          }}>
            <p style={{ fontSize:11, letterSpacing:"0.15em", textTransform:"uppercase", color:"var(--gold)", marginBottom:10 }}>
              Guatemala · Aluminio y Madera
            </p>
            <h1 style={{ fontFamily:"Cormorant Garamond, serif", fontSize:32, fontWeight:300, lineHeight:1.25, marginBottom:16 }}>
              Muebles que definen<br/>el espacio
            </h1>
            <Button onClick={() => setView("catalog")} variant="gold" size="lg">
              {t("catalog", lang)}
            </Button>
          </div>

          {/* Feature grid */}
          {[
            { icon:"🪑", title: lang==="es"?"Muebles de Interior":"Interior Furniture", desc: lang==="es"?"Salas, comedores, dormitorios":"Living rooms, dining, bedrooms" },
            { icon:"🌿", title: lang==="es"?"Muebles de Exterior":"Outdoor Furniture",  desc: lang==="es"?"Terrazas, jardines, piscinas":"Terraces, gardens, pools" },
            { icon:"🛠️", title: lang==="es"?"Fabricación Local":"Local Manufacturing", desc: lang==="es"?"Talleres en Guatemala":"Made in Guatemala" },
          ].map(c => (
            <div key={c.title} onClick={() => setView("catalog")} style={{
              display:"flex", alignItems:"center", gap:14, padding:"16px",
              background:"var(--bg3)", border:"1px solid var(--sand)",
              borderRadius:"var(--radius)", marginBottom:12, cursor:"pointer",
            }}>
              <span style={{ fontSize:28 }}>{c.icon}</span>
              <div>
                <p style={{ fontWeight:600, fontSize:14 }}>{c.title}</p>
                <p style={{ fontSize:12, color:"var(--txtMuted)" }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </main>
      )}

      {/* ── CATALOG ──────────────────────────────────────────── */}
      {view === "catalog" && (
        <main style={{ padding:"16px" }}>
          <h2 style={{ fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:400, marginBottom:16 }}>
            {t("catalog", lang)}
          </h2>

          {/* Filters */}
          <div style={{ display:"flex", gap:8, marginBottom:14, flexWrap:"wrap" }}>
            {(["all","Interior","Exterior"] as const).map(tp => (
              <button key={tp} onClick={() => updateFilter("tipo", tp)} style={{
                padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:500, cursor:"pointer",
                background: filters.tipo===tp ? "var(--olive)" : "var(--bg3)",
                color:      filters.tipo===tp ? "#fff"         : "var(--txtMid)",
                border:`1px solid ${filters.tipo===tp ? "var(--olive)" : "var(--sand)"}`,
              }}>{tp==="all" ? t("all",lang) : t(tp.toLowerCase(),lang)}</button>
            ))}
          </div>

          <input
            value={filters.search}
            onChange={e => updateFilter("search", e.target.value)}
            placeholder={t("search", lang)}
            style={{
              width:"100%", padding:"9px 14px", marginBottom:16,
              background:"var(--bg3)", border:"1px solid var(--sand)",
              borderRadius:"var(--radius)", fontSize:13, outline:"none",
            }}
          />

          {loading ? <Spinner /> : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(160px, 1fr))", gap:12 }}>
              {products.map(p => (
                <div key={p.idArticulo} style={{
                  background:"var(--bg3)", border:"1px solid var(--sand)",
                  borderRadius:"var(--radius)", overflow:"hidden", cursor:"pointer",
                }} onClick={() => setSelectedProduct(p)}>
                  {/* Placeholder image */}
                  <div style={{
                    height:120, background:`linear-gradient(135deg, #e8dcc8 0%, #d4c5a9 100%)`,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:36,
                  }}>
                    {p.tipoArticulo === "Exterior" ? "🌿" : "🪑"}
                  </div>
                  <div style={{ padding:"10px" }}>
                    <p style={{ fontSize:12, fontWeight:500, marginBottom:4, lineHeight:1.3 }}>
                      {p.nombreArticulo}
                    </p>
                    <p style={{ fontSize:13, fontWeight:600, color:"var(--olive)", marginBottom:8 }}>
                      {p.precio ? formatPrice(p.precio) : "—"}
                    </p>
                    {inStock(p)
                      ? <Button size="sm" fullWidth onClick={e => { e.stopPropagation(); handleAddToCart(p); }}>
                          {t("addCart", lang)}
                        </Button>
                      : <Badge variant="danger">{t("noStock", lang)}</Badge>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* ── CART ─────────────────────────────────────────────── */}
      {view === "cart" && (
        <main className="fadeUp" style={{ padding:"16px" }}>
          <h2 style={{ fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:400, marginBottom:16 }}>
            {t("cart", lang)}
          </h2>

          {items.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px", color:"var(--txtMuted)" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🛒</div>
              <p>{t("empty", lang)}</p>
              <Button style={{ marginTop:16 }} onClick={() => setView("catalog")}>
                {t("catalog", lang)}
              </Button>
            </div>
          ) : (
            <>
              {items.map(item => (
                <div key={item.cartId} style={{
                  display:"flex", alignItems:"center", gap:12, padding:"12px",
                  background:"var(--bg3)", border:"1px solid var(--sand)",
                  borderRadius:"var(--radius)", marginBottom:10,
                }}>
                  <div style={{
                    width:48, height:48, borderRadius:8, flexShrink:0,
                    background:"linear-gradient(135deg,#e8dcc8,#d4c5a9)",
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                  }}>
                    {item.tipoArticulo === "Exterior" ? "🌿" : "🪑"}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:13, fontWeight:500, marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {item.nombreArticulo}
                    </p>
                    <p style={{ fontSize:12, color:"var(--olive)", fontWeight:600 }}>
                      {formatQTZ(item.precio)} × {item.qty}
                    </p>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <button onClick={() => updateQty(item.cartId, item.qty - 1)} style={{ width:26, height:26, borderRadius:"50%", border:"1px solid var(--sand)", background:"var(--bg2)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
                    <span style={{ fontSize:13, fontWeight:500, minWidth:20, textAlign:"center" }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.cartId, item.qty + 1)} style={{ width:26, height:26, borderRadius:"50%", border:"1px solid var(--sand)", background:"var(--bg2)", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
                    <button onClick={() => remove(item.cartId)} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--danger)", fontSize:16, padding:"0 4px" }}>✕</button>
                  </div>
                </div>
              ))}

              <div style={{ padding:"16px", background:"var(--bg3)", border:"1px solid var(--sand)", borderRadius:"var(--radius)", marginTop:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13, color:"var(--txtMuted)" }}>
                  <span>Subtotal</span><span>{formatQTZ(subtotal)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12, fontSize:13, color:"var(--txtMuted)" }}>
                  <span>IVA 12%</span><span>{formatQTZ(tax)}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16, fontWeight:700, fontSize:16 }}>
                  <span>Total</span><span style={{ color:"var(--olive)" }}>{formatQTZ(total)}</span>
                </div>
                <Button fullWidth size="lg" onClick={() => {
                  if (!user) { setAuthMode("login"); setShowAuthModal(true); return; }
                  setView("checkout");
                }}>
                  {t("checkout", lang)}
                </Button>
              </div>
            </>
          )}
        </main>
      )}

      {/* ── CHECKOUT ─────────────────────────────────────────── */}
      {view === "checkout" && <CheckoutView showToast={showToast} onDone={handleOrderRefresh} lang={lang} />}

      {/* ── ACCOUNT ──────────────────────────────────────────── */}
      {view === "account" && (
        <main className="fadeUp" style={{ padding:"24px 16px" }}>
          {user ? (
            <>
              <div style={{ textAlign:"center", marginBottom:24 }}>
                <div style={{
                  width:64, height:64, borderRadius:"50%", background:"var(--olive)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  color:"#fff", fontSize:24, fontWeight:600, margin:"0 auto 12px",
                }}>
                  {user.name.split(" ").slice(0,2).map(n => n[0]).join("").toUpperCase()}
                </div>
                <h2 style={{ fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:400 }}>{user.name}</h2>
                <p style={{ fontSize:13, color:"var(--txtMuted)" }}>{user.email}</p>
              </div>

              <section style={{ marginBottom:24 }}>
                <h3 style={{ fontSize:16, marginBottom:12 }}>{lang === "es" ? "Mis pedidos" : lang === "en" ? "My orders" : "Mes commandes"}</h3>
                <div style={{ padding:"16px", background:"var(--bg3)", border:"1px solid var(--sand)", borderRadius:"var(--radius)" }}>
                  {ordersLoading ? (
                    <div style={{ display:"flex", justifyContent:"center", padding:20 }}><Spinner /></div>
                  ) : ordersError ? (
                    <p style={{ fontSize:13, color:"var(--danger)", textAlign:"center" }}>{ordersError}</p>
                  ) : orders.length === 0 ? (
                    <p style={{ fontSize:13, color:"var(--txtMuted)", textAlign:"center" }}>
                      {lang === "es" ? "Aún no tienes pedidos." : lang === "en" ? "You have no orders yet." : "Vous n'avez pas encore de commandes."}
                    </p>
                  ) : (
                    orders.map(order => (
                      <button key={order.id} onClick={() => loadOrderDetail(order.id)} style={{
                        width:"100%", textAlign:"left", padding:"14px 0", borderBottom:"1px solid var(--sand)",
                        background:"none", border:"none", cursor:"pointer",
                      }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:14, fontWeight:600 }}>
                          <span>{order.numero}</span>
                          <span>{formatQTZ(order.total)}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--txtMuted)" }}>
                          <span>{lang === "es" ? "Fecha" : lang === "en" ? "Date" : "Date"}: {order.fecha}</span>
                          <span>{orderStateLabel(order.estado, lang)}</span>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </section>

              <Button variant="ghost" fullWidth onClick={logout}>Cerrar sesión</Button>
            </>
          ) : (
            <div style={{ textAlign:"center", padding:"40px 20px" }}>
              <p style={{ marginBottom:16, color:"var(--txtMuted)" }}>Inicia sesión para ver tu cuenta</p>
              <div style={{ display:"grid", gap:10 }}>
                <Button onClick={() => { setAuthMode("login"); setShowAuthModal(true); }}>{t("login", lang)}</Button>
                <Button variant="ghost" onClick={() => { setAuthMode("register"); setShowAuthModal(true); }}>{t("register", lang)}</Button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* Product detail modal */}
      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title={selectedProduct?.nombreArticulo} width={400}>
        {selectedProduct && (
          <div>
            <div style={{ height:160, background:"linear-gradient(135deg,#e8dcc8,#d4c5a9)", borderRadius:"var(--radius)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:60, marginBottom:16 }}>
              {selectedProduct.tipoArticulo === "Exterior" ? "🌿" : "🪑"}
            </div>
            <p style={{ fontSize:13, color:"var(--txtMid)", marginBottom:12, lineHeight:1.7 }}>
              {selectedProduct.descripcionArticulo ?? "Sin descripción disponible."}
            </p>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
              {selectedProduct.tipoArticulo && <Badge>{selectedProduct.tipoArticulo}</Badge>}
              {selectedProduct.nombreCategoriaArticulo && <Badge variant="muted">{selectedProduct.nombreCategoriaArticulo}</Badge>}
            </div>
            {selectedProduct.precio && (
              <p style={{ fontSize:22, fontWeight:700, color:"var(--olive)", marginBottom:16 }}>
                {formatPrice(selectedProduct.precio)}
              </p>
            )}
            <Button fullWidth size="lg" onClick={() => { handleAddToCart(selectedProduct); setSelectedProduct(null); }}
              disabled={!inStock(selectedProduct)}>
              {inStock(selectedProduct) ? t("addCart", lang) : t("noStock", lang)}
            </Button>
          </div>
        )}
      </Modal>

      {/* Auth modal */}
      <AuthModal isOpen={showAuthModal} mode={authMode} onModeChange={setAuthMode} onClose={() => setShowAuthModal(false)} showToast={showToast} lang={lang} />

      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={selectedOrder ? (lang === "es" ? "Detalle del pedido" : lang === "en" ? "Order detail" : "Détail de la commande") : ""} width={420}>
        {orderDetailLoading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:20 }}><Spinner /></div>
        ) : orderDetailError ? (
          <p style={{ fontSize:13, color:"var(--danger)", textAlign:"center" }}>{orderDetailError}</p>
        ) : selectedOrder ? (
          <div style={{ display:"grid", gap:12 }}>
            <div style={{ display:"grid", gap:4 }}>
              <div style={{ fontSize:14, fontWeight:700 }}>{selectedOrder.cabecera.numeroOrdenVenta}</div>
              <div style={{ fontSize:12, color:"var(--txtMuted)" }}>
                {lang === "es" ? "Fecha" : lang === "en" ? "Date" : "Date"}: {selectedOrder.cabecera.fechaSolicitudOrdenVenta}
              </div>
              <div style={{ fontSize:12, color:"var(--txtMuted)" }}>
                {lang === "es" ? "Estado" : lang === "en" ? "Status" : "Statut"}: {orderStateLabel(selectedOrder.cabecera.estadoOrdenVenta, lang)}
              </div>
            </div>
            <div style={{ padding:"12px", background:"var(--bg2)", borderRadius:"var(--radius)", fontSize:13 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span>{lang === "es" ? "Subtotal" : lang === "en" ? "Subtotal" : "Sous-total"}</span>
                <span>{formatQTZ(selectedOrder.cabecera.subtotalOrdenVenta)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span>{lang === "es" ? "IVA" : lang === "en" ? "Tax" : "Taxe"}</span>
                <span>{formatQTZ(selectedOrder.cabecera.impuestoOrdenVenta)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontWeight:700 }}>
                <span>{lang === "es" ? "Total" : lang === "en" ? "Total" : "Total"}</span>
                <span>{formatQTZ(selectedOrder.cabecera.totalOrdenVenta)}</span>
              </div>
            </div>
            <div style={{ display:"grid", gap:10 }}>
              {selectedOrder.detalle.map(item => (
                <div key={item.idOrdenVentaDetalle} style={{ padding:"12px", background:"var(--bg3)", borderRadius:"var(--radius)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6, fontSize:13, fontWeight:600 }}>
                    <span>{item.nombreArticulo}</span>
                    <span>{formatQTZ(item.precioUnitario)}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"var(--txtMuted)" }}>
                    <span>{lang === "es" ? "Cantidad" : lang === "en" ? "Qty" : "Qté"}: {item.cantidad}</span>
                    <span>{lang === "es" ? "Subtotal" : lang === "en" ? "Subtotal" : "Sous-total"}: {formatQTZ(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Bottom nav */}
      <nav style={{
        position:"fixed", bottom:0, left:0, right:0, zIndex:200,
        background:"rgba(247,243,236,0.95)", backdropFilter:"blur(8px)",
        borderTop:"1px solid var(--sand)", display:"flex",
      }}>
        <NavItem v="home"    icon="🏠"  label={t("home",lang)} />
        <NavItem v="catalog" icon="🪑"  label={t("catalog",lang)} />
        <NavItem v="cart"    icon="🛒"  label={`${t("cart",lang)} ${totalQty > 0 ? `(${totalQty})` : ""}`} />
        <NavItem v="account" icon="👤"  label={user ? user.name.split(" ")[0] : t("account",lang)} />
      </nav>
    </div>
  );
}

// ── Inline checkout view ──────────────────────────────────────
function CheckoutView({ showToast, onDone, lang }: { showToast: (m:string,t?:"success"|"error")=>void; onDone: ()=>void; lang: "es"|"en"|"fr" }) {
  const ck = useCheckout();

  if (ck.step === "success" && ck.orderResult) {
    return (
      <main className="fadeUp" style={{ padding:"32px 16px", textAlign:"center" }}>
        <div style={{ fontSize:64, marginBottom:16 }}>✅</div>
        <h2 style={{ fontFamily:"Cormorant Garamond, serif", fontSize:24, fontWeight:400, marginBottom:8 }}>
          {lang==="es" ? "¡Orden confirmada!" : lang==="en" ? "Order confirmed!" : "Commande confirmée!"}
        </h2>
        <p style={{ fontSize:13, color:"var(--txtMuted)", marginBottom:4 }}>
          {lang==="es" ? "Número de orden:" : "Order number:"} <strong>{ck.orderResult.numero}</strong>
        </p>
        <p style={{ fontSize:18, fontWeight:700, color:"var(--olive)", marginBottom:24 }}>
          {formatQTZ(ck.orderResult.total)}
        </p>
        <Button onClick={onDone}>{lang==="es" ? "Ver mi cuenta" : "My account"}</Button>
      </main>
    );
  }

  return (
    <main className="fadeUp" style={{ padding:"16px" }}>
      <h2 style={{ fontFamily:"Cormorant Garamond, serif", fontSize:22, fontWeight:400, marginBottom:16 }}>
        {lang==="es" ? "Pagar" : lang==="en" ? "Checkout" : "Payer"}
      </h2>

      {/* Order summary */}
      <div style={{ padding:"14px", background:"var(--bg3)", border:"1px solid var(--sand)", borderRadius:"var(--radius)", marginBottom:16 }}>
        {ck.items.map(i => (
          <div key={i.cartId} style={{ display:"flex", justifyContent:"space-between", fontSize:13, marginBottom:6 }}>
            <span>{i.qty}× {i.nombreArticulo}</span>
            <span>{formatQTZ(i.precio * i.qty)}</span>
          </div>
        ))}
        <div style={{ borderTop:"1px solid var(--sand)", marginTop:10, paddingTop:10, display:"flex", justifyContent:"space-between", fontWeight:700 }}>
          <span>Total</span>
          <span style={{ color:"var(--olive)" }}>{formatQTZ(ck.total)}</span>
        </div>
      </div>

      {/* Payment method */}
      <div style={{ display:"flex", gap:10, marginBottom:16 }}>
        {(["card","transfer"] as const).map(m => (
          <button key={m} onClick={() => ck.setMethod(m)} style={{
            flex:1, padding:"12px", borderRadius:"var(--radius)", cursor:"pointer",
            background: ck.method===m ? "var(--olive)" : "var(--bg3)",
            color:      ck.method===m ? "#fff"         : "var(--txtMid)",
            border:`1px solid ${ck.method===m ? "var(--olive)" : "var(--sand)"}`,
            fontFamily:"inherit", fontSize:13, fontWeight:500,
          }}>
            {m === "card" ? (lang==="es" ? "💳 Tarjeta" : "💳 Card") : (lang==="es" ? "🏦 Transferencia" : "🏦 Transfer")}
          </button>
        ))}
      </div>

      {ck.method === "card" && (
        <div style={{ display:"grid", gap:12, marginBottom:20 }}>
          <Input label={lang==="es" ? "Número de tarjeta" : "Card number"}
            value={ck.cardData.number} onChange={v => ck.setCardData(d => ({...d, number:v}))}
            placeholder="1234 5678 9012 3456" error={ck.cardErrors.number} />
          <Input label={lang==="es" ? "Nombre en tarjeta" : "Card name"}
            value={ck.cardData.name} onChange={v => ck.setCardData(d => ({...d, name:v}))}
            error={ck.cardErrors.name} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="MM/AA" value={ck.cardData.expiry} onChange={v => ck.setCardData(d => ({...d, expiry:v}))} placeholder="12/27" error={ck.cardErrors.expiry} />
            <Input label="CVV" value={ck.cardData.cvv} onChange={v => ck.setCardData(d => ({...d, cvv:v}))} placeholder="123" error={ck.cardErrors.cvv} />
          </div>
        </div>
      )}

      {ck.error && <p style={{ fontSize:12, color:"var(--danger)", marginBottom:12, textAlign:"center" }}>{ck.error}</p>}

      <Button fullWidth size="lg" loading={ck.loading} onClick={ck.pay}>
        {lang==="es" ? `Pagar ${formatQTZ(ck.total)}` : `Pay ${formatQTZ(ck.total)}`}
      </Button>
    </main>
  );
}

// ── Auth modal ───────────────────────────────────────────────
function AuthModal({ isOpen, mode, onModeChange, onClose, showToast, lang }: {
  isOpen:boolean; mode:"login"|"register"; onModeChange:(mode:"login"|"register")=>void;
  onClose:()=>void; showToast:(m:string,t?:"success"|"error")=>void; lang:"es"|"en"|"fr";
}) {
  const { login, register, loading, errors } = useAuth();
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [name, setName]       = useState("");
  const [nit, setNit]         = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity]       = useState("");
  const [country, setCountry] = useState("");

  const title = mode === "login"
    ? (lang === "es" ? "Iniciar sesión" : lang === "en" ? "Sign in" : "Connexion")
    : (lang === "es" ? "Crear cuenta" : lang === "en" ? "Create account" : "Créer un compte");

  const resetFields = () => {
    setEmail(""); setPass(""); setName(""); setNit(""); setPhone(""); setAddress(""); setCity(""); setCountry("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "login") {
      const ok = await login({ email, password });
      if (ok) { showToast(lang === "es" ? "Bienvenido" : lang === "en" ? "Welcome" : "Bienvenue", "success"); onClose(); }
      return;
    }

    const ok = await register({ name, email, password, nit, phone, address, city, country });
    if (ok) { showToast(lang === "es" ? "Cuenta creada" : lang === "en" ? "Account created" : "Compte créé", "success"); onClose(); }
  };

  const toggleMode = () => {
    const nextMode = mode === "login" ? "register" : "login";
    onModeChange(nextMode);
    resetFields();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width={380}>
      <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
        {mode === "register" && (
          <>
            <Input label={t("name", lang)} value={name} onChange={setName} required error={errors.name} />
            <Input label={t("nit", lang)} value={nit} onChange={setNit} required error={errors.nit} />
          </>
        )}
        <Input label="Email" type="email" value={email} onChange={setEmail} required error={errors.email} />
        <Input label={lang==="es" ? "Contraseña" : "Password"} type="password" value={password} onChange={setPass} required error={errors.password} />
        {mode === "register" && (
          <>
            <Input label={t("phone", lang)} value={phone} onChange={setPhone} />
            <Input label={t("address", lang)} value={address} onChange={setAddress} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <Input label={t("city", lang)} value={city} onChange={setCity} />
              <Input label={t("country", lang)} value={country} onChange={setCountry} />
            </div>
          </>
        )}

        {errors.general && <p style={{ fontSize:12, color:"var(--danger)", textAlign:"center" }}>{errors.general}</p>}
        <Button type="submit" fullWidth loading={loading}>
          {mode === "login"
            ? (lang === "es" ? "Entrar" : lang === "en" ? "Sign in" : "Connexion")
            : (lang === "es" ? "Registrarse" : lang === "en" ? "Register" : "S'inscrire")}
        </Button>
        <button type="button" onClick={toggleMode} style={{ background:"none", border:"none", color:"var(--olive)", cursor:"pointer", fontSize:12, textDecoration:"underline" }}>
          {mode === "login" ? t("noAccount", lang) : t("alreadyAccount", lang)}
        </button>
      </form>
    </Modal>
  );
}
