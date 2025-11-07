
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, FileText, Search, Eye, Download, DollarSign, Clock, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import InvoiceCard from "../components/invoices/InvoiceCard";

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['proforma-invoices'],
    queryFn: () => base44.entities.ProformaInvoice.list('-created_date'),
  });

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchQuery || 
      invoice.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.vehicle_model?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    approved: invoices.filter(i => i.status === 'approved').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    totalAmount: invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    totalAmountUSD: invoices.filter(i => i.currency === 'USD').reduce((sum, inv) => sum + (inv.total_amount || 0), 0),
    totalAmountTZS: invoices.filter(i => i.currency === 'TZS').reduce((sum, inv) => sum + (inv.total_amount || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Proforma Invoices</h1>
            <p className="text-slate-600 mt-1">Manage your vehicle and spare parts invoices</p>
          </div>
          <Link to={createPageUrl("CreateInvoice")}>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg">
              <Plus className="w-5 h-5 mr-2" />
              New Invoice
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Invoices</p>
                  <CardTitle className="text-3xl font-bold mt-2">{stats.total}</CardTitle>
                </div>
                <div className="p-3 rounded-xl bg-blue-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Pending</p>
                  <CardTitle className="text-3xl font-bold mt-2">{stats.pending}</CardTitle>
                </div>
                <div className="p-3 rounded-xl bg-orange-100">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Paid</p>
                  <CardTitle className="text-3xl font-bold mt-2">{stats.paid}</CardTitle>
                </div>
                <div className="p-3 rounded-xl bg-green-100">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-md bg-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Value</p>
                  <div className="mt-2">
                    {stats.totalAmountUSD > 0 && (
                      <CardTitle className="text-2xl font-bold">
                        ${stats.totalAmountUSD.toLocaleString()}
                      </CardTitle>
                    )}
                    {stats.totalAmountTZS > 0 && (
                      <CardTitle className="text-xl font-bold text-slate-700">
                        TZS {stats.totalAmountTZS.toLocaleString()}
                      </CardTitle>
                    )}
                    {stats.totalAmountUSD === 0 && stats.totalAmountTZS === 0 && (
                      <CardTitle className="text-2xl font-bold">$0</CardTitle>
                    )}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-purple-100">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="border-none shadow-md mb-6 bg-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search by customer, invoice number, or vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                {['all', 'pending', 'approved', 'paid', 'cancelled'].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={statusFilter === status ? "bg-blue-600" : ""}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-slate-200" />
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <Card className="border-none shadow-md bg-white">
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">No invoices found</h3>
              <p className="text-slate-500 mb-6">
                {searchQuery ? "Try adjusting your search criteria" : "Get started by creating your first proforma invoice"}
              </p>
              <Link to={createPageUrl("CreateInvoice")}>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInvoices.map((invoice) => (
              <InvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
