import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Plus, Truck, Building2, History, Menu, X } from "lucide-react";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const navigationItems = [
  { title: "Dashboard", url: createPageUrl("Dashboard"), icon: LayoutDashboard },
  { title: "Create Invoice", url: createPageUrl("CreateInvoice"), icon: Plus },
  { title: "Proforma History", url: createPageUrl("ProformaHistory"), icon: History },
  { title: "Company Profile", url: createPageUrl("CompanyProfile"), icon: Building2 },
];

function NavLinks({ currentPath, onLinkClick }) {
  return (
    <nav className="flex flex-col gap-1 p-2">
      {navigationItems.map((item) => {
        const isActive = currentPath === item.url;
        return (
          <Link
            key={item.title}
            to={item.url}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              isActive
                ? "bg-blue-50 text-blue-700"
                : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex w-full bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 shrink-0">
        <div className="border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Dr Howo</h2>
              <p className="text-xs text-slate-500">Auto Garage Ltd</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider px-4 pt-4 pb-1">Menu</p>
          <NavLinks />
        </div>

        <div className="border-t border-slate-200 p-4 text-xs text-slate-500">
          <p className="font-semibold text-slate-700">Dr Howo Auto Garage Ltd</p>
          <p className="mt-1">NMB Bank Plc</p>
          <p>Acc: 0123456789</p>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-200 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-slate-200 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm">Dr Howo</h2>
              <p className="text-xs text-slate-500">Auto Garage Ltd</p>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 md:hidden flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">Dr Howo</h1>
        </header>

        <div className="flex-1 overflow-auto">
          <ErrorBoundary name={currentPageName}>
            {children}
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}