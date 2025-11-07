import React, { useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, Printer, Truck, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ViewInvoice() {
  const navigate = useNavigate();
  const printRef = useRef();
  const urlParams = new URLSearchParams(window.location.search);
  const invoiceId = urlParams.get('id');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['proforma-invoices'],
    queryFn: () => base44.entities.ProformaInvoice.list(),
  });

  const { data: companyProfiles = [] } = useQuery({
    queryKey: ['company-profile'],
    queryFn: () => base44.entities.CompanyProfile.list(),
  });

  const invoice = invoices.find(inv => inv.id === invoiceId || inv.invoice_number === invoiceId);
  const company = companyProfiles[0];

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareText = `Proforma Invoice ${invoice?.invoice_number} - ${company?.company_name || 'Dr Howo Auto Garage'}`;
    
    if (navigator.share) {
      navigator.share({
        title: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <div className="min-h-screen bg-slate-50">
      {/* Action Bar - Hidden in print */}
      <div className="bg-white border-b border-slate-200 p-4 print:hidden sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(createPageUrl("Dashboard"))}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-5xl mx-auto p-4 md:p-8" ref={printRef}>
        <Card className="bg-white shadow-lg print:shadow-none">
          {/* Header with Logo and QR Code */}
          <div className="border-b-4 border-blue-600 p-8">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {company?.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt="Company Logo"
                    className="w-20 h-20 object-contain"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                    <Truck className="w-10 h-10 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">
                    {company?.company_name || 'Dr Howo'}
                  </h1>
                  <p className="text-slate-600">Auto Garage Ltd</p>
                  {company?.physical_address && (
                    <p className="text-sm text-slate-500 mt-1">{company.physical_address}</p>
                  )}
                  {company?.phone_numbers && (
                    <p className="text-sm text-slate-500">{company.phone_numbers}</p>
                  )}
                  {company?.email && (
                    <p className="text-sm text-slate-500">{company.email}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                {invoice.qr_code_data && (
                  <div className="mb-2">
                    <img src={invoice.qr_code_data} alt="QR Code" className="w-24 h-24" />
                    <p className="text-xs text-slate-500 mt-1">Scan to view online</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-blue-600 mb-4">PROFORMA INVOICE</h2>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold">Invoice Number:</span> {invoice.invoice_number}</p>
                  <p><span className="font-semibold">Date:</span> {invoice.invoice_date && format(new Date(invoice.invoice_date), "MMMM d, yyyy")}</p>
                  {invoice.delivery_date && (
                    <p><span className="font-semibold">Expected Delivery:</span> {format(new Date(invoice.delivery_date), "MMMM d, yyyy")}</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <h3 className="font-semibold text-slate-700 mb-2">Bill To:</h3>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{invoice.customer_name}</p>
                  {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
                  {invoice.customer_email && <p>{invoice.customer_email}</p>}
                  {invoice.address && <p>{invoice.address}</p>}
                </div>
              </div>
            </div>

            {/* Vehicle Details */}
            {(invoice.vehicle_model || invoice.vehicle_plate) && (
              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <h3 className="font-semibold text-slate-700 mb-2">Vehicle Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {invoice.vehicle_model && (
                    <p><span className="font-semibold">Model:</span> {invoice.vehicle_model}</p>
                  )}
                  {invoice.vehicle_plate && (
                    <p><span className="font-semibold">Plate Number:</span> <span className="font-mono font-bold">{invoice.vehicle_plate}</span></p>
                  )}
                </div>
              </div>
            )}

            {/* Images */}
            {invoice.images && invoice.images.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Vehicle/Spare Parts Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {invoice.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Vehicle ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold">ITEM</TableHead>
                    <TableHead className="font-bold">DESCRIPTION</TableHead>
                    <TableHead className="font-bold text-center">QUANTITY</TableHead>
                    <TableHead className="font-bold text-right">PRICE</TableHead>
                    <TableHead className="font-bold">DELIVERY</TableHead>
                    <TableHead className="font-bold text-right">TOTAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.item}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">${item.price?.toFixed(2)}</TableCell>
                      <TableCell>{item.delivery}</TableCell>
                      <TableCell className="text-right font-semibold">${item.total?.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-blue-50 font-bold">
                    <TableCell colSpan={5} className="text-right">TOTAL AMOUNT</TableCell>
                    <TableCell className="text-right text-lg text-blue-600">
                      ${invoice.total_amount?.toFixed(2)}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            {/* Notes */}
            {invoice.notes && (
              <div className="bg-slate-50 p-4 rounded-lg">
                <h3 className="font-semibold text-slate-700 mb-2">Notes</h3>
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            )}

            {/* Company Registration Details */}
            {(company?.tin_number || company?.registration_number) && (
              <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 pt-4 border-t">
                {company.tin_number && (
                  <p><span className="font-semibold">TIN:</span> {company.tin_number}</p>
                )}
                {company.registration_number && (
                  <p><span className="font-semibold">Reg No:</span> {company.registration_number}</p>
                )}
              </div>
            )}
          </div>

          {/* Bank Information Footer */}
          <div className="bg-slate-800 text-white p-8">
            <h3 className="font-bold text-lg mb-4">BANK INFORMATION</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-300">BENEFICIARY</p>
                <p className="font-semibold">{company?.company_name || 'Dr Howo Auto Garage Ltd'}</p>
              </div>
              <div>
                <p className="text-slate-300">ACCOUNT NUMBER</p>
                <p className="font-semibold">{company?.bank_account_number || '0123456789'}</p>
              </div>
              <div>
                <p className="text-slate-300">BRANCH NAME</p>
                <p className="font-semibold">{company?.bank_branch || 'Dar es Salaam Main Branch'}</p>
              </div>
              <div>
                <p className="text-slate-300">BANKERS & ADDRESS</p>
                <p className="font-semibold">
                  {company?.bank_name || 'NMB Bank Plc'}, {company?.bank_address || 'Ohio Street, Dar es Salaam'}
                </p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-slate-700 text-center text-xs text-slate-400">
              <p>Thank you for your business! For inquiries, please contact us.</p>
              <p className="mt-1">This is a computer-generated proforma invoice.</p>
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @media print {
          body { margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}