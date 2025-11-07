
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function CreateInvoice() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    address: "",
    vehicle_model: "",
    vehicle_plate: "",
    invoice_date: new Date().toISOString().split('T')[0],
    delivery_date: "",
    items: [{ item: "", description: "", quantity: 1, price: 0, delivery_price: 0, total: 0, images: [] }],
    notes: "",
    images: [],
    status: "pending"
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (data) => {
      // Generate invoice number
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const invoiceNumber = `DRH-PF-${year}${month}-${random}`;

      // Generate QR code data URL
      const qrCodeUrl = `${window.location.origin}${createPageUrl(`ViewInvoice?id=${invoiceNumber}`)}`;
      const qrCodeData = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`;

      const invoiceData = {
        ...data,
        invoice_number: invoiceNumber,
        qr_code_data: qrCodeData,
        total_amount: data.items.reduce((sum, item) => sum + (item.total || 0), 0)
      };

      return base44.entities.ProformaInvoice.create(invoiceData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proforma-invoices'] });
      navigate(createPageUrl("Dashboard"));
    },
    onError: (err) => {
      setError("Failed to create invoice. Please try again.");
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

    createInvoiceMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Create Proforma Invoice</h1>
            <p className="text-slate-600 mt-1">Generate a new invoice for vehicle or spare parts</p>
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

          {/* Delivery Information */}
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle_model">Vehicle Model</Label>
                <Input
                  id="vehicle_model"
                  value={formData.vehicle_model}
                  onChange={(e) => handleInputChange('vehicle_model', e.target.value)}
                  placeholder="HOWO A7 Truck"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_plate">License Plate</Label>
                <Input
                  id="vehicle_plate"
                  value={formData.vehicle_plate}
                  onChange={(e) => handleInputChange('vehicle_plate', e.target.value)}
                  placeholder="T 123 ABC"
                  className="font-mono uppercase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery_date">Expected Delivery Date</Label>
                <Input
                  id="delivery_date"
                  type="date"
                  value={formData.delivery_date}
                  onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                />
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
              onClick={() => navigate(createPageUrl("Dashboard"))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={createInvoiceMutation.isPending}
            >
              {createInvoiceMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Invoice
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
