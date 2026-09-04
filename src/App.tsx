/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.tsx';
import Sidebar from './components/Sidebar.tsx';
import { HomeView } from './components/HomeView.tsx';
import { AboutView, ContactView } from './components/InfoViews.tsx';
import { BooksCatalogView } from './components/BooksCatalogView.tsx';
import { LoginView, RegisterView, ForgotPasswordView } from './components/AuthViews.tsx';
import StudentDashboard from './components/StudentDashboard.tsx';
import AdminDashboard from './components/AdminDashboard.tsx';
import AdminBookModal from './components/AdminBookModal.tsx';
import AdminAuthorCategoryModal from './components/AdminAuthorCategoryModal.tsx';

import { 
  User, Book, Author, Category, Publisher, BorrowRecord, 
  Reservation, Fine, ContactMessage, AuditLog, Notification, UserRole 
} from './types.js';

import { AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export default function App() {
  // Session Security States
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // View Routing State
  const [currentView, setCurrentView] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>(''); // shared hero lookup value

  // Data Stores
  const [books, setBooks] = useState<Book[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [borrows, setBorrows] = useState<BorrowRecord[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [wishlistIds, setWishlistIds] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Modal / Editing states
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [showAddAuthor, setShowAddAuthor] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  // General feedback status (Toasts)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [appLoading, setAppLoading] = useState(true);

  // Auto-clear toast helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Initial Session Restoration
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    // Pull catalog files
    syncCoreData().finally(() => setAppLoading(false));
  }, []);

  // 2. Load and Sync Core resources from Express REST APIs
  const syncCoreData = async () => {
    try {
      const headers: HeadersInit = {};
      const savedToken = localStorage.getItem('token') || token;
      if (savedToken) {
        headers['Authorization'] = `Bearer ${savedToken}`;
      }

      // Fetch books
      const bRes = await fetch('/api/books', { headers });
      if (bRes.ok) setBooks(await bRes.json());

      // Fetch authors
      const aRes = await fetch('/api/authors', { headers });
      if (aRes.ok) setAuthors(await aRes.json());

      // Fetch categories
      const cRes = await fetch('/api/categories', { headers });
      if (cRes.ok) setCategories(await cRes.json());

      // Fetch publishers
      const pRes = await fetch('/api/publishers', { headers });
      if (pRes.ok) setPublishers(await pRes.json());

      // Fetch borrows
      const boRes = await fetch('/api/borrow', { headers });
      if (boRes.ok) setBorrows(await boRes.json());

      // Fetch reservations
      const rRes = await fetch('/api/reservations', { headers });
      if (rRes.ok) setReservations(await rRes.json());

      // Fetch fines
      const fRes = await fetch('/api/fines', { headers });
      if (fRes.ok) setFines(await fRes.json());

      // If user is Admin, fetch system messages, logs, members
      if (user?.role === UserRole.ADMIN) {
        const mRes = await fetch('/api/members', { headers });
        if (mRes.ok) setMembers(await mRes.json());

        const msgRes = await fetch('/api/contact', { headers });
        if (msgRes.ok) setMessages(await msgRes.json());

        const lRes = await fetch('/api/logs', { headers });
        if (lRes.ok) setLogs(await lRes.json());
      }

      // If user is Student or Teacher, fetch personal wishlist, notifications
      if (user?.role === UserRole.STUDENT || user?.role === UserRole.TEACHER) {
        const wRes = await fetch('/api/wishlist', { headers });
        if (wRes.ok) {
          const list = await wRes.json();
          setWishlistIds(list.map((item: any) => item.bookId));
        }

        const nRes = await fetch('/api/notifications', { headers });
        if (nRes.ok) setNotifications(await nRes.json());
      }
    } catch (err) {
      console.error('Error syncing backend resources:', err);
    }
  };

  // Re-sync catalog details when user session shifts
  useEffect(() => {
    if (token) {
      syncCoreData();
    }
  }, [user, token]);

  // 3. User Authentication flows
  const handleLoginSubmit = async (email: string, pass: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication rejected.');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    showToast(`Welcome back, ${data.user.firstName}! Session established.`, 'success');
    
    if (data.user.role === UserRole.ADMIN) {
      setCurrentView('admin-dashboard');
    } else {
      setCurrentView('student-dashboard');
    }
  };

  const handleRegisterSubmit = async (formData: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Enrollment rejected.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setWishlistIds([]);
    setNotifications([]);
    showToast('Secure session terminated successfully.', 'success');
    setCurrentView('home');
  };

  // 4. Student Transactions & Interactions
  const handleBorrowBook = async (bookId: number) => {
    try {
      const res = await fetch('/api/borrow', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Could not borrow item.', 'error');
        return;
      }
      showToast('Book borrowed successfully! Pick it up at Block B desk.', 'success');
      syncCoreData();
    } catch (err: any) {
      showToast(err.message || 'Error executing checkout.', 'error');
    }
  };

  const handleReserveBook = async (bookId: number) => {
    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Could not place reservation.', 'error');
        return;
      }
      showToast('Placed in queue! You will be notified on book checkin.', 'success');
      syncCoreData();
    } catch (err: any) {
      showToast(err.message || 'Error placing reservation.', 'error');
    }
  };

  const handleToggleWishlist = async (bookId: number) => {
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookId })
      });
      if (res.ok) {
        showToast('Wishlist preferences saved!', 'success');
        syncCoreData();
      }
    } catch (err) {
      showToast('Error syncing preferences.', 'error');
    }
  };

  const handleRenewLoan = async (borrowId: number) => {
    const res = await fetch('/api/borrow/renew', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ borrowId })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Extension limit exceeded.');
    }
    syncCoreData();
  };

  const handleCancelReservation = async (resId: number) => {
    const res = await fetch(`/api/reservations/${resId}/cancel`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Could not cancel reservation.');
    }
    syncCoreData();
  };

  const handlePayFine = async (fineId: number) => {
    const res = await fetch(`/api/fines/${fineId}/pay`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Fine checkout processing error.');
    }
    syncCoreData();
  };

  const handleUpdateProfile = async (formData: any) => {
    if (!user) return;
    const res = await fetch(`/api/members/${user.id}/profile`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update credentials.');
    }
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    syncCoreData();
  };

  const handleContactSubmit = async (formData: any) => {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error submitting message.');
    }
    syncCoreData();
  };

  const handleAddReview = async (bookId: number, rating: number, comment: string) => {
    const res = await fetch(`/api/books/${bookId}/reviews`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ rating, comment })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Error saving review.');
    }
    syncCoreData();
  };

  // 5. Admin / Librarian Workflows
  const handleAdminSaveBook = async (bookData: any) => {
    try {
      const method = editingBook ? 'PUT' : 'POST';
      const url = editingBook ? `/api/books/${editingBook.id}` : '/api/books';
      
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookData)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Error saving book.', 'error');
        return;
      }
      showToast('Book catalog record synchronized successfully!', 'success');
      setEditingBook(null);
      setShowAddBook(false);
      syncCoreData();
    } catch (err) {
      showToast('Error syncing catalog book.', 'error');
    }
  };

  const handleAdminDeleteBook = async (bookId: number) => {
    if (confirm('Permanently delete this catalog book record?')) {
      try {
        const res = await fetch(`/api/books/${bookId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          showToast('Book removed successfully.', 'success');
          syncCoreData();
        } else {
          const data = await res.json();
          showToast(data.error || 'Error deleting book.', 'error');
        }
      } catch (err) {
        showToast('Error executing catalog purge.', 'error');
      }
    }
  };

  const handleAdminSaveAuthor = async (authorData: any) => {
    try {
      const res = await fetch('/api/authors', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(authorData)
      });
      if (res.ok) {
        showToast('Author cataloged successfully!', 'success');
        setEditingAuthor(null);
        setShowAddAuthor(false);
        syncCoreData();
      }
    } catch (err) {
      showToast('Error curating author.', 'error');
    }
  };

  const handleAdminDeleteAuthor = async (authorId: number) => {
    if (confirm('Purge this author descriptor?')) {
      try {
        const res = await fetch(`/api/authors/${authorId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          showToast('Author deleted.', 'success');
          syncCoreData();
        }
      } catch (err) {
        showToast('Error.', 'error');
      }
    }
  };

  const handleAdminSaveCategory = async (catData: any) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(catData)
      });
      if (res.ok) {
        showToast('Category cataloged successfully!', 'success');
        setEditingCategory(null);
        setShowAddCategory(false);
        syncCoreData();
      }
    } catch (err) {
      showToast('Error.', 'error');
    }
  };

  const handleAdminDeleteCategory = async (catId: number) => {
    if (confirm('Purge this category descriptor?')) {
      try {
        const res = await fetch(`/api/categories/${catId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          showToast('Category deleted.', 'success');
          syncCoreData();
        }
      } catch (err) {
        showToast('Error.', 'error');
      }
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    const target = members.find(m => m.id === userId);
    if (!target) return;
    const newStatus = target.status === 'active' ? 'inactive' : 'active';

    const res = await fetch(`/api/members/${userId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    if (!res.ok) throw new Error('Could not shift status.');
    syncCoreData();
  };

  const handleDeleteUser = async (userId: number) => {
    const res = await fetch(`/api/members/${userId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Could not purge user.');
    syncCoreData();
  };

  const handleIssueBookDirect = async (email: string, bId: number) => {
    const res = await fetch('/api/borrow', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ email, bookId: bId })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to issue book checkout.');
    }
    syncCoreData();
  };

  const handleReturnBookDesk = async (bId: number) => {
    const res = await fetch('/api/borrow/return', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ borrowId: bId })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Return check-in error.');
    }
    syncCoreData();
  };

  const handleWaiveFine = async (fineId: number) => {
    const res = await fetch(`/api/fines/${fineId}/waive`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Waiving error.');
    showToast('Fine waived completely from system ledger.', 'success');
    syncCoreData();
  };

  const handleCollectFine = async (fineId: number) => {
    const res = await fetch(`/api/fines/${fineId}/collect`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Collection error.');
    showToast('Fine collected and recorded inside revenue balance.', 'success');
    syncCoreData();
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased">
      
      {/* Dynamic Slide-in Toast Indicator */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl shadow-2xl border flex items-center space-x-3 max-w-sm bg-white animate-bounce">
          {toast.type === 'success' ? (
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle2 className="h-5 w-5" /></div>
          ) : (
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><ShieldAlert className="h-5 w-5" /></div>
          )}
          <div>
            <p className="text-xs font-bold text-slate-800">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Primary Desktop Navigation Bar */}
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={setCurrentView} 
        currentView={currentView}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Main Core Content Stage */}
      <main className="flex-grow pt-16">
        {appLoading ? (
          <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center space-y-3">
            <div className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
            <p className="text-xs font-bold text-slate-500 font-mono">Securing Aegis Cloud Run links...</p>
          </div>
        ) : (
          <>
            {/* Conditional Views rendering based on current routing */}
            {currentView === 'home' && (
              <HomeView 
                categories={categories} 
                books={books} 
                onNavigate={setCurrentView} 
                onSearchQuery={setSearchQuery} 
                onSubmitContact={handleContactSubmit}
                toast={showToast}
              />
            )}

            {currentView === 'about' && <AboutView />}

            {currentView === 'contact' && (
              <ContactView 
                onSubmitContact={handleContactSubmit} 
                toast={showToast} 
              />
            )}

            {currentView === 'books-catalog' && (
              <BooksCatalogView 
                books={books} 
                categories={categories} 
                authors={authors} 
                userRole={user ? user.role : null}
                onBorrow={handleBorrowBook}
                onReserve={handleReserveBook}
                onToggleWishlist={handleToggleWishlist}
                wishlistIds={wishlistIds}
                onAddReview={handleAddReview}
                onEditBook={(b) => { setEditingBook(b); setShowAddBook(true); }}
                onDeleteBook={handleAdminDeleteBook}
                initialSearch={searchQuery}
                onClearInitialSearch={() => setSearchQuery('')}
              />
            )}

            {currentView === 'login' && (
              <LoginView 
                onLogin={handleLoginSubmit} 
                onNavigate={setCurrentView} 
                toast={showToast} 
              />
            )}

            {currentView === 'register' && (
              <RegisterView 
                onRegister={handleRegisterSubmit} 
                onNavigate={setCurrentView} 
                toast={showToast} 
              />
            )}

            {currentView === 'forgot-password' && (
              <ForgotPasswordView 
                onNavigate={setCurrentView} 
              />
            )}

            {currentView === 'student-dashboard' && (user?.role === UserRole.STUDENT || user?.role === UserRole.TEACHER) && (
              <StudentDashboard 
                user={user}
                borrows={borrows}
                reservations={reservations}
                fines={fines}
                books={books}
                wishlistIds={wishlistIds}
                onRenewLoan={handleRenewLoan}
                onCancelReservation={handleCancelReservation}
                onPayFine={handlePayFine}
                onToggleWishlist={handleToggleWishlist}
                onUpdateProfile={handleUpdateProfile}
                toast={showToast}
              />
            )}

            {currentView === 'admin-dashboard' && user?.role === UserRole.ADMIN && (
              <AdminDashboard 
                books={books}
                authors={authors}
                categories={categories}
                publishers={publishers}
                members={members}
                borrows={borrows}
                reservations={reservations}
                fines={fines}
                messages={messages}
                logs={logs}
                onSaveBook={(b) => { setEditingBook(b); setShowAddBook(true); }}
                onDeleteBook={handleAdminDeleteBook}
                onSaveAuthor={(a) => { setEditingAuthor(a); setShowAddAuthor(true); }}
                onDeleteAuthor={handleAdminDeleteAuthor}
                onSaveCategory={(c) => { setEditingCategory(c); setShowAddCategory(true); }}
                onDeleteCategory={handleAdminDeleteCategory}
                onToggleUserStatus={handleToggleUserStatus}
                onDeleteUser={handleDeleteUser}
                onIssueBook={handleIssueBookDirect}
                onReturnBook={handleReturnBookDesk}
                onRenewLoan={handleRenewLoan}
                onCancelReservation={handleCancelReservation}
                onWaiveFine={handleWaiveFine}
                onCollectFine={handleCollectFine}
                toast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* 6. Unified Administration Modals */}
      {/* Book Add/Edit Modal */}
      {showAddBook && (
        <AdminBookModal 
          book={editingBook}
          authors={authors}
          categories={categories}
          publishers={publishers}
          onClose={() => { setEditingBook(null); setShowAddBook(false); }}
          onSave={handleAdminSaveBook}
        />
      )}

      {/* Author Add/Edit Modal */}
      {showAddAuthor && (
        <AdminAuthorCategoryModal 
          mode="author"
          item={editingAuthor}
          onClose={() => { setEditingAuthor(null); setShowAddAuthor(false); }}
          onSave={handleAdminSaveAuthor}
        />
      )}

      {/* Category Add/Edit Modal */}
      {showAddCategory && (
        <AdminAuthorCategoryModal 
          mode="category"
          item={editingCategory}
          onClose={() => { setEditingCategory(null); setShowAddCategory(false); }}
          onSave={handleAdminSaveCategory}
        />
      )}

    </div>
  );
}
