/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  STUDENT = 'student',
  TEACHER = 'teacher'
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  status: 'active' | 'inactive';
  profilePhoto?: string;
  createdAt: string;
  studentId?: string;
  major?: string;
  gradeLevel?: string;
  teacherId?: string;
  department?: string;
  officeNumber?: string;
  designation?: string;
}

export interface Author {
  id: number;
  name: string;
  bio?: string;
  birthDate?: string;
  bookCount?: number;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  bookCount?: number;
}

export interface Publisher {
  id: number;
  name: string;
  address?: string;
  contactPhone?: string;
}

export interface Book {
  id: number;
  isbn: string;
  title: string;
  subtitle?: string;
  authorId: number;
  authorName: string;
  publisherId: number;
  publisherName: string;
  categoryId: number;
  categoryName: string;
  publicationYear: number;
  edition?: string;
  language: string;
  pages?: number;
  shelfNumber?: string;
  quantity: number;
  availableQuantity: number;
  description?: string;
  coverImage?: string;
  status: 'available' | 'borrowed' | 'reserved' | 'lost';
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
}

export interface BorrowRecord {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'renewed' | 'overdue';
  renewalsCount: number;
  fineAmount: number;
}

export interface Reservation {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
  reservationDate: string;
  expiryDate: string;
  status: 'pending' | 'available' | 'fulfilled' | 'cancelled' | 'expired';
  queuePosition?: number;
}

export interface Fine {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  borrowRecordId: number;
  bookTitle: string;
  fineAmount: number;
  paidAmount: number;
  waivedAmount: number;
  paymentDate?: string;
  status: 'unpaid' | 'paid' | 'partially_paid' | 'waived';
}

export type ContactMessage = ContactSubmission;
export type AuditLog = ActivityLog;

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
}

export interface ContactSubmission {
  id: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export interface Review {
  id: number;
  userId: number;
  userName: string;
  userPhoto?: string;
  bookId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ActivityLog {
  id: number;
  userId?: number;
  userName?: string;
  action: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface WishlistItem {
  id: number;
  userId: number;
  bookId: number;
  bookTitle: string;
  bookAuthor: string;
  bookCover?: string;
  addedAt: string;
}

export interface DashboardStats {
  // Admin stats
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  reservedBooks: number;
  registeredUsers: number;
  totalAuthors: number;
  totalCategories: number;
  fineCollected: number;
  
  // Student stats
  borrowedCount: number;
  dueCount: number;
  returnedCount: number;
  fineAmount: number;
}
