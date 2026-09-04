/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Book, Author, Category, Publisher, User, BorrowRecord, 
  Reservation, Fine, ContactMessage, AuditLog, UserRole 
} from '../types.js';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Users, BookOpen, Clock, ShieldCheck, Heart, AlertCircle, 
  Trash2, Edit, Check, ShieldAlert, Sparkles, Plus, Search, 
  DollarSign, Mail, ListCollapse, MessageSquare, Printer, Download 
} from 'lucide-react';
import ReportExport from './ReportExport.tsx';

interface AdminDashboardProps {
  books: Book[];
  authors: Author[];
  categories: Category[];
  publishers: Publisher[];
  members: User[];
  borrows: BorrowRecord[];
  reservations: Reservation[];
  fines: Fine[];
  messages: ContactMessage[];
  logs: AuditLog[];
  
  onSaveBook: (book: Book | null) => void;
  onDeleteBook: (bookId: number) => void;
  onSaveAuthor: (author: Author | null) => void;
  onDeleteAuthor: (authorId: number) => void;
  onSaveCategory: (category: Category | null) => void;
  onDeleteCategory: (catId: number) => void;
  
  onToggleUserStatus: (userId: number) => Promise<void>;
  onDeleteUser: (userId: number) => Promise<void>;
  
  onIssueBook: (email: string, bookId: number) => Promise<void>;
  onReturnBook: (borrowId: number) => Promise<void>;
  onRenewLoan: (borrowId: number) => Promise<void>;
  onCancelReservation: (resId: number) => Promise<void>;
  onWaiveFine: (fineId: number) => Promise<void>;
  onCollectFine: (fineId: number) => Promise<void>;
  
  toast: (msg: string, type?: 'success' | 'error') => void;
}

