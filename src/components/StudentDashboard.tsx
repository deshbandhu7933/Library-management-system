/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BorrowRecord, Reservation, Fine, Book, User 
} from '../types.js';
import { 
  Clock, ShieldAlert, Heart, Calendar, CreditCard, 
  Lock, Eye, Printer, BookmarkCheck, UserCheck, Sparkles, AlertCircle, Download
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  borrows: BorrowRecord[];
  reservations: Reservation[];
  fines: Fine[];
  books: Book[];
  wishlistIds: number[];
  onRenewLoan: (borrowId: number) => Promise<void>;
  onCancelReservation: (resId: number) => Promise<void>;
  onPayFine: (fineId: number) => Promise<void>;
  onToggleWishlist: (bookId: number) => void;
  onUpdateProfile: (data: any) => Promise<void>;
  toast: (msg: string, type?: 'success' | 'error') => void;
}

export default function StudentDashboard({
  user, borrows, reservations, fines, books, wishlistIds,
  onRenewLoan, onCancelReservation, onPayFine, onToggleWishlist, onUpdateProfile, toast
}: StudentDashboardProps) {
  
  const [activeTab, setActiveTab] = useState<'loans' | 'reservations' | 'fines' | 'wishlist' | 'settings' | 'books'>('loans');
  
  // Profile edit states
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [phone, setPhone] = useState(user.phone || '');
  const [newPassword, setNewPassword] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Enrollment edit states
  const [studentId, setStudentId] = useState(user.studentId || '');
  const [major, setMajor] = useState(user.major || '');
  const [gradeLevel, setGradeLevel] = useState(user.gradeLevel || '');

  const [teacherId, setTeacherId] = useState(user.teacherId || '');
  const [department, setDepartment] = useState(user.department || '');
  const [officeNumber, setOfficeNumber] = useState(user.officeNumber || '');
  const [designation, setDesignation] = useState(user.designation || '');

  // Billing credit card mock modal state
  const [payingFine, setPayingFine] = useState<Fine | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Student borrowing history search, filter, and sorting states
  const [loansSearch, setLoansSearch] = useState('');
  const [loansFilter, setLoansFilter] = useState<'all' | 'borrowed' | 'returned' | 'overdue'>('all');
  const [loansSort, setLoansSort] = useState<'newest' | 'oldest' | 'borrowDate' | 'dueDate' | 'bookTitle'>('newest');

  // 1. Calculate stats metrics
  const activeLoans = borrows.filter(b => b.status !== 'returned');
  const outstandingFines = fines.filter(f => f.status === 'unpaid');
  const totalFineOwed = outstandingFines.reduce((sum, f) => sum + f.fineAmount, 0);

  const handleRenew = async (borrowId: number) => {
    try {
      await onRenewLoan(borrowId);
      toast('Loan term successfully extended for +14 Days!', 'success');
    } catch (err: any) {
      toast(err.message || 'Error renewing loan term.', 'error');
    }
  };

  const handleCancelRes = async (resId: number) => {
    if (confirm('Cancel this book reservation?')) {
      try {
        await onCancelReservation(resId);
        toast('Reservation cancelled successfully.', 'success');
      } catch (err: any) {
        toast(err.message || 'Error cancelling reservation.', 'error');
      }
    }
  };

  const handleOpenPay = (fine: Fine) => {
    setPayingFine(fine);
    setCardNumber('');
    setCardExpiry('');
    setCardCVV('');
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFine) return;
    if (!cardNumber || !cardExpiry || !cardCVV) {
      toast('Please enter complete credit card billing details.', 'error');
      return;
    }

    setPaymentLoading(true);
    try {
      await onPayFine(payingFine.id);
      toast(`Payment of $${payingFine.fineAmount.toFixed(2)} settled successfully!`, 'success');
      setPayingFine(null);
    } catch (err: any) {
      toast(err.message || 'Error executing payment transaction.', 'error');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await onUpdateProfile({
        firstName,
        lastName,
        phone,
        password: newPassword || undefined,
        ...(user.role === 'teacher' 
          ? { teacherId, department, officeNumber, designation }
          : { studentId, major, gradeLevel }
        )
      });
      toast('Account profile metrics updated successfully!', 'success');
      setNewPassword('');
    } catch (err: any) {
      toast(err.message || 'Error updating profile.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleDownloadReceipt = (record: BorrowRecord) => {
    const receiptContent = `
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
        </body>
      </html>
    `;

    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Receipt-REC-BOR-${record.id}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Welcomer Metrics bar */}
      <div className="bg-slate-950 text-white rounded-2xl p-6 relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-2xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg sm:text-xl tracking-tight">
              {user.role === 'teacher' ? 'Faculty Workspace' : 'Student Workspace'}
            </h3>
            <p className="text-slate-400 text-xs font-semibold flex flex-wrap items-center gap-2">
              <span>Logged in as {user.firstName} {user.lastName} • {user.email}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                user.role === 'teacher' ? 'bg-amber-500/25 text-amber-300 border border-amber-500/30' : 'bg-blue-500/25 text-blue-300 border border-blue-500/30'
              } uppercase`}>
                {user.role === 'teacher' ? 'Faculty / Teacher' : 'Student'}
              </span>
            </p>

            {/* Custom enrollment fields row */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {user.role === 'teacher' ? (
                <>
                  {user.teacherId && (
                    <span className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-300">
                      <strong>Teacher ID:</strong> {user.teacherId}
                    </span>
                  )}
                  {user.department && (
                    <span className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-300">
                      <strong>Department:</strong> {user.department}
                    </span>
                  )}
                  {user.designation && (
                    <span className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-300">
                      <strong>Title:</strong> {user.designation}
                    </span>
                  )}
                  {user.officeNumber && (
                    <span className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-300">
                      <strong>Office:</strong> {user.officeNumber}
                    </span>
                  )}
                </>
              ) : (
                <>
                  {user.studentId && (
                    <span className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-300">
                      <strong>Student ID:</strong> {user.studentId}
                    </span>
                  )}
                  {user.major && (
                    <span className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-300">
                      <strong>Major:</strong> {user.major}
                    </span>
                  )}
                  {user.gradeLevel && (
                    <span className="px-2.5 py-1 bg-white/5 rounded-lg border border-white/10 text-slate-300">
                      <strong>Grade:</strong> {user.gradeLevel}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="px-4.5 py-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Loans</span>
              <span className="block text-lg font-extrabold text-blue-400 mt-0.5">{activeLoans.length} Items</span>
            </div>
            <div className="px-4.5 py-3 bg-white/5 border border-white/10 rounded-xl text-center">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fine Owed</span>
              <span className="block text-lg font-extrabold text-amber-500 mt-0.5">${totalFineOwed.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1.5 AI-Powered Recommended for You Section */}
      <div className="hidden bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-500/20 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-indigo-500/15 pb-5">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-indigo-500/15 text-indigo-300 rounded-2xl border border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-500/5">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  
                  <span className="bg-indigo-500/25 text-indigo-300 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-indigo-500/30 uppercase tracking-wider">
                    Gemini AI
                  </span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Smart reading recommendations tailored to your past borrows and active wishlist interests.
                </p>
              </div>
            </div>
          </div>

          {/* Core Content */}
          <div className="p-8 text-center bg-white/5 rounded-2xl border border-dashed border-white/10 text-slate-400 text-xs">
            Personalized AI recommendations are currently unavailable.
          </div>
        </div>
      </div>

      {/* 2. Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase px-3.5 pb-2 border-b border-slate-100">STUDENT SECTIONS</p>
          
          <button 
            onClick={() => setActiveTab('loans')}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'loans' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Active Borrowings</span>
            {activeLoans.length > 0 && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-md font-extrabold">{activeLoans.length}</span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('reservations')}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'reservations' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Queue Reservations</span>
            {reservations.length > 0 && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded-md font-extrabold">{reservations.length}</span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('fines')}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'fines' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Fine Invoices</span>
            {totalFineOwed > 0 && (
              <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] rounded-md font-extrabold border border-rose-200">${totalFineOwed}</span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('wishlist')}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'wishlist' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Saved Wishlist</span>
            {wishlistIds.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] rounded-md font-extrabold border border-amber-200">{wishlistIds.length}</span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('books')}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'books' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Books Gallery</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Account Parameters</span>
          </button>
        </div>

        {/* Content Workspace Panel */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          {/* Active Loans & History */}
          {activeTab === 'loans' && (() => {
            const filteredAndSortedLoans = borrows
              .filter(b => {
                // Search match
                const query = loansSearch.toLowerCase().trim();
                if (query) {
                  const idMatch = b.id.toString().includes(query);
                  const titleMatch = b.bookTitle.toLowerCase().includes(query);
                  const authorMatch = b.bookAuthor.toLowerCase().includes(query);
                  if (!idMatch && !titleMatch && !authorMatch) return false;
                }

                // Filter match
                if (loansFilter === 'borrowed') {
                  return b.status === 'borrowed' || b.status === 'renewed' || b.status === 'overdue';
                }
                if (loansFilter === 'returned') {
                  return b.status === 'returned';
                }
                if (loansFilter === 'overdue') {
                  return b.status === 'overdue';
                }
                return true;
              })
              .sort((a, b) => {
                if (loansSort === 'oldest') {
                  return a.id - b.id;
                }
                if (loansSort === 'borrowDate') {
                  return new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime();
                }
                if (loansSort === 'dueDate') {
                  return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
                }
                if (loansSort === 'bookTitle') {
                  return a.bookTitle.localeCompare(b.bookTitle);
                }
                return b.id - a.id;
              });

            return (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">My Borrowing History</h4>
                    <span className="text-[11px] text-slate-400 font-medium font-bold">Comprehensive list of checked-out and returned books</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">Standard 14-day checkout terms apply</span>
                </div>

                {/* Search, Filter, & Sort Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Search Books</label>
                    <input 
                      type="text" 
                      value={loansSearch}
                      onChange={e => setLoansSearch(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      placeholder="Search title, author or ID..."
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Filter Status</label>
                    <select
                      value={loansFilter}
                      onChange={e => setLoansFilter(e.target.value as any)}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    >
                      <option value="all">All Books</option>
                      <option value="borrowed">Currently Borrowed</option>
                      <option value="returned">Returned Books</option>
                      <option value="overdue">Overdue Books</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Sort Records</label>
                    <select
                      value={loansSort}
                      onChange={e => setLoansSort(e.target.value as any)}
                      className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="borrowDate">Borrow Date</option>
                      <option value="dueDate">Due Date</option>
                      <option value="bookTitle">Book Title</option>
                    </select>
                  </div>
                </div>

                {/* Borrow history table */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                        <th className="p-3.5">Borrow ID</th>
                        <th className="p-3.5">Book Title</th>
                        <th className="p-3.5">Borrow Date</th>
                        <th className="p-3.5">Due Date</th>
                        <th className="p-3.5">Return Date</th>
                        <th className="p-3.5">Fine Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredAndSortedLoans.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                            No borrowing records found.
                          </td>
                        </tr>
                      ) : (
                        filteredAndSortedLoans.map(loan => {
                          return (
                            <tr key={loan.id} className="hover:bg-slate-50/50">
                              <td className="p-3.5 font-mono text-[10px] text-slate-500 font-bold">#{loan.id}</td>
                              <td className="p-3.5">
                                <h5 className="font-bold text-slate-800">{loan.bookTitle}</h5>
                                <p className="text-slate-400 text-[10px]">By {loan.bookAuthor}</p>
                              </td>
                              <td className="p-3.5 text-slate-600 font-medium">{loan.borrowDate}</td>
                              <td className="p-3.5 text-slate-600 font-medium">{loan.dueDate}</td>
                              <td className="p-3.5 text-slate-500 font-medium">{loan.returnDate || '-'}</td>
                              <td className={`p-3.5 font-black ${loan.fineAmount > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                                Rs. {loan.fineAmount}
                              </td>
                              <td className="p-3.5">
                                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                  loan.status === 'returned' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                  loan.status === 'overdue' ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' :
                                  loan.status === 'renewed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                  'bg-slate-50 text-slate-700 border-slate-100'
                                }`}>
                                  {loan.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex justify-end items-center gap-2">
                                  {loan.status !== 'returned' && (
                                    <button
                                      onClick={() => handleRenew(loan.id)}
                                      disabled={loan.renewalsCount >= 3}
                                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white font-bold text-[10px] rounded-lg transition-all cursor-pointer"
                                      title="Extend Term (+14 Days)"
                                    >
                                      Renew ({loan.renewalsCount}/3)
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDownloadReceipt(loan)}
                                    className="p-1.5 border border-slate-200 hover:border-slate-300 rounded-lg hover:text-blue-600 transition-all cursor-pointer"
                                    title="Download Receipt"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}

          {/* Queue Reservations */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm">Reservations Queue</h4>
                <span className="text-[11px] text-slate-400 font-medium">Automatic placement upon returned stock</span>
              </div>

              {reservations.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  You do not have any books currently reserved.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {reservations.map(res => (
                    <div key={res.id} className="py-4 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{res.bookTitle}</h5>
                        <p className="text-slate-400 text-xs mt-0.5">Queued: {new Date(res.reservationDate).toLocaleDateString()}</p>
                        <span className="inline-block mt-1.5 px-2.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg border border-blue-100">
                          Queue Position: #{res.queuePosition}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCancelRes(res.id)}
                        className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fines Statement */}
          {activeTab === 'fines' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm">Fine Overdue Statements</h4>
                <span className="text-[11px] text-slate-400 font-medium">$1.00 fine/day accrued exceeded term</span>
              </div>

              {fines.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Zero fine records on file! Thank you for return punctuality.
                </div>
              ) : (
                <div className="space-y-3">
                  {fines.map(fine => (
                    <div key={fine.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-slate-800 text-xs sm:text-sm">{fine.bookTitle}</p>
                        <p className="text-slate-400 text-xs mt-0.5">Fine Amount: <strong className="text-slate-700">${fine.fineAmount.toFixed(2)}</strong></p>
                        <span className={`inline-block mt-1.5 px-2.5 py-0.5 text-[9px] font-bold uppercase rounded-lg ${
                          fine.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {fine.status}
                        </span>
                      </div>

                      {fine.status === 'unpaid' && (
                        <button
                          onClick={() => handleOpenPay(fine)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/10 transition-colors flex items-center space-x-1.5 cursor-pointer"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Pay fine (${fine.fineAmount.toFixed(2)})</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Saved Wishlist */}
          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm">Saved Wishlist</h4>
                <p className="text-slate-400 text-xs">Hearted items for rapid procurement</p>
              </div>

              {wishlistIds.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                  Your wishlist is empty. Add items from the catalog.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {books.filter(b => wishlistIds.includes(b.id)).map(b => (
                    <div key={b.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                      <div>
                        <h5 className="font-bold text-slate-800 text-xs sm:text-sm">{b.title}</h5>
                        <p className="text-slate-400 text-xs">By {b.authorName} • {b.categoryName}</p>
                      </div>

                      <button
                        onClick={() => onToggleWishlist(b.id)}
                        className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                        title="Remove Wishlist"
                      >
                        <Heart className="h-4 w-4 fill-rose-600" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Books Gallery */}
          {activeTab === 'books' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm">Available Books Gallery</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {books.map(book => (
                  <div key={book.id} className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
                    <h5 className="font-bold text-slate-800 text-sm">{book.title}</h5>
                    <p className="text-slate-400 text-xs">By {book.authorName}</p>
                    <button
                      onClick={() => onToggleWishlist(book.id)}
                      className="px-3.5 py-2 border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      {wishlistIds.includes(book.id) ? 'In Wishlist' : 'Add to Wishlist'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Account settings */}
          {activeTab === 'settings' && (
            <form onSubmit={handleProfileSubmit} className="space-y-4.5">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-1">
                <UserCheck className="h-4.5 w-4.5 text-blue-600" />
                <h4 className="font-bold text-slate-800 text-sm">Modify Security Parameters</h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">First Name</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 outline-none bg-slate-50/50"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={e => setLastName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 outline-none bg-slate-50/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Contact Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 outline-none bg-slate-50/50"
                  placeholder="+1 (555) 0122"
                />
              </div>

              {/* Conditional Role-Specific Fields */}
              {user.role === 'teacher' ? (
                <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-100/60 space-y-3.5">
                  <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Faculty Credentials</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Teacher ID *</label>
                      <input 
                        type="text" 
                        value={teacherId} 
                        onChange={e => setTeacherId(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none bg-white focus:border-amber-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Academic Title</label>
                      <input 
                        type="text" 
                        value={designation} 
                        onChange={e => setDesignation(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none bg-white focus:border-amber-500"
                        placeholder="Assistant Professor"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Department</label>
                      <input 
                        type="text" 
                        value={department} 
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none bg-white focus:border-amber-500"
                        placeholder="Engineering"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Office Location</label>
                      <input 
                        type="text" 
                        value={officeNumber} 
                        onChange={e => setOfficeNumber(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none bg-white focus:border-amber-500"
                        placeholder="Tech Annex, Room 404"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-blue-50/40 rounded-2xl border border-blue-100/60 space-y-3.5">
                  <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Student Academic Details</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Student ID / Matric *</label>
                      <input 
                        type="text" 
                        value={studentId} 
                        onChange={e => setStudentId(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none bg-white focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Major / Subject</label>
                      <input 
                        type="text" 
                        value={major} 
                        onChange={e => setMajor(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none bg-white focus:border-blue-500"
                        placeholder="Computer Science"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Grade Level / Term</label>
                    <select
                      value={gradeLevel}
                      onChange={e => setGradeLevel(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none bg-white focus:border-blue-500"
                    >
                      <option value="">Select level...</option>
                      <option value="Freshman">Freshman (Yr 1)</option>
                      <option value="Sophomore">Sophomore (Yr 2)</option>
                      <option value="Junior">Junior (Yr 3)</option>
                      <option value="Senior">Senior (Yr 4)</option>
                      <option value="Graduate">Graduate (MSc/PhD)</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Update Secure Password (Optional)</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 outline-none bg-slate-50/50"
                  placeholder="Type new secure passphrase..."
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 cursor-pointer"
                id="update-student-profile-btn"
              >
                {profileLoading ? 'Synchronizing fields...' : 'Save Profile Details'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* pay fine billing modal */}
      {payingFine && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-950 text-white flex justify-between items-center">
              <h3 className="font-bold text-xs tracking-tight uppercase">Pay Fine Statement</h3>
              <button onClick={() => setPayingFine(null)} className="text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-bold">X</button>
            </div>

            <form onSubmit={handleProcessPayment} className="p-5 space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                <p className="text-slate-400 font-semibold uppercase text-[9px]">Bill Owed</p>
                <p className="text-slate-800 font-bold text-sm mt-0.5">${payingFine.fineAmount.toFixed(2)}</p>
                <p className="text-slate-500 text-[10px] mt-1 italic">Title: "{payingFine.bookTitle}"</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Card Number</label>
                <input 
                  type="text"
                  maxLength={16}
                  value={cardNumber}
                  onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono outline-none focus:border-blue-500"
                  placeholder="4000 1234 5678 9010"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Expiry (MM/YY)</label>
                  <input 
                    type="text"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={e => setCardExpiry(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-blue-500"
                    placeholder="12/28"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">CVV Code</label>
                  <input 
                    type="password"
                    maxLength={3}
                    value={cardCVV}
                    onChange={e => setCardCVV(e.target.value.replace(/\D/g, ''))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-blue-500"
                    placeholder="123"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={paymentLoading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-colors cursor-pointer"
              >
                {paymentLoading ? 'Authorizing direct billing...' : `Authorize payment ($${payingFine.fineAmount.toFixed(2)})`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
