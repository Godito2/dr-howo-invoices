import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Plus, History, Building2, Menu, X, Truck } from "lucide-react";

const navItems = [
  { title: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { title: "Create Invoice", page: "CreateInvoice", icon: Plus },
  { title: "Proforma History", page: "ProformaHistory", icon: History },
  { title: "Company Profile", page: "CompanyProfile", icon: Building2 },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Desktop Sidebar */}
      <aside style={{
        width: 240,
        background: "#fff",
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }} className="hidden md:flex">
        <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Truck size={20} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Dr Howo</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Auto Garage Ltd</div>
          </div>
        </div>
        <nav style={{ flex: 1, padding: "8px" }}>
          {navItems.map((item) => {
            const href = createPageUrl(item.page);
            const active = location.pathname === href;
            return (
              <Link
                key={item.page}
                to={href}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 8, marginBottom: 2,
                  textDecoration: "none", fontSize: 13, fontWeight: 500,
                  background: active ? "#eff6ff" : "transparent",
                  color: active ? "#1d4ed8" : "#475569",
                }}
              >
                <item.icon size={16} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 40 }}
        />
      )}

      {/* Mobile drawer */}
      <aside style={{
        position: "fixed", top: 0, left: open ? 0 : -260, bottom: 0, width: 240,
        background: "#fff", borderRight: "1px solid #e2e8f0",
        display: "flex", flexDirection: "column", zIndex: 50,
        transition: "left 0.2s ease",
      }} className="md:hidden">
        <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#2563eb,#1d4ed8)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Truck size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>Dr Howo</span>
          </div>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={20} color="#64748b" />
          </button>
        </div>
        <nav style={{ flex: 1, padding: "8px" }}>
          {navItems.map((item) => {
            const href = createPageUrl(item.page);
            const active = location.pathname === href;
            return (
              <Link
                key={item.page}
                to={href}
                onClick={() => setOpen(false)}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 8, marginBottom: 2,
                  textDecoration: "none", fontSize: 13, fontWeight: 500,
                  background: active ? "#eff6ff" : "transparent",
                  color: active ? "#1d4ed8" : "#475569",
                }}
              >
                <item.icon size={16} />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Mobile header */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }} className="md:hidden">
          <button onClick={() => setOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <Menu size={22} color="#475569" />
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#0f172a" }}>Dr Howo</span>
        </header>
        <div style={{ flex: 1, overflow: "auto" }}>
          {children}
        </div>
      </div>
    </div>
  );
}