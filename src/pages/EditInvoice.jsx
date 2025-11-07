
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ItemsTable from "../components/invoices/ItemsTable";
import ImageUploader from "../components/invoices/ImageUploader";

export default function EditInvoice() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('id');
  
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    address: "",
    vehicle_model: "",
    vehicle_plate: "",
    invoice_date: new Date().toISOString().split('T')[0],
    delivery_date: "",
    currency: "USD",
    items: [{ item: "", description: "", quantity: 1, price: 0, delivery_price: 0, total: 0, images: [] }],
    notes: "",
    images: [],
    status: "pending"
  });

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['proforma-invoices'],
    queryFn: () => base44.entities.ProformaInvoice.list(),
  });

  const invoice = invoices.find(inv => inv.id === invoiceId);

  useEffect(() => {
    if (invoice) {
      setFormData({
        customer_name: invoice.customer_name || "",
        customer_phone: invoice.customer_phone || "",
        customer_email: invoice.customer_email || "",
        address: invoice.address || "",
        vehicle_model: invoice.vehicle_model || "",
        vehicle_plate: invoice.vehicle_plate || "",
        invoice_date: invoice.invoice_date || new Date().toISOString().split('T')[0],
        delivery_date: invoice.delivery_date || "",
        currency: invoice.currency || "USD",
        items: invoice.items || [{ item: "", description: "", quantity: 1, price: 0, delivery_price: 0, total: 0, images: [] }],
        notes: invoice.notes || "",
        images: invoice.images || [],
        status: invoice.status || "pending"
      });
    }
  }, [invoice]);

  const updateInvoiceMutation = useMutation({
    mutationFn: async (data) => {
      const invoiceData = {
        ...data,
        total_amount: data.items.reduce((sum, item) => sum + (item.total || 0), 0)
      };

      return base44.entities.ProformaInvoice.update(invoiceId, invoiceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proforma-invoices'] });
      navigate(createPageUrl("Dashboard"));
    },
    onError: (err) => {
      setError("Failed to update invoice. Please try again.");
      console.error(err);
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.customer_name || formData.items.length === 0) {
      setError("Please fill in customer name and add at least one item.");
      return;
    }

    updateInvoiceMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Invoice Not Found</h2>
          <p className="text-slate-600 mb-4">The requested invoice could not be found.</p>
          <Button onClick={() => navigate(createPageUrl("Dashboard"))}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("ProformaHistory"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Invoice</h1>
            <p className="text-slate-600 mt-1">Update invoice {invoice.invoice_number}</p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) => handleInputChange('customer_name', e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_phone">Phone Number</Label>
                <Input
                  id="customer_phone"
                  value={formData.customer_phone}
                  onChange={(e) => handleInputChange('customer_phone', e.target.value)}
                  placeholder="+255 XXX XXX XXX"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_email">Email</Label>
                <Input
                  id="customer_email"
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => handleInputChange('customer_email', e.target.value)}
                  placeholder="customer@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Dar es Salaam, Tanzania"
                />
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Currency Information */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Delivery & Currency</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Expected Delivery Date</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="USD">USD ($)</option>
                  <option value="TZS">TZS (Tanzanian Shilling)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ItemsTable
                items={formData.items}
                onChange={(items) => handleInputChange('items', items)}
                currency={formData.currency}
              />
            </CardContent>
          </Card>

          {/* General Images (Optional) */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Additional Images (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">Upload general images not specific to any item</p>
              <ImageUploader
                images={formData.images}
                onChange={(images) => handleInputChange('images', images)}
              />
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Add any additional terms, conditions, or notes..."
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(createPageUrl("ProformaHistory"))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updateInvoiceMutation.isPending}
            >
              {updateInvoiceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Invoice
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
