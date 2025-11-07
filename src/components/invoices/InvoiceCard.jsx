import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Download, Truck, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  pending: "bg-orange-100 text-orange-800 border-orange-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200"
};

export default function InvoiceCard({ invoice }) {
  return (
    <Card className="border-none shadow-md hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
      <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-slate-900">{invoice.invoice_number}</h3>
              <Badge className={`${statusColors[invoice.status]} border`}>
                {invoice.status}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              {invoice.created_date && format(new Date(invoice.created_date), "MMM d, yyyy")}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500">Total Amount</p>
            <p className="text-2xl font-bold text-blue-600">
              ${(invoice.total_amount || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <User className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Customer</p>
              <p className="text-sm font-medium text-slate-900">{invoice.customer_name}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Truck className="w-4 h-4 text-slate-400 mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Vehicle</p>
              <p className="text-sm font-medium text-slate-900">{invoice.vehicle_model || 'N/A'}</p>
            </div>
          </div>
        </div>

        {invoice.vehicle_plate && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
            <div className="px-3 py-1 bg-white border-2 border-slate-300 rounded font-mono text-sm font-bold">
              {invoice.vehicle_plate}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4" />
          <span>Delivery: {invoice.delivery_date ? format(new Date(invoice.delivery_date), "MMM d, yyyy") : 'TBD'}</span>
        </div>

        {invoice.images && invoice.images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {invoice.images.slice(0, 3).map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Vehicle ${idx + 1}`}
                className="w-20 h-20 object-cover rounded-lg border-2 border-slate-200"
              />
            ))}
            {invoice.images.length > 3 && (
              <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-semibold">
                +{invoice.images.length - 3}
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <Link to={createPageUrl(`ViewInvoice?id=${invoice.id}`)} className="flex-1">
            <Button variant="outline" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View
            </Button>
          </Link>
          <Button variant="default" className="flex-1 bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}