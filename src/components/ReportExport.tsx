/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BorrowRecord, Fine, Book } from '../types.js';
import { Download, Printer, FileText, CheckCircle } from 'lucide-react';

interface ReportExportProps {
  borrows?: BorrowRecord[];
  fines?: Fine[];
  books?: Book[];
}

export default function ReportExport({ borrows = [], fines = [], books = [] }: ReportExportProps) {
  const [showReceipt, setShowReceipt] = useState<BorrowRecord | null>(null);

  // Helper: Trigger browser CSV File Download
  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Export Loans Catalog to CSV
  const handleExportLoans = () => {
    let csv = 'Loan ID,User Name,User Email,Book Title,Book Author,Borrow Date,Due Date,Return Date,Status,Renewals,Fine Overdue ($)\n';
    borrows.forEach(b => {
      csv += `"${b.id}","${b.userName}","${b.userEmail}","${b.bookTitle}","${b.bookAuthor}","${b.borrowDate}","${b.dueDate}","${b.returnDate || 'N/A'}","${b.status}","${b.renewalsCount}","${b.fineAmount.toFixed(2)}"\n`;
    });
    downloadCSV(csv, `library-borrow-records-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 2. Export Fines Ledger to CSV
  const handleExportFines = () => {
    let csv = 'Fine ID,User Name,User Email,Book Title,Fine Amount ($),Paid Amount ($),Waived Amount ($),Settled Date,Status\n';
    fines.forEach(f => {
      csv += `"${f.id}","${f.userName}","${f.userEmail}","${f.bookTitle}","${f.fineAmount.toFixed(2)}","${f.paidAmount.toFixed(2)}","${f.waivedAmount.toFixed(2)}","${f.paymentDate || 'N/A'}","${f.status}"\n`;
    });
    downloadCSV(csv, `library-fines-ledger-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 3. Export Inventory Audit to CSV
  const handleExportInventory = () => {
    let csv = 'Book ID,ISBN,Title,Author,Publisher,Category,Year,Shelf,Quantity,Available,Status\n';
    books.forEach(b => {
      csv += `"${b.id}","${b.isbn}","${b.title}","${b.authorName}","${b.publisherName}","${b.categoryName}","${b.publicationYear}","${b.shelfNumber || 'N/A'}","${b.quantity}","${b.availableQuantity}","${b.status}"\n`;
    });
    downloadCSV(csv, `library-inventory-audit-${new Date().toISOString().split('T')[0]}.csv`);
  };

  // 4. Print beautiful, standalone PDF Receipt Layout
  const handlePrintReceipt = (record: BorrowRecord) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Loan Receipt - Aegis Library</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; color: #1e293b; padding: 30px; max-width: 400px; margin: 0 auto; border: 1px dashed #cbd5e1; }
            h2 { text-align: center; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 1px; }
            p { font-size: 13px; line-height: 1.6; margin: 6px 0; }
            .divider { border-top: 1px dashed #64748b; margin: 15px 0; }
            .total { font-weight: bold; font-size: 14px; text-align: right; }
            .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 30px; }
            .barcode { text-align: center; margin-top: 20px; font-size: 28px; letter-spacing: 4px; }
          </style>
        </head>
        <body>
          <h2>AEGIS LIBRARY</h2>
          <p style="text-align: center; font-size: 11px;">University Campus Square, Block 12</p>
          <div class="divider"></div>
          <p><strong>Receipt ID:</strong> REC-BOR-${record.id}-${new Date().getFullYear()}</p>
          <p><strong>Member Name:</strong> ${record.userName}</p>
          <p><strong>Member Email:</strong> ${record.userEmail}</p>
          <p><strong>Date Issued:</strong> ${record.borrowDate}</p>
          <p><strong>Due Date:</strong> ${record.dueDate}</p>
          <div class="divider"></div>
          <p><strong>ITEM BORROWED:</strong></p>
          <p style="margin-left: 15px;"><strong>Title:</strong> ${record.bookTitle}</p>
          <p style="margin-left: 15px;"><strong>Author:</strong> ${record.bookAuthor}</p>
          <p style="margin-left: 15px;"><strong>Loan Term:</strong> 14 Days</p>
          <div class="divider"></div>
          <p><strong>Overdue Rate:</strong> $1.00 / day exceeded</p>
          <p><strong>Max Renewals:</strong> 3 extensions allowed</p>
          <div class="divider"></div>
          <p class="total">STATUS: ACTIVE LOAN</p>
          <div class="barcode">||||| | |||| ||| ||||</div>
          <p style="text-align: center; font-size: 10px; margin-top: 5px; font-mono">CODE: ${record.id}009841</p>
          <div class="footer">
            Thank you for using Aegis Library Services!<br>
            Please handle books with care.
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div>
        <h4 className="font-bold text-slate-800 text-sm">Reports & Data Exports</h4>
        <p className="text-slate-400 text-xs mt-0.5">Download or print full library ledger logs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Export Borrows Button */}
        <button 
          onClick={handleExportLoans}
          className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors text-slate-700 cursor-pointer text-left"
          id="export-loans-csv-btn"
        >
          <div className="space-y-0.5">
            <span className="block font-bold text-xs text-slate-800">Loans Ledger</span>
            <span className="block text-[10px] text-slate-400">CSV Spreadsheet</span>
          </div>
          <Download className="h-4 w-4 text-slate-400" />
        </button>

        {/* Export Fines Button */}
        <button 
          onClick={handleExportFines}
          className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors text-slate-700 cursor-pointer text-left"
          id="export-fines-csv-btn"
        >
          <div className="space-y-0.5">
            <span className="block font-bold text-xs text-slate-800">Fines Ledger</span>
            <span className="block text-[10px] text-slate-400">CSV Spreadsheet</span>
          </div>
          <Download className="h-4 w-4 text-slate-400" />
        </button>

        {/* Export Catalog Inventory Button */}
        <button 
          onClick={handleExportInventory}
          className="flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors text-slate-700 cursor-pointer text-left"
          id="export-inventory-csv-btn"
        >
          <div className="space-y-0.5">
            <span className="block font-bold text-xs text-slate-800">Inventory Audit</span>
            <span className="block text-[10px] text-slate-400">CSV Spreadsheet</span>
          </div>
          <Download className="h-4 w-4 text-slate-400" />
        </button>
      </div>

      {/* Render Direct Print Dialog Trigger List for recent borrows */}
      {borrows.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Quick Print Recent Loan Receipts</p>
          <div className="max-h-40 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl">
            {borrows.slice(0, 4).map(b => (
              <div key={b.id} className="p-2.5 flex justify-between items-center bg-slate-50/20 hover:bg-slate-50 text-xs">
                <div className="truncate">
                  <p className="font-semibold text-slate-800 truncate">{b.bookTitle}</p>
                  <p className="text-slate-400 text-[10px] truncate">{b.userName} • Issued {b.borrowDate}</p>
                </div>
                <button
                  onClick={() => handlePrintReceipt(b)}
                  className="p-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 rounded-lg shadow-sm hover:text-blue-600 transition-all cursor-pointer flex items-center space-x-1 font-semibold text-[10px]"
                  title="Print Loan Ticket"
                  id={`print-loan-receipt-${b.id}`}
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">Print Receipt</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
