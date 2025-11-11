import React, { useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Share2, Printer, FileText } from "lucide-react";
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

  // Set document title for PDF filename
  useEffect(() => {
    if (invoice?.invoice_number) {
      document.title = invoice.invoice_number;
    }
    return () => {
      document.title = 'Dr Howo';
    };
  }, [invoice]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportToWord = () => {
    if (!invoice) return;

    // Create HTML content for Word document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #222222;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 20px;
            border-bottom: 3px solid #002b5c;
            padding-bottom: 20px;
          }
          .logo {
            width: 100px;
            height: 100px;
            border: 2px solid #002b5c;
          }
          .company-info {
            text-align: center;
            flex: 1;
            padding: 0 20px;
          }
          .company-name {
            font-size: 32px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
            color: #002b5c;
          }
          .company-subtitle {
            font-size: 18px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 5px 0;
            color: #222222;
          }
          .company-details {
            font-size: 11px;
            margin-top: 10px;
            color: #222222;
          }
          .qr-code {
            width: 80px;
            height: 80px;
          }
          .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #002b5c;
            margin: 20px 0;
          }
          .invoice-details {
            display: flex;
            justify-content: space-between;
            margin: 20px 0;
            position: relative;
          }
          .invoice-details > div {
            position: relative;
            z-index: 10;
          }
          .detail-section {
            font-size: 13px;
            color: #222222;
          }
          .detail-section p {
            margin: 5px 0;
          }
          .detail-label {
            font-weight: bold;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            border: 2px solid #002b5c;
            position: relative;
            z-index: 10;
          }
          th, td {
            border: 2px solid #002b5c;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f8f8f8;
            font-weight: bold;
            text-align: center;
            color: #222222;
          }
          .item-description {
            font-size: 11px;
            color: #222222;
            white-space: pre-wrap;
          }
          .item-name {
            font-weight: bold;
            font-size: 13px;
            color: #222222;
          }
          .total-row {
            background-color: #f8f8f8;
            font-weight: bold;
          }
          .total-amount {
            font-size: 18px;
            color: #002b5c;
          }
          .notes {
            background-color: #f8f8f8;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            position: relative;
            z-index: 10;
          }
          .notes h3 {
            font-size: 13px;
            font-weight: bold;
            margin: 0 0 10px 0;
            color: #222222;
          }
          .notes p {
            font-size: 11px;
            margin: 3px 0;
            color: #222222;
          }
          .footer {
            background-color: #002b5c;
            color: #ffffff;
            padding: 20px;
            margin-top: 30px;
          }
          .footer h3 {
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0 0 10px 0;
          }
          .footer-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            font-size: 11px;
          }
          .footer-label {
            color: #f8f8f8;
            font-size: 10px;
            margin-bottom: 3px;
          }
          .footer-value {
            font-weight: bold;
          }
          .footer-note {
            text-align: center;
            font-size: 10px;
            color: #f8f8f8;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255,255,255,0.2);
          }
          .watermark-section {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0.06;
            pointer-events: none;
            z-index: 0;
            transform: rotate(-30deg);
          }
          .watermark-section img {
            width: 320px;
            height: 320px;
            object-fit: contain;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            ${company?.logo_url ? `<img src="${company.logo_url}" alt="Logo" class="logo">` : '<div style="width: 100px; height: 100px; border: 2px solid #002b5c; text-align: center; line-height: 100px; font-weight: bold;">LOGO</div>'}
          </div>
          <div class="company-info">
            <h1 class="company-name">${company?.company_name?.split(',')[0] || 'DR HOWO'}</h1>
            <h2 class="company-subtitle">${company?.company_name?.split(',')[1]?.trim() || 'EMENS GROUP LIMITED'}</h2>
            <div class="company-details">
              ${company?.phone_numbers ? `Simu: ${company.phone_numbers}` : ''}
              ${company?.tin_number ? ` | TIN NO: ${company.tin_number}` : ''}
            </div>
            ${company?.physical_address ? `<div class="company-details">${company.physical_address}</div>` : ''}
          </div>
          <div>
            ${invoice.qr_code_data ? `<img src="${invoice.qr_code_data}" alt="QR Code" class="qr-code"><br><small>Scan to follow us</small>` : ''}
          </div>
        </div>

        <h2 class="invoice-title">PROFORMA INVOICE</h2>

        <div class="invoice-details">
          ${company?.watermark_url ? `
            <div class="watermark-section">
              <img src="${company.watermark_url}" alt="Watermark">
            </div>
          ` : ''}
          <div class="detail-section">
            <p><span class="detail-label">Invoice Number:</span> ${invoice.invoice_number}</p>
            <p><span class="detail-label">Date:</span> ${invoice.invoice_date ? format(new Date(invoice.invoice_date), "MMMM d, yyyy") : ''}</p>
            ${invoice.delivery_date ? `<p><span class="detail-label">Expected Delivery:</span> ${format(new Date(invoice.delivery_date), "MMMM d, yyyy")}</p>` : ''}
          </div>
          <div class="detail-section" style="text-align: right;">
            <p class="detail-label">Bill To:</p>
            <p style="font-weight: bold;">${invoice.customer_name}</p>
            ${invoice.customer_phone ? `<p>${invoice.customer_phone}</p>` : ''}
            ${invoice.customer_email ? `<p>${invoice.customer_email}</p>` : ''}
            ${invoice.address ? `<p>${invoice.address}</p>` : ''}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50px;">Item</th>
              <th>Description</th>
              <th style="width: 100px;">Quantity<br/>(Units)</th>
              <th style="width: 120px;">Unit Price</th>
              <th style="width: 120px;">Delivery Price</th>
              <th style="width: 120px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items?.map((item, idx) => `
              <tr>
                <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                <td>
                  <div class="item-name">${item.item}</div>
                  <div class="item-description">${item.description || ''}</div>
                </td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${currencySymbol}${item.price?.toLocaleString()}</td>
                <td style="text-align: right;">${currencySymbol}${(item.delivery_price || 0).toLocaleString()}</td>
                <td style="text-align: right; font-weight: bold;">${currencySymbol}${item.total?.toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="5" style="text-align: right; font-weight: bold;">TOTAL AMOUNT</td>
              <td style="text-align: right;" class="total-amount">${currencySymbol}${invoice.total_amount?.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>

        ${invoice.notes ? `
          <div class="notes">
            <h3>Notes</h3>
            ${invoice.notes.split('\n').map((line, idx) => `<p>${idx + 1}. ${line}</p>`).join('')}
          </div>
        ` : ''}

        <div class="footer">
          <h3>Bank Information</h3>
          <div class="footer-grid">
            <div>
              <div class="footer-label">BENEFICIARY</div>
              <div class="footer-value">EMENG GROUP LIMITED</div>
            </div>
            <div>
              <div class="footer-label">ACCOUNT NUMBER</div>
              <div class="footer-value">${company?.bank_account_number || '0150943104200'}</div>
            </div>
            <div>
              <div class="footer-label">BRANCH NAME</div>
              <div class="footer-value">${company?.bank_branch || 'TABATA'}</div>
            </div>
            <div>
              <div class="footer-label">BANKERS & ADDRESS</div>
              <div class="footer-value">${company?.bank_name || 'CRDB'}, ${company?.bank_address || 'DAR ES SALAAM'}</div>
            </div>
          </div>
          <div class="footer-note">
            Thank you for your business! For inquiries, please contact us.
          </div>
        </div>
      </body>
      </html>
    `;

    // Create blob and download
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DrHowo_${invoice.invoice_number}_${format(new Date(), 'yyyy-MM-dd')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <Button variant="outline" size="sm" onClick={handleExportToWord}>
              <FileText className="w-4 h-4 mr-2" />
              Export to Word
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print / Save PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="max-w-5xl mx-auto p-4 md:p-8 print:p-0" ref={printRef}>
        <Card className="bg-white shadow-lg print:shadow-none print:border-0 relative overflow-hidden" style={{fontFamily: "'Helvetica Neue', 'Roboto', sans-serif"}}>
          {/* Watermark - centered, rotated -30deg, 6% opacity */}
          {company?.watermark_url && (
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-0"
              style={{
                opacity: 0.06,
                transform: 'rotate(-30deg)',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}
            >
              <img
                src={company.watermark_url}
                alt="Watermark"
                className="max-w-md max-h-md object-contain"
                style={{
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact'
                }}
              />
            </div>
          )}

          {/* All content with relative positioning to appear above watermark */}
          <div className="relative z-10">
            {/* Header with Logo and Company Info */}
            <div className="p-6 pb-4 print:pt-8">
              <div className="flex justify-between items-start mb-4">
                {/* Logo */}
                <div className="flex-shrink-0">
                  {company?.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt="Company Logo"
                      className="w-24 h-24 object-contain border-2 p-1 bg-white"
                      style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', borderColor: '#002b5c'}}
                    />
                  ) : (
                    <div className="w-24 h-24 border-2 flex items-center justify-center bg-white" style={{borderColor: '#002b5c'}}>
                      <span className="text-lg font-bold" style={{color: '#002b5c'}}>LOGO</span>
                    </div>
                  )}
                </div>

                {/* Company Name */}
                <div className="flex-1 text-center px-4">
                  <h1 className="text-4xl font-black tracking-tight uppercase mb-1" style={{color: '#002b5c'}}>
                    {company?.company_name?.split(',')[0] || 'DR HOWO'}
                  </h1>
                  <h2 className="text-xl font-bold tracking-wide uppercase mb-3" style={{color: '#222222'}}>
                    {company?.company_name?.split(',')[1]?.trim() || 'EMENS GROUP LIMITED'}
                  </h2>
                  <div className="text-xs font-medium" style={{color: '#222222'}}>
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
                      <img 
                        src={invoice.qr_code_data} 
                        alt="QR Code" 
                        className="w-20 h-20 mb-1"
                        style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact'}}
                      />
                      <p className="text-xs" style={{color: '#222222'}}>Scan to follow us</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Physical Address */}
              {company?.physical_address && (
                <div className="text-xs text-center" style={{color: '#222222'}}>
                  <p>{company.physical_address}</p>
                </div>
              )}
            </div>

            {/* Blue Line Separator - 1mm */}
            <div 
              className="bg-primary" 
              style={{height: '1mm', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#002b5c'}}
            ></div>

            {/* Invoice Details */}
            <div className="p-6 space-y-4 relative">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <h2 className="text-2xl font-bold mb-3" style={{color: '#002b5c'}}>PROFORMA INVOICE</h2>
                  <div className="space-y-1 text-sm" style={{color: '#222222'}}>
                    <p><span className="font-semibold">Invoice Number:</span> {invoice.invoice_number}</p>
                    <p><span className="font-semibold">Date:</span> {invoice.invoice_date && format(new Date(invoice.invoice_date), "MMMM d, yyyy")}</p>
                    {invoice.delivery_date && (
                      <p><span className="font-semibold">Expected Delivery:</span> {format(new Date(invoice.delivery_date), "MMMM d, yyyy")}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <h3 className="font-semibold mb-2" style={{color: '#222222'}}>Bill To:</h3>
                  <div className="space-y-1 text-sm" style={{color: '#222222'}}>
                    <p className="font-semibold">{invoice.customer_name}</p>
                    {invoice.customer_phone && <p>{invoice.customer_phone}</p>}
                    {invoice.customer_email && <p>{invoice.customer_email}</p>}
                    {invoice.address && <p>{invoice.address}</p>}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-2 rounded-lg overflow-hidden relative z-10" style={{borderColor: '#002b5c'}}>
                <Table>
                  <TableHeader>
                    <TableRow 
                      style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#f8f8f8'}}
                    >
                      <TableHead className="font-bold w-16 border-r-2" style={{borderColor: '#002b5c', color: '#222222'}}>Item</TableHead>
                      <TableHead className="font-bold border-r-2" style={{borderColor: '#002b5c', color: '#222222'}}>Description</TableHead>
                      <TableHead className="font-bold text-center w-28 border-r-2" style={{borderColor: '#002b5c', color: '#222222'}}>Quantity<br/>(Units)</TableHead>
                      <TableHead className="font-bold text-right w-32 border-r-2" style={{borderColor: '#002b5c', color: '#222222'}}>Unit<br/>Price</TableHead>
                      <TableHead className="font-bold text-right w-32 border-r-2" style={{borderColor: '#002b5c', color: '#222222'}}>Delivery<br/>Price</TableHead>
                      <TableHead className="font-bold text-right w-32" style={{color: '#222222'}}>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoice.items?.map((item, idx) => (
                      <TableRow key={idx} style={{borderColor: '#002b5c'}}>
                        <TableCell className="font-bold text-center align-top pt-4 border-r-2" style={{borderColor: '#002b5c', color: '#222222'}}>
                          {idx + 1}
                        </TableCell>
                        <TableCell className="align-top py-3 border-r-2" style={{borderColor: '#002b5c'}}>
                          {item.images && item.images.length > 0 && (
                            <div className="mb-2 flex gap-2">
                              {item.images.map((img, imgIdx) => (
                                <img
                                  key={imgIdx}
                                  src={img}
                                  alt={`${item.item} - ${imgIdx + 1}`}
                                  className="w-24 h-24 object-cover rounded border"
                                  style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', borderColor: '#002b5c'}}
                                />
                              ))}
                            </div>
                          )}
                          <div className="font-bold text-sm mb-1" style={{color: '#222222'}}>{item.item}</div>
                          <div className="text-xs whitespace-pre-wrap leading-relaxed" style={{color: '#222222'}}>
                            {item.description}
                          </div>
                        </TableCell>
                        <TableCell className="text-center align-top pt-4 border-r-2" style={{borderColor: '#002b5c', color: '#222222'}}>{item.quantity}</TableCell>
                        <TableCell className="text-right align-top pt-4 border-r-2" style={{borderColor: '#002b5c', color: '#222222'}}>{currencySymbol}{item.price?.toLocaleString()}</TableCell>
                        <TableCell className="text-right align-top pt-4 border-r-2" style={{borderColor: '#002b5c', color: '#222222'}}>{currencySymbol}{(item.delivery_price || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold align-top pt-4" style={{color: '#222222'}}>{currencySymbol}{item.total?.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow 
                      className="font-bold border-t-2"
                      style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#f8f8f8', borderColor: '#002b5c'}}
                    >
                      <TableCell colSpan={5} className="text-right" style={{color: '#222222'}}>TOTAL AMOUNT</TableCell>
                      <TableCell className="text-right text-lg" style={{color: '#002b5c'}}>
                        {currencySymbol}{invoice.total_amount?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div 
                  className="p-3 rounded relative z-10"
                  style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#f8f8f8'}}
                >
                  <h3 className="font-semibold mb-1 text-sm" style={{color: '#222222'}}>Notes</h3>
                  <div className="text-xs whitespace-pre-wrap space-y-0.5" style={{color: '#222222'}}>
                    {invoice.notes.split('\n').map((line, idx) => (
                      <p key={idx}>{idx + 1}. {line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bank Information Footer */}
            <div 
              className="text-white p-4"
              style={{WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact', backgroundColor: '#002b5c', color: '#ffffff'}}
            >
              <h3 className="font-bold text-sm mb-2 uppercase">Bank Information</h3>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
                <div>
                  <p className="text-xs" style={{color: '#f8f8f8'}}>BENEFICIARY</p>
                  <p className="font-semibold">EMENG GROUP LIMITED</p>
                </div>
                <div>
                  <p className="text-xs" style={{color: '#f8f8f8'}}>ACCOUNT NUMBER</p>
                  <p className="font-semibold">{company?.bank_account_number || '0150943104200'}</p>
                </div>
                <div>
                  <p className="text-xs" style={{color: '#f8f8f8'}}>BRANCH NAME</p>
                  <p className="font-semibold">{company?.bank_branch || 'TABATA'}</p>
                </div>
                <div>
                  <p className="text-xs" style={{color: '#f8f8f8'}}>BANKERS & ADDRESS</p>
                  <p className="font-semibold">
                    {company?.bank_name || 'CRDB'}, {company?.bank_address || 'DAR ES SALAAM'}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-2 text-center text-xs" style={{borderTopColor: 'rgba(255,255,255,0.2)', borderTopWidth: '1px', borderTopStyle: 'solid', color: '#f8f8f8'}}>
                <p>Thank you for your business! For inquiries, please contact us.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <style>{`
        @media print {
          /* Force all elements to preserve colors and backgrounds */
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          /* Set professional font */
          body, * {
            font-family: 'Helvetica Neue', 'Roboto', Arial, sans-serif !important;
          }
          
          /* Reset body */
          body { 
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          
          /* Hide all navigation elements */
          .print\\:hidden,
          aside, 
          nav, 
          header:not(.invoice-header), 
          [role="navigation"], 
          [role="banner"],
          [data-sidebar],
          .sidebar {
            display: none !important; 
          }
          
          /* Full width for main content */
          main, .main-content {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          
          /* Page setup - 1.2cm margins */
          @page {
            margin: 1.2cm;
            size: A4 portrait;
          }
          
          /* Remove shadows and adjust spacing */
          .print\\:shadow-none,
          .shadow-lg,
          .shadow-md {
            box-shadow: none !important;
          }
          
          .print\\:border-0 {
            border: 0 !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:pt-8 {
            padding-top: 2rem !important;
          }
          
          /* Force specific colors to print - New Professional Theme */
          [style*="background-color: #002b5c"],
          [style*="backgroundColor: #002b5c"] {
            background-color: #002b5c !important;
          }
          
          [style*="background-color: #f8f8f8"],
          [style*="backgroundColor: #f8f8f8"] {
            background-color: #f8f8f8 !important;
          }
          
          [style*="color: #002b5c"] {
            color: #002b5c !important;
          }
          
          [style*="color: #222222"] {
            color: #222222 !important;
          }
          
          [style*="color: #ffffff"],
          [style*="color: #fff"] {
            color: #ffffff !important;
          }
          
          [style*="color: #f8f8f8"] {
            color: #f8f8f8 !important;
          }
          
          /* Force borders to print with new theme color */
          [style*="border-color: #002b5c"],
          [style*="borderColor: #002b5c"] {
            border-color: #002b5c !important;
          }
          
          .border,
          .border-2,
          .border-r-2,
          .border-t,
          .border-t-2 {
            border-style: solid !important;
          }
          
          /* Table styles */
          table {
            width: 100%;
            border-collapse: collapse;
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          thead {
            display: table-header-group;
          }
          
          tbody tr:nth-child(even) {
            background-color: transparent;
          }
          
          /* Ensure images print with high quality */
          img {
            max-width: 100%;
            page-break-inside: avoid;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
          
          /* Ensure watermark prints correctly with rotation */
          [style*="transform: rotate(-30deg)"] {
            transform: rotate(-30deg) !important;
            -webkit-transform: rotate(-30deg) !important;
          }
          
          /* Prevent page breaks in key sections */
          [style*="background-color: #002b5c"] {
            page-break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
}