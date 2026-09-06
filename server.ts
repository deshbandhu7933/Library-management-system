/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { authenticateToken, optionalAuthenticateToken, requireAdmin } from './src/server/auth.js';
import {
  register, login, forgotPassword, resetPassword,
  getDashboardStats,
  getBooks, getBookDetails, createBook, updateBook, deleteBook, createReview,
  getAuthors, createAuthor, updateAuthor, deleteAuthor,
  getCategories, createCategory, updateCategory, deleteCategory,
  getPublishers,
  getMembers, changeMemberStatus, updateMemberProfile, deleteMember,
  getBorrowRecords, issueBook, renewBook, returnBook,
  deleteBorrowRecord, clearReturnedHistory,
  getReservations, reserveBook, cancelReservation,
  getFines, payFine, waiveFine,
  getWishlist, addToWishlist, removeFromWishlist,
  getContacts, createContact,
  getNotifications, markNotificationsRead, clearNotifications,
  getActivityLogs, getRecommendations,
  getBorrowRecordDetails, returnBookById, updateFinesEndpoint, getDashboardStatsCustom
} from './src/server/controllers.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security Headers & CORS Simulation
  app.use(express.json());
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // ==========================================
  // REST API ROUTES
  // ==========================================

  // Authentication
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);
  app.post('/api/auth/forgot-password', forgotPassword);
  app.post('/api/auth/reset-password', resetPassword);

  // Dashboard Metrics
  app.get('/api/dashboard/stats', authenticateToken as any, getDashboardStats as any);

  // Books Catalog (Accessible publicly, with optional auth for customized views)
  app.get('/api/books', optionalAuthenticateToken as any, getBooks as any);
  app.get('/api/books/:id', optionalAuthenticateToken as any, getBookDetails as any);
  app.post('/api/books', authenticateToken as any, requireAdmin as any, createBook as any);
  app.put('/api/books/:id', authenticateToken as any, requireAdmin as any, updateBook as any);
  app.delete('/api/books/:id', authenticateToken as any, requireAdmin as any, deleteBook as any);
  
  // Book Reviews
  app.post('/api/books/:id/reviews', authenticateToken as any, createReview as any);

  // Authors Management (Publicly readable, admin editable)
  app.get('/api/authors', optionalAuthenticateToken as any, getAuthors as any);
  app.post('/api/authors', authenticateToken as any, requireAdmin as any, createAuthor as any);
  app.put('/api/authors/:id', authenticateToken as any, requireAdmin as any, updateAuthor as any);
  app.delete('/api/authors/:id', authenticateToken as any, requireAdmin as any, deleteAuthor as any);

  // Categories Management (Publicly readable, admin editable)
  app.get('/api/categories', optionalAuthenticateToken as any, getCategories as any);
  app.post('/api/categories', authenticateToken as any, requireAdmin as any, createCategory as any);
  app.put('/api/categories/:id', authenticateToken as any, requireAdmin as any, updateCategory as any);
  app.delete('/api/categories/:id', authenticateToken as any, requireAdmin as any, deleteCategory as any);

  // Publishers Management (Publicly readable)
  app.get('/api/publishers', optionalAuthenticateToken as any, getPublishers as any);

  // Members Management
  app.get('/api/members', authenticateToken as any, requireAdmin as any, getMembers as any);
  app.put('/api/members/:id/status', authenticateToken as any, requireAdmin as any, changeMemberStatus as any);
  app.put('/api/members/:id/profile', authenticateToken as any, updateMemberProfile as any);
  app.delete('/api/members/:id', authenticateToken as any, requireAdmin as any, deleteMember as any);

  // Borrow & Return Operations
  app.get('/api/borrow', authenticateToken as any, getBorrowRecords as any);
  app.get('/api/borrows', authenticateToken as any, getBorrowRecords as any);
  app.post('/api/borrow', authenticateToken as any, issueBook as any);
  app.post('/api/borrow/renew', authenticateToken as any, renewBook as any);
  app.post('/api/borrow/return', authenticateToken as any, returnBook as any);
  app.delete('/api/borrows/history/clear', authenticateToken as any, requireAdmin as any, clearReturnedHistory as any);
  app.delete('/api/borrows/:id', authenticateToken as any, requireAdmin as any, deleteBorrowRecord as any);
  app.delete('/api/borrow-records/:id', authenticateToken as any, requireAdmin as any, deleteBorrowRecord as any);

  // Borrow & Return Custom Spec Endpoints
  app.get('/api/borrow-records', authenticateToken as any, getBorrowRecords as any);
  app.get('/api/borrow-records/:id', authenticateToken as any, getBorrowRecordDetails as any);
  app.put('/api/return/:id', authenticateToken as any, returnBookById as any);
  app.put('/api/update-fines', authenticateToken as any, updateFinesEndpoint as any);
  app.get('/api/dashboard', authenticateToken as any, getDashboardStatsCustom as any);

  // Reservations
  app.get('/api/reservations', authenticateToken as any, getReservations as any);
  app.post('/api/reservations', authenticateToken as any, reserveBook as any);
  app.post('/api/reserve', authenticateToken as any, reserveBook as any);
  app.post('/api/reservations/:id/cancel', authenticateToken as any, cancelReservation as any);

  // Fines Ledger
  app.get('/api/fines', authenticateToken as any, getFines as any);
  app.post('/api/fines/:id/pay', authenticateToken as any, payFine as any);
  app.post('/api/fines/:id/collect', authenticateToken as any, payFine as any);
  app.post('/api/fines/:id/waive', authenticateToken as any, requireAdmin as any, waiveFine as any);

  // Wishlists
  app.get('/api/wishlist', authenticateToken as any, getWishlist as any);
  app.post('/api/wishlist', authenticateToken as any, addToWishlist as any);
  app.delete('/api/wishlist/:id', authenticateToken as any, removeFromWishlist as any);

  // Notifications
  app.get('/api/notifications', authenticateToken as any, getNotifications as any);
  app.put('/api/notifications/read', authenticateToken as any, markNotificationsRead as any);
  app.post('/api/notifications/clear', authenticateToken as any, clearNotifications as any);

  // Contacts Form (supports both singular and plural)
  app.post('/api/contact', createContact);
  app.post('/api/contacts', createContact);
  app.get('/api/contacts', authenticateToken as any, requireAdmin as any, getContacts as any);
  app.get('/api/contact', authenticateToken as any, requireAdmin as any, getContacts as any);

  // Activity Audit Logs
  app.get('/api/logs', authenticateToken as any, requireAdmin as any, getActivityLogs as any);

  // AI Recommendations
  app.get('/api/recommendations', authenticateToken as any, getRecommendations as any);

  // ==========================================
  // API 404 FALLBACK (Prevents returning HTML to failed /api requests)
  // ==========================================
  app.all('/api/*', (req, res) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  // ==========================================
  // FRONTEND SERVER / VITE MIDDLEWARE
  // ==========================================

  if (process.env.NODE_ENV !== 'production') {
    // Run Vite in development middleware mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start the composite listener
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] BandhuLibrary active at http://localhost:${PORT}`);
  });
}

startServer();
