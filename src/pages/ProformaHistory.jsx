
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  History, 
  Search, 
  Eye, 
  Calendar,
  DollarSign,
  User,
  Truck,
  FileText,
  Pencil, // Added
  Trash2 // Added
} from "lucide-react";
import { format } from "date-fns";
import { Link, useNavigate } from "react-router-dom"; // Added useNavigate
import { createPageUrl } from "@/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { // Added AlertDialog imports
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const statusColors = {
  pending: "bg-orange-100 text-orange-800 border-orange-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200"
};

export default function ProformaHistory() {
  const navigate = useNavigate(); // Added useNavigate hook
  const queryClient = useQueryClient(); // Added useQueryClient hook
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Added state for delete dialog
  const [invoiceToDelete, setInvoiceToDelete] = useState(null); // Added state for invoice to delete

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['proforma-invoices'],
    queryFn: () => base44.entities.ProformaInvoice.list('-created_date'),
  });

  // Added delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ProformaInvoice.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proforma-invoices'] });
      setDeleteDialogOpen(false);
      setInvoiceToDelete(null);
    }
  });

  // Added handler for delete button
  const handleDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setDeleteDialogOpen(true);
  };

  // Added function to confirm deletion
  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteMutation.mutate(invoiceToDelete.id);
    }
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = !searchQuery || 
      invoice.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.vehicle_model?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    let matchesDate = true;
    if (dateFilter !== "all" && invoice.created_date) {
      const invoiceDate = new Date(invoice.created_date);
      const now = new Date();
      const daysDiff = Math.floor((now - invoiceDate) / (1000 * 60 * 60 * 24));
      
      switch(dateFilter) {
        case "today":
          matchesDate = daysDiff === 0;
          break;
        case "week":
          matchesDate = daysDiff <= 7;
          break;
        case "month":
          matchesDate = daysDiff <= 30;
          break;
        case "year":
          matchesDate = daysDiff <= 365;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const paidAmount = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <History className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Proforma History</h1>
              <p className="text-slate-600">View and manage all your proforma invoices</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Invoices</p>
                  <CardTitle className="text-3xl font-bold mt-2">{filteredInvoices.length}</CardTitle>
                </div>
                <div className="p-3 rounded-xl bg-blue-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Total Value</p>
                  <CardTitle className="text-3xl font-bold mt-2">
                    ${totalAmount.toLocaleString()}
                  </CardTitle>
                </div>
                <div className="p-3 rounded-xl bg-purple-100">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-500">Paid Amount</p>
                  <CardTitle className="text-3xl font-bold mt-2">
                    ${paidAmount.toLocaleString()}
                  </CardTitle>
                </div>
                <div className="p-3 rounded-xl bg-green-100">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-none shadow-md mb-6">
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="border-none shadow-md">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No invoices found</h3>
                <p className="text-slate-500">
                  {searchQuery ? "Try adjusting your search or filters" : "No invoice history available"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-bold">Invoice #</TableHead>
                      <TableHead className="font-bold">Customer</TableHead>
                      <TableHead className="font-bold">Vehicle</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold text-right">Amount</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono font-semibold text-blue-600">
                          {invoice.invoice_number}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-400" />
                            <div>
                              <p className="font-medium">{invoice.customer_name}</p>
                              {invoice.customer_phone && (
                                <p className="text-xs text-slate-500">{invoice.customer_phone}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-slate-400" />
                            <span>{invoice.vehicle_model || '-'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>
                              {invoice.created_date && format(new Date(invoice.created_date), "MMM d, yyyy")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${(invoice.total_amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusColors[invoice.status]} border`}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={createPageUrl(`ViewInvoice?id=${invoice.id}`)}>
                              <Button variant="ghost" size="sm" title="View">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            {/* Added Edit Button */}
                            <Link to={createPageUrl(`EditInvoice?id=${invoice.id}`)}>
                              <Button variant="ghost" size="sm" title="Edit">
                                <Pencil className="w-4 h-4 text-blue-600" />
                              </Button>
                            </Link>
                            {/* Added Delete Button */}
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDelete(invoice)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete invoice <span className="font-semibold">{invoiceToDelete?.invoice_number}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