export default function AdminDashboard({
  books, authors, categories, publishers, members, borrows, reservations, fines, messages, logs,
  onSaveBook, onDeleteBook, onSaveAuthor, onDeleteAuthor, onSaveCategory, onDeleteCategory,
  onToggleUserStatus, onDeleteUser, onIssueBook, onReturnBook, onRenewLoan, onCancelReservation, onWaiveFine, onCollectFine, toast
}: AdminDashboardProps) {

  const [activeTab, setActiveTab] = useState<'analytics' | 'books' | 'descriptors' | 'members' | 'loans' | 'reservations' | 'fines' | 'messages' | 'logs'>('analytics');
  
  // Search state inside tables
  const [searchQuery, setSearchQuery] = useState('');

  // Borrowed books search, filter, and sort states
  const [loansSearch, setLoansSearch] = useState('');
  const [loansFilter, setLoansFilter] = useState<'all' | 'borrowed' | 'returned' | 'overdue' | 'due_today' | 'no_fine' | 'fine_pending'>('all');
  const [loansSort, setLoansSort] = useState<'borrowDate' | 'dueDate' | 'fineAmount' | 'userName' | 'bookTitle' | 'newest' | 'oldest'>('newest');

  // direct book issuance form
  const [issueEmail, setIssueEmail] = useState('');
  const [issueBookId, setIssueBookId] = useState('');
  const [issueLoading, setIssueLoading] = useState(false);

  // CRUD triggers passed upwards
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);

  // Fine statistics
  const paidFines = fines.filter(f => f.status === 'paid');
  const totalRevenue = paidFines.reduce((sum, f) => sum + f.fineAmount, 0);
  const outstandingFines = fines.filter(f => f.status === 'unpaid');
  const outstandingRevenue = outstandingFines.reduce((sum, f) => sum + f.fineAmount, 0);

  // 1. Prepare Chart Data
  // Bar Chart: Monthly Loans
  const monthlyData = [
    { name: 'Jan', Loans: 240 },
    { name: 'Feb', Loans: 310 },
    { name: 'Mar', Loans: 430 },
    { name: 'Apr', Loans: 520 },
    { name: 'May', Loans: 490 },
    { name: 'Jun', Loans: 610 }
  ];

  // Pie Chart: Category Popularity
  const categoryChartData = categories.slice(0, 5).map((cat, idx) => ({
    name: cat.name,
    value: cat.bookCount || (books.filter(b => b.categoryId === cat.id).length) || (idx + 1) * 3
  }));

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueEmail || !issueBookId) {
      toast('Please enter a student email and select a book first.', 'error');
      return;
    }
    setIssueLoading(true);
    try {
      await onIssueBook(issueEmail, Number(issueBookId));
      toast('Book successfully checked out and issued to student!', 'success');
      setIssueEmail('');
      setIssueBookId('');
    } catch (err: any) {
      toast(err.message || 'Error issuing book loan.', 'error');
    } finally {
      setIssueLoading(false);
    }
  };

  const handleReturn = async (borrowId: number) => {
    try {
      await onReturnBook(borrowId);
      toast('Book checked in and returned to shelf stock.', 'success');
    } catch (err: any) {
      toast(err.message || 'Error returning book.', 'error');
    }
  };

  const handleRenew = async (borrowId: number) => {
    try {
      await onRenewLoan(borrowId);
      toast('Loan term extended successfully!', 'success');
    } catch (err: any) {
      toast(err.message || 'Error renewing loan.', 'error');
    }
  };

  const handleToggleBlock = async (userId: number) => {
    try {
      await onToggleUserStatus(userId);
      toast('User membership state updated!', 'success');
    } catch (err: any) {
      toast(err.message || 'Error modifying status.', 'error');
    }
  };

  const handleDeleteUserClick = async (userId: number) => {
    if (confirm('Permanently delete this user membership record?')) {
      try {
        await onDeleteUser(userId);
        toast('User record deleted successfully.', 'success');
      } catch (err: any) {
        toast(err.message || 'Error deleting user.', 'error');
      }
    }
  };

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
    toast('Borrowing records exported successfully!', 'success');
  };

  // 2. Export Fines Ledger to CSV
  const handleExportFines = () => {
    let csv = 'Fine ID,User Name,User Email,Book Title,Fine Amount ($),Paid Amount ($),Waived Amount ($),Settled Date,Status\n';
    fines.forEach(f => {
      csv += `"${f.id}","${f.userName}","${f.userEmail}","${f.bookTitle}","${f.fineAmount.toFixed(2)}","${f.paidAmount.toFixed(2)}","${f.waivedAmount.toFixed(2)}","${f.paymentDate || 'N/A'}","${f.status}"\n`;
    });
    downloadCSV(csv, `library-fines-ledger-${new Date().toISOString().split('T')[0]}.csv`);
    toast('Fine summaries exported successfully!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Statistics Cards summary panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><BookOpen className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Total Catalog Books</p>
            <p className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">{books.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Registered Members</p>
            <p className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">{members.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Active Outstanding Loans</p>
            <p className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">{borrows.filter(b => b.status !== 'returned').length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><DollarSign className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Fine Revenue Settled</p>
            <p className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 2. Primary Navigation Workstation Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
        {/* Librarian Administrative Navigation Sidebar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase px-3.5 pb-2 border-b border-slate-100">LIBRARIAN TASKS</p>
          
          <button 
            onClick={() => { setActiveTab('analytics'); setSearchQuery(''); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'analytics' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Overview Analytics</span>
          </button>

          <button 
            onClick={() => { setActiveTab('books'); setSearchQuery(''); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'books' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
            id="admin-books-tab-btn"
          >
            <span>Catalog Items CRUD</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded-md font-extrabold">{books.length}</span>
          </button>

          <button 
            onClick={() => { setActiveTab('descriptors'); setSearchQuery(''); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'descriptors' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Authors & Categories</span>
          </button>

          <button 
            onClick={() => { setActiveTab('members'); setSearchQuery(''); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'members' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Members Directory</span>
          </button>

          <button 
            onClick={() => { setActiveTab('loans'); setSearchQuery(''); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'loans' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Issuance Ledger</span>
          </button>

          <button 
            onClick={() => { setActiveTab('reservations'); setSearchQuery(''); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'reservations' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Reservations Queue</span>
          </button>

          <button 
            onClick={() => { setActiveTab('fines'); setSearchQuery(''); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'fines' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Fines Workshop</span>
          </button>

          <button 
            onClick={() => { setActiveTab('messages'); setSearchQuery(''); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center justify-between transition-colors cursor-pointer ${
              activeTab === 'messages' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>Inbox Inquiries</span>
            {messages.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-md font-extrabold">{messages.length}</span>
            )}
          </button>

          <button 
            onClick={() => { setActiveTab('logs'); setSearchQuery(''); }}
            className={`w-full px-4 py-2.5 rounded-xl text-xs font-bold text-left flex items-center space-x-2 transition-colors cursor-pointer ${
              activeTab === 'logs' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>System Audit Logs</span>
          </button>
        </div>

        {/* Workstation Content Frame */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-hidden">
          
          {/* A. Overview Analytics & Recharts */}
          {activeTab === 'analytics' && (
            <div className="space-y-8">
              <div>
                <h4 className="font-bold text-slate-800 text-sm">Overview Graphical Analytics</h4>
                <p className="text-slate-400 text-xs mt-0.5">Statistical insights for loan activity and catalog distribution</p>
              </div>

              {/* Graphical Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-4">
                  <h5 className="font-bold text-slate-700 text-xs text-center uppercase tracking-wide">Monthly Loans Checkout Rate</h5>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                        <Bar dataKey="Loans" fill="#2563EB" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 space-y-4">
                  <h5 className="font-bold text-slate-700 text-xs text-center uppercase tracking-wide">Major Subjects Share Ratio</h5>
                  <div className="h-60 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {categoryChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {categoryChartData.map((d, i) => (
                      <span key={i} className="inline-flex items-center space-x-1.5 text-[9px] font-bold text-slate-500">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span>{d.name} ({d.value})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Data Export Center */}
              <ReportExport borrows={borrows} fines={fines} books={books} />
            </div>
          )}

          {/* B. Catalog Items CRUD */}
          {activeTab === 'books' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <h4 className="font-bold text-slate-800 text-sm">Inventory Catalog Table</h4>
                <button 
                  onClick={() => onSaveBook(null)}
                  className="px-4.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                  id="admin-add-book-btn"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Book</span>
                </button>
              </div>

              {/* Table search field */}
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="Search inventory by title, author, isbn..."
              />

              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full border-collapse text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                      <th className="p-3.5">Book Details</th>
                      <th className="p-3.5">ISBN</th>
                      <th className="p-3.5">Shelf</th>
                      <th className="p-3.5 text-center">Available / Total</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {books.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()) || b.authorName.toLowerCase().includes(searchQuery.toLowerCase()) || b.isbn.includes(searchQuery)).map(b => (
                      <tr key={b.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-800 line-clamp-1">{b.title}</p>
                          <p className="text-slate-400 text-[10px] mt-0.5">By {b.authorName} • {b.categoryName}</p>
                        </td>
                        <td className="p-3.5 font-mono text-[10px] text-slate-500">{b.isbn}</td>
                        <td className="p-3.5 font-mono text-[10px] text-slate-500 uppercase">{b.shelfNumber || 'N/A'}</td>
                        <td className="p-3.5 text-center font-bold">
                          <span className={`px-2 py-0.5 rounded-full ${b.availableQuantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {b.availableQuantity} / {b.quantity}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button onClick={() => onSaveBook(b)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer inline-block" title="Edit Book"><Edit className="h-3.5 w-3.5" /></button>
                          <button onClick={() => onDeleteBook(b.id)} className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors cursor-pointer inline-block" title="Delete Book"><Trash2 className="h-3.5 w-3.5" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* C. Descriptors */}
          {activeTab === 'descriptors' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Authors table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Manage Authors</h4>
                  <button onClick={() => onSaveAuthor(null)} className="p-1 text-blue-600 font-bold hover:text-blue-700 text-xs flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> <span>Add</span>
                  </button>
                </div>
                <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-96 overflow-y-auto">
                  <table className="w-full text-[11px] text-left">
                    <tbody className="divide-y divide-slate-100">
                      {authors.map(a => (
                        <tr key={a.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{a.name}</p>
                            <p className="text-slate-400 text-[10px] italic mt-0.5 line-clamp-1">{a.bio || 'No biography details provided.'}</p>
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={() => onDeleteAuthor(a.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Categories table */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Manage Categories</h4>
                  <button onClick={() => onSaveCategory(null)} className="p-1 text-blue-600 font-bold hover:text-blue-700 text-xs flex items-center gap-1 cursor-pointer">
                    <Plus className="h-3.5 w-3.5" /> <span>Add</span>
                  </button>
                </div>
                <div className="overflow-x-auto border border-slate-100 rounded-xl max-h-96 overflow-y-auto">
                  <table className="w-full text-[11px] text-left">
                    <tbody className="divide-y divide-slate-100">
                      {categories.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <p className="font-bold text-slate-800">{c.name}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">{c.bookCount || 0} books cataloged</p>
                          </td>
                          <td className="p-3 text-right">
                            <button onClick={() => onDeleteCategory(c.id)} className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"><Trash2 className="h-3.5 w-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* D. Members directory */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Active Members Directory</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Toggle student/faculty verification state or remove credentials</p>
                </div>
                {/* Directory Search */}
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search members by name, ID, email..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-xl pl-9 pr-4 py-1.5 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                      <th className="p-3.5">Name / Acc ID</th>
                      <th className="p-3.5">Role</th>
                      <th className="p-3.5">Academic/Staff ID</th>
                      <th className="p-3.5">Dept / Major / Level</th>
                      <th className="p-3.5">Email / Phone</th>
                      <th className="p-3.5">State</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {members
                      .filter(m => {
                        const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
                        const email = m.email.toLowerCase();
                        const query = searchQuery.toLowerCase();
                        const idVal = m.role === UserRole.TEACHER ? m.teacherId || '' : m.studentId || '';
                        const deptVal = m.role === UserRole.TEACHER ? m.department || '' : m.major || '';
                        
                        return fullName.includes(query) ||
                               email.includes(query) ||
                               idVal.toLowerCase().includes(query) ||
                               deptVal.toLowerCase().includes(query);
                      })
                      .map(m => (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-800">{m.firstName} {m.lastName}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">Account ID: MEM-0{m.id}</p>
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded uppercase ${
                              m.role === UserRole.TEACHER 
                                ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {m.role === UserRole.TEACHER ? 'Teacher' : 'Student'}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-700">
                            {m.role === UserRole.TEACHER ? m.teacherId || 'N/A' : m.studentId || 'N/A'}
                          </td>
                          <td className="p-3.5">
                            {m.role === UserRole.TEACHER ? (
                              <div>
                                <p className="font-semibold text-slate-700 text-[11px]">{m.department || 'N/A'}</p>
                                <p className="text-slate-400 text-[10px]">{m.designation || 'No title'}</p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-semibold text-slate-700 text-[11px]">{m.major || 'N/A'}</p>
                                <p className="text-slate-400 text-[10px]">{m.gradeLevel || 'No level'}</p>
                              </div>
                            )}
                          </td>
                          <td className="p-3.5">
                            <p className="font-mono text-[10px] text-slate-500">{m.email}</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">{m.phone || 'No phone'}</p>
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold rounded-lg uppercase ${
                              m.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {m.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-1.5">
                            <button 
                              onClick={() => handleToggleBlock(m.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                            >
                              {m.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button 
                              onClick={() => handleDeleteUserClick(m.id)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer inline-block"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* E. Issuance Ledger */}
          {activeTab === 'loans' && (() => {
            const todayStr = new Date().toISOString().split('T')[0];
            const filteredAndSortedLoans = borrows
              .filter(b => {
                // Search match
                const query = loansSearch.toLowerCase().trim();
                if (query) {
                  const idMatch = b.id.toString().includes(query);
                  const nameMatch = b.userName.toLowerCase().includes(query);
                  const titleMatch = b.bookTitle.toLowerCase().includes(query);
                  if (!idMatch && !nameMatch && !titleMatch) return false;
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
                if (loansFilter === 'due_today') {
                  return b.status !== 'returned' && b.dueDate === todayStr;
                }
                if (loansFilter === 'no_fine') {
                  return b.fineAmount === 0;
                }
                if (loansFilter === 'fine_pending') {
                  return b.fineAmount > 0;
                }
                return true;
              })
              .sort((a, b) => {
                if (loansSort === 'borrowDate') {
                  return new Date(b.borrowDate).getTime() - new Date(a.borrowDate).getTime();
                }
                if (loansSort === 'dueDate') {
                  return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
                }
                if (loansSort === 'fineAmount') {
                  return b.fineAmount - a.fineAmount;
                }
                if (loansSort === 'userName') {
                  return a.userName.localeCompare(b.userName);
                }
                if (loansSort === 'bookTitle') {
                  return a.bookTitle.localeCompare(b.bookTitle);
                }
                if (loansSort === 'oldest') {
                  return a.id - b.id;
                }
                return b.id - a.id;
              });

            return (
              <div className="space-y-6">
                {/* 5 Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Borrowed</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-black text-slate-800">{borrows.filter(b => b.status !== 'returned').length}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Active Loans</span>
                    </div>
                  </div>
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Returned</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-black text-slate-800">{borrows.filter(b => b.status === 'returned').length}</span>
                      <span className="text-[10px] text-emerald-500 font-medium">Completed</span>
                    </div>
                  </div>
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Overdue Books</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-black text-slate-800">{borrows.filter(b => b.status === 'overdue').length}</span>
                      <span className="text-[10px] text-rose-500 font-medium font-bold">Action Required</span>
                    </div>
                  </div>
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Books Due Today</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-black text-slate-800">{borrows.filter(b => b.status !== 'returned' && b.dueDate === todayStr).length}</span>
                      <span className="text-[10px] text-amber-500 font-medium">Today</span>
                    </div>
                  </div>
                  <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm space-y-2 col-span-1 sm:col-span-2 lg:col-span-1">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total Fine Collected</span>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-lg font-black text-slate-800">Rs. {fines.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.fineAmount, 0)}</span>
                      <span className="text-[10px] text-slate-400 font-medium">INR</span>
                    </div>
                  </div>
                </div>

                {/* Direct issuance form */}
                <form onSubmit={handleIssueSubmit} className="p-4 border border-blue-100 bg-blue-50/30 rounded-2xl space-y-4">
                  <div>
                    <h5 className="font-bold text-blue-900 text-xs uppercase">Issue Book Loan</h5>
                    <p className="text-slate-500 text-[10px] mt-0.5">Quickly dispatch book inventory directly to student email</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Student Registered Email *</label>
                      <input 
                        type="email" 
                        value={issueEmail}
                        onChange={e => setIssueEmail(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                        placeholder="student@library.com"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-500 uppercase">Select Target Book *</label>
                      <select
                        value={issueBookId}
                        onChange={e => setIssueBookId(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-blue-500"
                        required
                      >
                        <option value="">-- Choose available book --</option>
                        {books.filter(b => b.availableQuantity > 0).map(b => (
                          <option key={b.id} value={b.id}>{b.title} ({b.availableQuantity} left)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={issueLoading}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-40"
                    id="direct-issue-submit-btn"
                  >
                    {issueLoading ? 'Checking parameters...' : 'Issue Book Checkout'}
                  </button>
                </form>

                {/* Loans List (Borrowed Books) */}
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Borrowed Books Log</h4>
                      <p className="text-[11px] text-slate-400 font-medium font-bold">Real-time tracker of all borrowing and return actions</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportLoans}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer self-start md:self-auto"
                      id="loans-tab-export-csv-btn"
                    >
                      <Download className="h-3.5 w-3.5 text-slate-500" />
                      <span>Export Loans CSV</span>
                    </button>
                  </div>

                  {/* Search, Filter, & Sort Panel */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Search Records</label>
                      <input 
                        type="text" 
                        value={loansSearch}
                        onChange={e => setLoansSearch(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        placeholder="Search Name, Book or ID..."
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400 uppercase">Filter by Status</label>
                      <select
                        value={loansFilter}
                        onChange={e => setLoansFilter(e.target.value as any)}
                        className="w-full border border-slate-200 bg-white rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                      >
                        <option value="all">All Records</option>
                        <option value="borrowed">Borrowed / Active</option>
                        <option value="returned">Returned</option>
                        <option value="overdue">Overdue</option>
                        <option value="due_today">Due Today</option>
                        <option value="no_fine">No Fine</option>
                        <option value="fine_pending">Fine Pending</option>
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
                        <option value="fineAmount">Fine Amount</option>
                        <option value="userName">User Name</option>
                        <option value="bookTitle">Book Title</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                          <th className="p-3.5">Borrow ID</th>
                          <th className="p-3.5">User Name</th>
                          <th className="p-3.5">Book Title</th>
                          <th className="p-3.5">Borrow Date</th>
                          <th className="p-3.5">Due Date</th>
                          <th className="p-3.5">Return Date</th>
                          <th className="p-3.5">Days Remaining</th>
                          <th className="p-3.5">Fine</th>
                          <th className="p-3.5">Status</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredAndSortedLoans.length === 0 ? (
                          <tr>
                            <td colSpan={10} className="p-8 text-center text-slate-400 italic">
                              No matching borrow records found.
                            </td>
                          </tr>
                        ) : (
                          filteredAndSortedLoans.map(b => {
                            const daysRem = (() => {
                              if (b.status === 'returned') return 'N/A';
                              const today = new Date();
                              today.setHours(0,0,0,0);
                              const dueDate = new Date(b.dueDate);
                              dueDate.setHours(0,0,0,0);
                              const diffTime = dueDate.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                              if (diffDays < 0) return `Overdue (${Math.abs(diffDays)} days)`;
                              return `${diffDays} days`;
                            })();

                            return (
                              <tr key={b.id} className="hover:bg-slate-50/50">
                                <td className="p-3.5 font-mono text-[10px] text-slate-500 font-bold">#{b.id}</td>
                                <td className="p-3.5">
                                  <p className="font-bold text-slate-800">{b.userName}</p>
                                  <p className="text-slate-400 text-[10px]">{b.userEmail}</p>
                                </td>
                                <td className="p-3.5 font-bold text-slate-700 max-w-[150px] truncate" title={b.bookTitle}>
                                  {b.bookTitle}
                                </td>
                                <td className="p-3.5 text-slate-600 font-medium">{b.borrowDate}</td>
                                <td className="p-3.5 text-slate-600 font-medium">{b.dueDate}</td>
                                <td className="p-3.5 text-slate-500 font-medium">{b.returnDate || '-'}</td>
                                <td className={`p-3.5 font-semibold ${
                                  b.status === 'returned' ? 'text-slate-400' :
                                  daysRem.startsWith('Overdue') ? 'text-rose-600 font-black animate-pulse' : 'text-slate-600'
                                }`}>
                                  {daysRem}
                                </td>
                                <td className={`p-3.5 font-black ${b.fineAmount > 0 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                                  Rs. {b.fineAmount}
                                </td>
                                <td className="p-3.5">
                                  <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                    b.status === 'returned' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                    b.status === 'overdue' ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' :
                                    b.status === 'renewed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    'bg-slate-50 text-slate-700 border-slate-100'
                                  }`}>
                                    {b.status}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right space-x-1">
                                  {b.status !== 'returned' ? (
                                    <div className="flex justify-end gap-1">
                                      <button 
                                        onClick={() => {
                                          if (window.confirm("Are you sure you want to return this book?")) {
                                            handleReturn(b.id);
                                          }
                                        }}
                                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                                      >
                                        Return Book
                                      </button>
                                      <button 
                                        onClick={() => handleRenew(b.id)}
                                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                                      >
                                        Renew
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 font-semibold italic text-[10px]">Settled</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* F. Reservations queue */}
          {activeTab === 'reservations' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">Reservations Queue Manager</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                      <th className="p-3.5">Reserved Book</th>
                      <th className="p-3.5">Requested Student</th>
                      <th className="p-3.5 text-center">Queue Index</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reservations.map(res => (
                      <tr key={res.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5 font-bold text-slate-800">{res.bookTitle}</td>
                        <td className="p-3.5">
                          <p className="font-semibold text-slate-700">{res.userName}</p>
                          <p className="text-slate-400 text-[10px]">{res.userEmail}</p>
                        </td>
                        <td className="p-3.5 text-center font-bold text-blue-600">Position #{res.queuePosition}</td>
                        <td className="p-3.5 text-right">
                          <button 
                            onClick={() => onCancelReservation(res.id)}
                            className="px-2.5 py-1 border border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                          >
                            Cancel
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* G. Fines workshop */}
          {activeTab === 'fines' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Fines Workstation</h4>
                  <p className="text-slate-400 text-xs mt-0.5">Collect or waive late book return penalties</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportFines}
                    className="inline-flex items-center justify-center space-x-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    id="fines-tab-export-csv-btn"
                  >
                    <Download className="h-3.5 w-3.5 text-slate-500" />
                    <span>Export Fines CSV</span>
                  </button>
                  <div className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl flex gap-4 font-bold text-slate-700">
                    <p>Settled: <strong className="text-emerald-700">${totalRevenue.toFixed(2)}</strong></p>
                    <p>Outstanding: <strong className="text-rose-600">${outstandingRevenue.toFixed(2)}</strong></p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                      <th className="p-3.5">Student Details</th>
                      <th className="p-3.5">Book Title</th>
                      <th className="p-3.5">Penalty Owed</th>
                      <th className="p-3.5">State</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fines.map(fine => (
                      <tr key={fine.id} className="hover:bg-slate-50/50">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-800">{fine.userName}</p>
                          <p className="text-slate-400 text-[10px]">{fine.userEmail}</p>
                        </td>
                        <td className="p-3.5 text-slate-600 font-semibold">{fine.bookTitle}</td>
                        <td className="p-3.5 font-extrabold text-slate-800">${fine.fineAmount.toFixed(2)}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            fine.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {fine.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          {fine.status === 'unpaid' ? (
                            <>
                              <button 
                                onClick={() => onCollectFine(fine.id)}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                              >
                                Collect Fine
                              </button>
                              <button 
                                onClick={() => onWaiveFine(fine.id)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] rounded-lg transition-colors cursor-pointer"
                              >
                                Waive Fine
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-400 italic text-[10px] font-semibold">Settled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* H. Messages Inbox */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">Student Inbox Inquiries</h4>
              {messages.length === 0 ? (
                <div className="p-8 text-center bg-slate-50/50 border border-dashed border-slate-200 text-slate-400 text-xs rounded-2xl">
                  Inquiries folder empty. Any contact messages from the home page show up here.
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800 text-xs sm:text-sm">{msg.name}</p>
                          <p className="text-slate-400 text-[10px]">{msg.email} • {msg.phone || 'No phone'}</p>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{new Date(msg.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="font-bold text-xs text-slate-700 pt-1">Subject: {msg.subject}</p>
                      <p className="text-slate-600 text-xs leading-relaxed italic">"{msg.message}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* I. Audit logs */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-800 text-sm">System Security Audit Logs</h4>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl max-h-96 overflow-y-auto">
                <table className="w-full text-[11px] text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                      <th className="p-3">Logged Security Action</th>
                      <th className="p-3">Executor ID</th>
                      <th className="p-3 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {logs.map(lg => (
                      <tr key={lg.id} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-700 font-semibold">{lg.action}</td>
                        <td className="p-3 text-slate-400">UID: {lg.userId}</td>
                        <td className="p-3 text-right text-slate-400 text-[10px]">{new Date(lg.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
