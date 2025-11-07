
import React, { useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Share2, Printer } from "lucide-react";
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
  const currencySymbol = invoice?.currency === "TZS" ? "TZS " : "$";

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Proforma Invoice ${invoice?.invoice_number} - ${company?.company_name || 'Dr Howo Auto Garage'}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          url: shareUrl
        });
      } catch (error) {
        if (error.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(shareUrl);
            alert("Link copied to clipboard!");
          } catch (clipboardError) {
            console.error("Sharing failed:", error);
            alert("Unable to share. Please copy the URL from your browser.");
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      } catch (error) {
        console.error("Clipboard write failed:", error);
        alert("Unable to copy link. Please copy the URL from your browser.");
      }
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
          {/* Header with Logo and Company Info */}
          <div className="border-b-4 border-green-600 p-8">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-6">
                {company?.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt="Company Logo"
                    className="w-32 h-32 object-contain border-4 border-slate-800 p-2 bg-white"
                  />
                ) : (
                  <div className="w-32 h-32 border-4 border-slate-800 flex items-center justify-center bg-white">
                    <span className="text-2xl font-bold">LOGO</span>
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-5xl font-black text-slate-900 tracking-tight uppercase mb-2">
                    {company?.company_name?.split(',')[0] || 'DR. HOWO'}
                  </h1>
                  <h2 className="text-2xl font-bold text-slate-800 tracking-wide uppercase mb-4">
                    {company?.company_name?.split(',')[1]?.trim() || 'EMENS GROUP LIMITED'}
                  </h2>
                  <div className="text-base font-semibold text-slate-700">
                    {company?.phone_numbers && (
                      <span>Simu: {company.phone_numbers}</span>
                    )}
                    {company?.tin_number && (
                      <span className="ml-3">| TIN NO: {company.tin_number}</span>
                    )}
                  </div>
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
            
            {company?.physical_address && (
              <div className="mt-4 text-sm text-slate-600">
                <p>{company.physical_address}</p>
              </div>
            )}
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

            {/* General Images (if any) */}
            {invoice.images && invoice.images.length > 0 && (
              <div>
                <h3 className="font-semibold text-slate-700 mb-3">Additional Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {invoice.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Additional ${idx + 1}`}
                      className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Items Table with Images in Description */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold w-20">Item</TableHead>
                    <TableHead className="font-bold">Description</TableHead>
                    <TableHead className="font-bold text-center w-32">Quantity<br/>(Units)</TableHead>
                    <TableHead className="font-bold text-right w-32">Unit<br/>Price</TableHead>
                    <TableHead className="font-bold text-right w-32">Delivery<br/>Price</TableHead>
                    <TableHead className="font-bold text-right w-32">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-bold text-center align-top pt-4">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="align-top">
                        {item.images && item.images.length > 0 && (
                          <div className="mb-3 grid grid-cols-2 gap-2">
                            {item.images.map((img, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={img}
                                alt={`${item.item} - ${imgIdx + 1}`}
                                className="w-full h-32 print:h-20 object-cover rounded border-2 border-slate-200"
                              />
                            ))}
                          </div>
                        )}
                        <div className="font-bold text-base mb-2">{item.item}</div>
                        <div className="text-sm whitespace-pre-wrap text-slate-700">
                          {item.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-top pt-4">{item.quantity}</TableCell>
                      <TableCell className="text-right align-top pt-4">{currencySymbol}{item.price?.toLocaleString()}</TableCell>
                      <TableCell className="text-right align-top pt-4">{currencySymbol}{(item.delivery_price || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold align-top pt-4">{currencySymbol}{item.total?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-blue-50 font-bold">
                    <TableCell colSpan={5} className="text-right">TOTAL AMOUNT</TableCell>
                    <TableCell className="text-right text-lg text-blue-600">
                      {currencySymbol}{invoice.total_amount?.toLocaleString()}
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
            {company?.registration_number && (
              <div className="text-sm text-slate-600 pt-4 border-t">
                <p><span className="font-semibold">Registration No:</span> {company.registration_number}</p>
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
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @media print {
          body { margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:h-20 { height: 5rem !important; }
        }
      `}</style>
    </div>
  );
}
