
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
          <div className="p-6 pb-4">
            <div className="flex justify-between items-start mb-4">
              {/* Logo */}
              <div className="flex-shrink-0">
                {company?.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt="Company Logo"
                    className="w-24 h-24 object-contain border-2 border-slate-800 p-1 bg-white"
                  />
                ) : (
                  <div className="w-24 h-24 border-2 border-slate-800 flex items-center justify-center bg-white">
                    <span className="text-lg font-bold">LOGO</span>
                  </div>
                )}
              </div>

              {/* Company Name */}
              <div className="flex-1 text-center px-4">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase mb-1">
                  {company?.company_name?.split(',')[0] || 'DR HOWO'}
                </h1>
                <h2 className="text-xl font-bold text-slate-800 tracking-wide uppercase mb-3">
                  {company?.company_name?.split(',')[1]?.trim() || 'EMENS GROUP LIMITED'}
                </h2>
                <div className="text-xs font-medium text-slate-700">
                  {company?.phone_numbers && (
                    <span>Simu: {company.phone_numbers}</span>
                  )}
                  {company?.tin_number && (
                    <span className="ml-2">| TIN NO: {company.tin_number}</span>
                  )}
                </div>
              </div>

              {/* QR Code */}
              <div className="flex-shrink-0 text-center">
                {invoice.qr_code_data && (
                  <div>
                    <img src={invoice.qr_code_data} alt="QR Code" className="w-20 h-20 mb-1" />
                    <p className="text-xs text-slate-500">Scan to view online</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Physical Address */}
            {company?.physical_address && (
              <div className="text-xs text-slate-600 text-center">
                <p>{company.physical_address}</p>
              </div>
            )}
          </div>

          {/* Black Line Separator - 1mm */}
          <div className="h-1 bg-black" style={{height: '1mm'}}></div>

          {/* Invoice Details */}
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-blue-600 mb-3">PROFORMA INVOICE</h2>
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

            {/* Items Table */}
            <div className="border-2 border-slate-300 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold w-16 border-r-2 border-slate-300">Item</TableHead>
                    <TableHead className="font-bold border-r-2 border-slate-300">Description</TableHead>
                    <TableHead className="font-bold text-center w-28 border-r-2 border-slate-300">Quantity<br/>(Units)</TableHead>
                    <TableHead className="font-bold text-right w-32 border-r-2 border-slate-300">Unit<br/>Price</TableHead>
                    <TableHead className="font-bold text-right w-32 border-r-2 border-slate-300">Delivery<br/>Price</TableHead>
                    <TableHead className="font-bold text-right w-32">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items?.map((item, idx) => (
                    <TableRow key={idx} className="border-t border-slate-300">
                      <TableCell className="font-bold text-center align-top pt-4 border-r-2 border-slate-300">
                        {idx + 1}
                      </TableCell>
                      <TableCell className="align-top py-3 border-r-2 border-slate-300">
                        {item.images && item.images.length > 0 && (
                          <div className="mb-2 flex gap-2">
                            {item.images.map((img, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={img}
                                alt={`${item.item} - ${imgIdx + 1}`}
                                className="w-24 h-24 object-cover rounded border border-slate-300"
                              />
                            ))}
                          </div>
                        )}
                        <div className="font-bold text-sm mb-1">{item.item}</div>
                        <div className="text-xs whitespace-pre-wrap text-slate-700 leading-relaxed">
                          {item.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-center align-top pt-4 border-r-2 border-slate-300">{item.quantity}</TableCell>
                      <TableCell className="text-right align-top pt-4 border-r-2 border-slate-300">{currencySymbol}{item.price?.toLocaleString()}</TableCell>
                      <TableCell className="text-right align-top pt-4 border-r-2 border-slate-300">{currencySymbol}{(item.delivery_price || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right font-semibold align-top pt-4">{currencySymbol}{item.total?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-blue-50 font-bold border-t-2 border-slate-300">
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
              <div className="bg-slate-50 p-3 rounded">
                <h3 className="font-semibold text-slate-700 mb-1 text-sm">Notes</h3>
                <div className="text-xs text-slate-600 whitespace-pre-wrap space-y-0.5">
                  {invoice.notes.split('\n').map((line, idx) => (
                    <p key={idx}>{idx + 1}. {line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bank Information Footer */}
          <div className="bg-slate-800 text-white p-4">
            <h3 className="font-bold text-sm mb-2 uppercase">Bank Information</h3>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
              <div>
                <p className="text-slate-400 text-xs">BENEFICIARY</p>
                <p className="font-semibold">{company?.company_name || 'Dr Howo, Emens Group Limited'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">ACCOUNT NUMBER</p>
                <p className="font-semibold">{company?.bank_account_number || '0150943104200'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">BRANCH NAME</p>
                <p className="font-semibold">{company?.bank_branch || 'TABATA'}</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs">BANKERS & ADDRESS</p>
                <p className="font-semibold">
                  {company?.bank_name || 'CRDB'}, {company?.bank_address || 'DAR ES SALAAM'}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-700 text-center text-xs text-slate-400">
              <p>Thank you for your business! For inquiries, please contact us.</p>
            </div>
          </div>
        </Card>
      </div>

      <style jsx>{`
        @media print {
          body { 
            margin: 0; 
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          
          /* Hide all navigation and chrome elements */
          aside, nav, header, [role="navigation"], [role="banner"] { 
            display: none !important; 
          }
          
          /* Ensure content takes full width */
          main, .main-content {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Preserve colors in print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Ensure page breaks don't split items */
          .border.rounded-lg {
            page-break-inside: avoid;
          }
          
          /* Keep table formatting */
          table {
            width: 100%;
            border-collapse: collapse;
          }
          
          /* Ensure backgrounds print */
          .bg-slate-800,
          .bg-slate-50,
          .bg-blue-50,
          .bg-black {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        
        @page {
          margin: 0.5cm;
          size: A4;
        }
      `}</style>
    </div>
  );
}
