/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Response } from 'express';
import bcryptjs from 'bcryptjs';
import { AuthenticatedRequest } from './auth.js';
import { 
  User, UserRole, Author, Category, Publisher, Book, 
  BorrowRecord, Reservation, Fine, Notification, 
  ContactSubmission, Review, ActivityLog, WishlistItem 
} from '../types.js';
import {
  usersDB, authorsDB, categoriesDB, publishersDB, booksDB,
  borrowDB, reservationsDB, finesDB, notificationsDB,
  reviewsDB, contactsDB, logsDB, wishlistDB,
  logActivity, updateFinesAndOverdueStatus
} from './db.js';
import { generateBookRecommendations } from './gemini.js';

// ==========================================
// AUTH CONTROLLERS
// ==========================================

export async function register(req: AuthenticatedRequest, res: Response) {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      role,
      studentId,
      major,
      gradeLevel,
      teacherId,
      department,
      officeNumber,
      designation
    } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'All standard fields are required' });
    }

    const users = usersDB.getAll();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const nextId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    const passwordHash = bcryptjs.hashSync(password, 10);

    const targetRole = role === 'teacher' ? UserRole.TEACHER : UserRole.STUDENT;

    const newUser: User = {
      id: nextId,
      email: email.toLowerCase(),
      firstName,
      lastName,
      role: targetRole,
      phone,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    if (targetRole === UserRole.STUDENT) {
      newUser.studentId = studentId || '';
      newUser.major = major || '';
      newUser.gradeLevel = gradeLevel || '';
    } else if (targetRole === UserRole.TEACHER) {
      newUser.teacherId = teacherId || '';
      newUser.department = department || '';
      newUser.officeNumber = officeNumber || '';
      newUser.designation = designation || '';
    }

    // Save user profile
    users.push(newUser);
    usersDB.save(users);

    // Save user password securely
    const passwords = usersDB.getPasswords();
    passwords[nextId] = passwordHash;
    usersDB.savePasswords(passwords);

    // Seed welcoming notification
    const notifications = notificationsDB.getAll();
    const roleLabel = targetRole === UserRole.TEACHER ? 'teacher' : 'student';
    notifications.unshift({
      id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
      userId: nextId,
      title: 'Welcome to our Library!',
      message: `Hello ${firstName}, your ${roleLabel} account is active. You can now browse catalog, reserve and borrow books.`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    });
    notificationsDB.save(notifications);

    logActivity(newUser.id, `${targetRole === UserRole.TEACHER ? 'Teacher' : 'Student'} Registered`, `${targetRole === UserRole.TEACHER ? 'Teacher' : 'Student'} ${firstName} ${lastName} created an account.`);

    return res.status(201).json({ message: 'Registration successful', userId: newUser.id });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function login(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const users = usersDB.getAll();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    const passwords = usersDB.getPasswords();
    const passwordHash = passwords[user.id];

    if (!passwordHash || !bcryptjs.compareSync(password, passwordHash)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token (handled locally)
    const { generateToken } = await import('./auth.js');
    const token = generateToken(user);

    logActivity(user.id, 'User Login', `${user.firstName} logged into the system.`);

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        status: user.status,
        profilePhoto: user.profilePhoto,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function forgotPassword(req: AuthenticatedRequest, res: Response) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const users = usersDB.getAll();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      // Return 200/success for security reasons, so users cannot enumerate emails
      return res.json({ message: 'If the email exists, a password reset link has been dispatched.' });
    }

    // Create custom recovery log and notification
    logActivity(user.id, 'Password Reset Dispatched', `Mock email recovery triggered for ${email}`);
    
    return res.json({ 
      message: 'If the email exists, a password reset link has been dispatched.', 
      resetToken: `RESET-${user.id}-MOCK` // Handled gracefully in frontend for mock resets
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function resetPassword(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ message: 'User ID and new password are required' });
    }

    const users = usersDB.getAll();
    const user = users.find(u => u.id === Number(userId));

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordHash = bcryptjs.hashSync(newPassword, 10);
    const passwords = usersDB.getPasswords();
    passwords[user.id] = passwordHash;
    usersDB.savePasswords(passwords);

    logActivity(user.id, 'Password Reset Complete', `Successfully reset security password.`);

    return res.json({ message: 'Password reset successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// ==========================================
// DASHBOARD ANALYTICS
// ==========================================

export async function getDashboardStats(req: AuthenticatedRequest, res: Response) {
  try {
    updateFinesAndOverdueStatus(); // Trigger automated fine checks

    const books = booksDB.getAll();
    const users = usersDB.getAll();
    const authors = authorsDB.getAll();
    const categories = categoriesDB.getAll();
    const borrows = borrowDB.getAll();
    const reservations = reservationsDB.getAll();
    const fines = finesDB.getAll();

    const currentUserId = req.user?.id;
    const isLibrarian = req.user?.role === UserRole.ADMIN;

    if (isLibrarian) {
      // 1. Admin Statistics
      const totalBooks = books.reduce((sum, b) => sum + b.quantity, 0);
      const availableBooks = books.reduce((sum, b) => sum + b.availableQuantity, 0);
      const borrowedBooks = borrows.filter(b => b.status === 'borrowed' || b.status === 'overdue' || b.status === 'renewed').length;
      const reservedBooks = reservations.filter(r => r.status === 'pending' || r.status === 'available').length;
      const registeredUsers = users.filter(u => u.role === UserRole.STUDENT).length;
      const totalAuthors = authors.length;
      const totalCategories = categories.length;
      const fineCollected = fines
        .filter(f => f.status === 'paid' || f.status === 'partially_paid')
        .reduce((sum, f) => sum + f.paidAmount, 0);

      // Simple analytics datasets for Recharts
      // Monthly borrows over the past 6 months
      const monthlyBorrow: Record<string, number> = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      borrows.forEach(b => {
        const date = new Date(b.borrowDate);
        const monthName = months[date.getMonth()];
        monthlyBorrow[monthName] = (monthlyBorrow[monthName] || 0) + 1;
      });

      const borrowChart = Object.keys(monthlyBorrow).map(key => ({
        month: key,
        borrows: monthlyBorrow[key]
      }));

      // Popular categories chart
      const catBorrowCounts: Record<string, number> = {};
      borrows.forEach(b => {
        const book = books.find(bk => bk.id === b.bookId);
        if (book) {
          catBorrowCounts[book.categoryName] = (catBorrowCounts[book.categoryName] || 0) + 1;
        }
      });
      const popularCategoriesChart = Object.keys(catBorrowCounts).map(key => ({
        name: key,
        count: catBorrowCounts[key]
      }));

      // Active members / Top members ranking
      const memberBorrows: Record<string, { name: string, count: number, email: string }> = {};
      borrows.forEach(b => {
        const user = users.find(u => u.id === b.userId);
        const name = user ? `${user.firstName} ${user.lastName}` : b.userName;
        if (!memberBorrows[b.userId]) {
          memberBorrows[b.userId] = { name, count: 0, email: b.userEmail };
        }
        memberBorrows[b.userId].count += 1;
      });
      const activeMembers = Object.values(memberBorrows)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return res.json({
        totalBooks,
        availableBooks,
        borrowedBooks,
        reservedBooks,
        registeredUsers,
        totalAuthors,
        totalCategories,
        fineCollected,
        charts: {
          monthlyBorrow: borrowChart,
          popularCategories: popularCategoriesChart,
          activeMembers
        }
      });
    } else {
      // 2. Student Statistics
      const userBorrows = borrows.filter(b => b.userId === currentUserId);
      const activeUserBorrows = userBorrows.filter(b => b.status === 'borrowed' || b.status === 'overdue' || b.status === 'renewed');
      const dueCount = userBorrows.filter(b => b.status === 'overdue').length;
      const returnedCount = userBorrows.filter(b => b.status === 'returned').length;
      const totalFineUnpaid = fines
        .filter(f => f.userId === currentUserId && f.status === 'unpaid')
        .reduce((sum, f) => sum + (f.fineAmount - f.paidAmount - f.waivedAmount), 0);

      const recentActivities = borrows
        .filter(b => b.userId === currentUserId)
        .slice(0, 5)
        .map(b => ({
          id: b.id,
          bookTitle: b.bookTitle,
          action: b.status === 'returned' ? 'Returned' : b.status === 'overdue' ? 'Overdue!' : 'Borrowed',
          date: b.status === 'returned' ? b.returnDate : b.borrowDate,
          status: b.status
        }));

      return res.json({
        borrowedCount: activeUserBorrows.length,
        dueCount,
        returnedCount,
        fineAmount: totalFineUnpaid,
        recentActivities
      });
    }
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// ==========================================
// BOOK CONTROLLERS
// ==========================================

export async function getBooks(req: AuthenticatedRequest, res: Response) {
  try {
    const { search, category, author, availability, language, year } = req.query;
    let books = booksDB.getAll();

    // Support powerful text searching
    if (search) {
      const q = String(search).toLowerCase();
      books = books.filter(b => 
        b.title.toLowerCase().includes(q) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
        b.authorName.toLowerCase().includes(q) ||
        b.isbn.includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        b.publisherName.toLowerCase().includes(q) ||
        b.language.toLowerCase().includes(q)
      );
    }

    // Support filters
    if (category) {
      books = books.filter(b => b.categoryName === String(category));
    }
    if (author) {
      books = books.filter(b => b.authorName === String(author));
    }
    if (availability) {
      const isAvail = String(availability) === 'available';
      books = books.filter(b => isAvail ? b.availableQuantity > 0 : b.availableQuantity === 0);
    }
    if (language) {
      books = books.filter(b => b.language.toLowerCase() === String(language).toLowerCase());
    }
    if (year) {
      books = books.filter(b => b.publicationYear === Number(year));
    }

    return res.json(books);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function getBookDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const books = booksDB.getAll();
    const book = books.find(b => b.id === id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Load reviews associated with the book
    const reviews = reviewsDB.getAll().filter(r => r.bookId === id);

    return res.json({
      ...book,
      reviews
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function createBook(req: AuthenticatedRequest, res: Response) {
  try {
    const { 
      isbn, title, subtitle, authorId, publisherId, categoryId, 
      publicationYear, edition, language, pages, shelfNumber, quantity, description, coverImage 
    } = req.body;

    if (!isbn || !title || !authorId || !publisherId || !categoryId || !publicationYear || !quantity) {
      return res.status(400).json({ message: 'Required details are missing.' });
    }

    const books = booksDB.getAll();
    if (books.find(b => b.isbn === isbn)) {
      return res.status(400).json({ message: 'ISBN already exists in catalog.' });
    }

    const authors = authorsDB.getAll();
    const author = authors.find(a => a.id === Number(authorId));
    const categories = categoriesDB.getAll();
    const category = categories.find(c => c.id === Number(categoryId));
    const publishers = publishersDB.getAll();
    const publisher = publishers.find(p => p.id === Number(publisherId));

    if (!author || !category || !publisher) {
      return res.status(400).json({ message: 'Invalid author, category or publisher selected' });
    }

    const nextId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
    const newBook: Book = {
      id: nextId,
      isbn,
      title,
      subtitle,
      authorId: Number(authorId),
      authorName: author.name,
      publisherId: Number(publisherId),
      publisherName: publisher.name,
      categoryId: Number(categoryId),
      categoryName: category.name,
      publicationYear: Number(publicationYear),
      edition,
      language: language || 'English',
      pages: pages ? Number(pages) : undefined,
      shelfNumber,
      quantity: Number(quantity),
      availableQuantity: Number(quantity),
      description,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
      status: 'available',
      rating: 0,
      reviewsCount: 0,
      createdAt: new Date().toISOString()
    };

    books.push(newBook);
    booksDB.save(books);

    logActivity(req.user?.id, 'Book Created', `Added "${title}" to the inventory.`);

    return res.status(201).json({ message: 'Book added successfully', book: newBook });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function updateBook(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const books = booksDB.getAll();
    const index = books.findIndex(b => b.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const { 
      isbn, title, subtitle, authorId, publisherId, categoryId, 
      publicationYear, edition, language, pages, shelfNumber, quantity, description, coverImage 
    } = req.body;

    const authors = authorsDB.getAll();
    const author = authors.find(a => a.id === Number(authorId));
    const categories = categoriesDB.getAll();
    const category = categories.find(c => c.id === Number(categoryId));
    const publishers = publishersDB.getAll();
    const publisher = publishers.find(p => p.id === Number(publisherId));

    if (!author || !category || !publisher) {
      return res.status(400).json({ message: 'Invalid author, category or publisher relationship.' });
    }

    const currentBook = books[index];
    const originalQty = currentBook.quantity;
    const diff = Number(quantity) - originalQty;

    const updatedBook: Book = {
      ...currentBook,
      isbn,
      title,
      subtitle,
      authorId: Number(authorId),
      authorName: author.name,
      publisherId: Number(publisherId),
      publisherName: publisher.name,
      categoryId: Number(categoryId),
      categoryName: category.name,
      publicationYear: Number(publicationYear),
      edition,
      language,
      pages: pages ? Number(pages) : undefined,
      shelfNumber,
      quantity: Number(quantity),
      availableQuantity: Math.max(0, currentBook.availableQuantity + diff),
      description,
      coverImage: coverImage || currentBook.coverImage,
      status: (currentBook.availableQuantity + diff) > 0 ? 'available' : 'borrowed'
    };

    books[index] = updatedBook;
    booksDB.save(books);

    logActivity(req.user?.id, 'Book Updated', `Modified detail for: "${title}".`);

    return res.json({ message: 'Book updated successfully', book: updatedBook });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function deleteBook(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const books = booksDB.getAll();
    const book = books.find(b => b.id === id);

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Check if book is currently on loan
    const borrows = borrowDB.getAll();
    const activeBorrows = borrows.filter(b => b.bookId === id && (b.status === 'borrowed' || b.status === 'renewed' || b.status === 'overdue'));

    if (activeBorrows.length > 0) {
      return res.status(400).json({ message: 'Cannot delete book: Book has active borrows pending return.' });
    }

    const updatedBooks = books.filter(b => b.id !== id);
    booksDB.save(updatedBooks);

    logActivity(req.user?.id, 'Book Deleted', `Deleted "${book.title}" from catalog.`);

    return res.json({ message: 'Book deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// ==========================================
// AUTHOR & CATEGORY CONTROLLERS
// ==========================================

export async function getAuthors(req: AuthenticatedRequest, res: Response) {
  const authors = authorsDB.getAll();
  const books = booksDB.getAll();
  const enhancedAuthors = authors.map(a => ({
    ...a,
    bookCount: books.filter(b => b.authorId === a.id).length
  }));
  return res.json(enhancedAuthors);
}

export async function createAuthor(req: AuthenticatedRequest, res: Response) {
  const { name, bio, birthDate } = req.body;
  if (!name) return res.status(400).json({ message: 'Author name is required' });

  const authors = authorsDB.getAll();
  if (authors.find(a => a.name.toLowerCase() === name.toLowerCase())) {
    return res.status(400).json({ message: 'Author already exists' });
  }

  const nextId = authors.length > 0 ? Math.max(...authors.map(a => a.id)) + 1 : 1;
  const newAuthor: Author = { id: nextId, name, bio, birthDate };
  authors.push(newAuthor);
  authorsDB.save(authors);

  logActivity(req.user?.id, 'Author Added', `Added author ${name}`);
  return res.status(201).json(newAuthor);
}

export async function updateAuthor(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const { name, bio, birthDate } = req.body;
  const authors = authorsDB.getAll();
  const idx = authors.findIndex(a => a.id === id);

  if (idx === -1) return res.status(404).json({ message: 'Author not found' });

  authors[idx] = { ...authors[idx], name, bio, birthDate };
  authorsDB.save(authors);

  // Sync books matching this author
  const books = booksDB.getAll();
  books.forEach(b => {
    if (b.authorId === id) b.authorName = name;
  });
  booksDB.save(books);

  logActivity(req.user?.id, 'Author Updated', `Updated author ${name}`);
  return res.json(authors[idx]);
}

export async function deleteAuthor(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const books = booksDB.getAll();
  if (books.find(b => b.authorId === id)) {
    return res.status(400).json({ message: 'Cannot delete author: Author has books associated in catalog.' });
  }

  const authors = authorsDB.getAll();
  authorsDB.save(authors.filter(a => a.id !== id));
  logActivity(req.user?.id, 'Author Deleted', `Deleted author ID: ${id}`);
  return res.json({ message: 'Author deleted successfully' });
}

export async function getCategories(req: AuthenticatedRequest, res: Response) {
  const categories = categoriesDB.getAll();
  const books = booksDB.getAll();
  const enhancedCats = categories.map(c => ({
    ...c,
    bookCount: books.filter(b => b.categoryId === c.id).length
  }));
  return res.json(enhancedCats);
}

export async function createCategory(req: AuthenticatedRequest, res: Response) {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Category name is required' });

  const categories = categoriesDB.getAll();
  if (categories.find(c => c.name.toLowerCase() === name.toLowerCase())) {
    return res.status(400).json({ message: 'Category already exists' });
  }

  const nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
  const newCat: Category = { id: nextId, name, description };
  categories.push(newCat);
  categoriesDB.save(categories);

  logActivity(req.user?.id, 'Category Added', `Added category: ${name}`);
  return res.status(201).json(newCat);
}

export async function updateCategory(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const { name, description } = req.body;
  const categories = categoriesDB.getAll();
  const idx = categories.findIndex(c => c.id === id);

  if (idx === -1) return res.status(404).json({ message: 'Category not found' });

  categories[idx] = { ...categories[idx], name, description };
  categoriesDB.save(categories);

  // Sync books matching this category
  const books = booksDB.getAll();
  books.forEach(b => {
    if (b.categoryId === id) b.categoryName = name;
  });
  booksDB.save(books);

  logActivity(req.user?.id, 'Category Updated', `Updated category: ${name}`);
  return res.json(categories[idx]);
}

export async function deleteCategory(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const books = booksDB.getAll();
  if (books.find(b => b.categoryId === id)) {
    return res.status(400).json({ message: 'Cannot delete category: Category has books associated in catalog.' });
  }

  const categories = categoriesDB.getAll();
  categoriesDB.save(categories.filter(c => c.id !== id));
  logActivity(req.user?.id, 'Category Deleted', `Deleted category ID: ${id}`);
  return res.json({ message: 'Category deleted successfully' });
}

// ==========================================
// PUBLISHER CONTROLLERS
// ==========================================

export async function getPublishers(req: AuthenticatedRequest, res: Response) {
  const publishers = publishersDB.getAll();
  return res.json(publishers);
}

// ==========================================
// MEMBERS CONTROLLERS
// ==========================================

export async function getMembers(req: AuthenticatedRequest, res: Response) {
  const users = usersDB.getAll().filter(u => u.role !== UserRole.ADMIN);
  return res.json(users);
}

export async function changeMemberStatus(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const { status } = req.body;
  if (status !== 'active' && status !== 'inactive') {
    return res.status(400).json({ message: 'Invalid status' });
  }

  const users = usersDB.getAll();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Member not found' });

  users[idx].status = status;
  usersDB.save(users);

  logActivity(req.user?.id, 'Member Status Changed', `Modified status of ${users[idx].firstName} to ${status}`);
  return res.json(users[idx]);
}

export async function deleteMember(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const users = usersDB.getAll();
    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if member has active borrow records
    const borrows = borrowDB.getAll();
    const activeBorrows = borrows.filter(b => b.userId === id && b.status !== 'returned');
    if (activeBorrows.length > 0) {
      return res.status(400).json({ message: 'Cannot delete member: User has books currently borrowed.' });
    }

    const updatedUsers = users.filter(u => u.id !== id);
    usersDB.save(updatedUsers);

    logActivity(req.user?.id, 'Member Deleted', `Deleted member record for ${user.firstName} ${user.lastName}`);
    return res.json({ message: 'Member deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function updateMemberProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    const { 
      firstName, lastName, phone, profilePhoto, password,
      studentId, major, gradeLevel,
      teacherId, department, officeNumber, designation
    } = req.body;

    // A student/teacher can only edit their own profile. Admin can edit any profile.
    if (req.user?.role !== UserRole.ADMIN && req.user?.id !== id) {
      return res.status(403).json({ message: 'Forbidden: You cannot modify other users profiles.' });
    }

    const users = usersDB.getAll();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return res.status(404).json({ message: 'User not found' });

    const user = users[idx];

    users[idx] = {
      ...user,
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone !== undefined ? phone : user.phone,
      profilePhoto: profilePhoto !== undefined ? profilePhoto : user.profilePhoto
    };

    if (user.role === UserRole.STUDENT) {
      if (studentId !== undefined) users[idx].studentId = studentId;
      if (major !== undefined) users[idx].major = major;
      if (gradeLevel !== undefined) users[idx].gradeLevel = gradeLevel;
    } else if (user.role === UserRole.TEACHER) {
      if (teacherId !== undefined) users[idx].teacherId = teacherId;
      if (department !== undefined) users[idx].department = department;
      if (officeNumber !== undefined) users[idx].officeNumber = officeNumber;
      if (designation !== undefined) users[idx].designation = designation;
    }

    usersDB.save(users);

    if (password) {
      const bcryptjs = await import('bcryptjs');
      const passwordHash = bcryptjs.default.hashSync(password, 10);
      const passwords = usersDB.getPasswords();
      passwords[id] = passwordHash;
      usersDB.savePasswords(passwords);
    }

    logActivity(req.user?.id, 'Profile Updated', `Updated profile and enrollment info for ${users[idx].firstName} ${users[idx].lastName}`);

    return res.json({ message: 'Profile updated successfully', user: users[idx] });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// ==========================================
// BORROW & RENEW CONTROLLERS
// ==========================================

export async function getBorrowRecords(req: AuthenticatedRequest, res: Response) {
  updateFinesAndOverdueStatus(); // Sync before loading
  
  const borrows = borrowDB.getAll();
  if (req.user?.role === UserRole.ADMIN) {
    return res.json(borrows);
  } else {
    return res.json(borrows.filter(b => b.userId === req.user?.id));
  }
}

export async function issueBook(req: AuthenticatedRequest, res: Response) {
  try {
    const { email, bookId } = req.body; // In manual issues, Admin provides email. In student self-borrow, email matches session.

    const targetEmail = req.user?.role === UserRole.ADMIN ? email : req.user?.email;
    const isSelfBorrow = req.user?.role !== UserRole.ADMIN;

    const users = usersDB.getAll();
    const user = users.find(u => u.email.toLowerCase() === targetEmail.toLowerCase());

    if (!user) {
      return res.status(404).json({ message: 'Student email not found in records.' });
    }

    if (user.status === 'inactive') {
      return res.status(400).json({ message: 'Student account is suspended or inactive.' });
    }

    const books = booksDB.getAll();
    const bookIndex = books.findIndex(b => b.id === Number(bookId));
    if (bookIndex === -1) {
      return res.status(404).json({ message: 'Book not found' });
    }

    const book = books[bookIndex];
    if (book.availableQuantity <= 0) {
      return res.status(400).json({ message: 'Book currently out of stock.' });
    }

    // Check borrow limits (max 5 books)
    const borrows = borrowDB.getAll();
    const activeUserBorrows = borrows.filter(b => b.userId === user.id && (b.status === 'borrowed' || b.status === 'renewed' || b.status === 'overdue'));

    if (activeUserBorrows.length >= 5) {
      return res.status(400).json({ message: 'Limit exceeded: Members can only borrow up to 5 books concurrently.' });
    }

    // Check if the same user already has the same book borrowed and not yet returned
    const alreadyBorrowed = borrows.some(b => b.userId === user.id && b.bookId === book.id && b.status !== 'returned');
    if (alreadyBorrowed) {
      return res.status(400).json({ message: 'This member has already borrowed this book and has not returned it yet.' });
    }

    // Decrement stock
    book.availableQuantity -= 1;
    if (book.availableQuantity === 0) {
      book.status = 'borrowed';
    }
    booksDB.save(books);

    // Create loan record
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14); // 14-day borrowing loan period

    const nextId = borrows.length > 0 ? Math.max(...borrows.map(b => b.id)) + 1 : 1;
    const newRecord: BorrowRecord = {
      id: nextId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.authorName,
      bookCover: book.coverImage,
      borrowDate: today.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'borrowed',
      renewalsCount: 0,
      fineAmount: 0,
      fine: 0,
      createdAt: today.toISOString(),
      updatedAt: today.toISOString()
    } as any;

    borrows.unshift(newRecord);
    borrowDB.save(borrows);

    // Append Notification
    const notifications = notificationsDB.getAll();
    notifications.unshift({
      id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
      userId: user.id,
      title: 'Book Issued Successfully',
      message: `You have borrowed "${book.title}". Please return or renew on/before the due date: ${dueDate.toLocaleDateString()}`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    });
    notificationsDB.save(notifications);

    logActivity(req.user?.id, 'Book Issued', `Book "${book.title}" was issued to ${user.email}.`);

    return res.status(201).json({ message: 'Book issued successfully', loan: newRecord });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function renewBook(req: AuthenticatedRequest, res: Response) {
  try {
    const borrowId = Number(req.body.borrowId);
    const borrows = borrowDB.getAll();
    const index = borrows.findIndex(b => b.id === borrowId);

    if (index === -1) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    const loan = borrows[index];

    // Authorization checks
    if (req.user?.role !== UserRole.ADMIN && req.user?.id !== loan.userId) {
      return res.status(403).json({ message: 'Forbidden: You cannot renew other members loans.' });
    }

    if (loan.status === 'returned') {
      return res.status(400).json({ message: 'Book has already been returned.' });
    }

    if (loan.renewalsCount >= 3) {
      return res.status(400).json({ message: 'Max limit reached: Books can only be renewed up to 3 times.' });
    }

    // Check if overdue. If overdue, member must pay fine first.
    if (loan.status === 'overdue') {
      return res.status(400).json({ message: 'Cannot renew: Loan is overdue. Please settle overdue fines and return the book.' });
    }

    // Extend due date by 14 days
    const currentDueDate = new Date(loan.dueDate);
    currentDueDate.setDate(currentDueDate.getDate() + 14);

    loan.dueDate = currentDueDate.toISOString().split('T')[0];
    loan.status = 'renewed';
    loan.renewalsCount += 1;

    borrowDB.save(borrows);

    // Notify student
    const notifications = notificationsDB.getAll();
    notifications.unshift({
      id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
      userId: loan.userId,
      title: 'Loan Renewed Successfully',
      message: `Your loan for "${loan.bookTitle}" has been extended. New due date is: ${currentDueDate.toLocaleDateString()}`,
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    });
    notificationsDB.save(notifications);

    logActivity(req.user?.id, 'Loan Renewed', `Extended loan period for "${loan.bookTitle}".`);

    return res.json({ message: 'Book loan renewed successfully', loan });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function returnBook(req: AuthenticatedRequest, res: Response) {
  try {
    const borrowId = Number(req.body.borrowId);
    const borrows = borrowDB.getAll();
    const index = borrows.findIndex(b => b.id === borrowId);

    if (index === -1) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    const loan = borrows[index];
    if (loan.status === 'returned') {
      return res.status(400).json({ message: 'Book has already been returned.' });
    }

    // Increment availability
    const books = booksDB.getAll();
    const bookIndex = books.findIndex(b => b.id === loan.bookId);
    if (bookIndex !== -1) {
      const book = books[bookIndex];
      book.availableQuantity = Math.min(book.quantity, book.availableQuantity + 1);
      book.status = 'available';
      booksDB.save(books);
    }

    // Finalize loan
    const today = new Date();
    loan.returnDate = today.toISOString().split('T')[0];
    const prevStatus = loan.status;
    loan.status = 'returned';

    // Calculate final fine
    const dueDate = new Date(loan.dueDate);
    dueDate.setHours(0,0,0,0);
    const returnDateObj = new Date(loan.returnDate);
    returnDateObj.setHours(0,0,0,0);
    let finalFine = 0;
    if (returnDateObj > dueDate) {
      const diffTime = returnDateObj.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      finalFine = diffDays * 10;
    }
    loan.fineAmount = finalFine;
    (loan as any).fine = finalFine;
    (loan as any).updatedAt = today.toISOString();

    borrowDB.save(borrows);

    // Sync fine record if any
    const fines = finesDB.getAll();
    const fine = fines.find(f => f.borrowRecordId === loan.id);
    if (fine) {
      if (fine.status === 'unpaid') {
        fine.fineAmount = finalFine;
      }
      finesDB.save(fines);
    }

    // Mark corresponding fine as unpaid, wait! If it had fine, fine record stays unpaid but amount freezes.
    // Notify user
    const notifications = notificationsDB.getAll();
    notifications.unshift({
      id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
      userId: loan.userId,
      title: 'Book Returned Successfully',
      message: `We have successfully checked in "${loan.bookTitle}". Thank you!`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    });
    notificationsDB.save(notifications);

    logActivity(req.user?.id, 'Book Returned', `Checked in "${loan.bookTitle}" from student ID: ${loan.userId}.`);

    return res.json({ message: 'Book returned successfully', loan });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// ==========================================
// RESERVATIONS CONTROLLERS
// ==========================================

export async function getReservations(req: AuthenticatedRequest, res: Response) {
  const reservations = reservationsDB.getAll();
  if (req.user?.role === UserRole.ADMIN) {
    return res.json(reservations);
  } else {
    return res.json(reservations.filter(r => r.userId === req.user?.id));
  }
}

export async function reserveBook(req: AuthenticatedRequest, res: Response) {
  try {
    const { bookId } = req.body;
    const userId = req.user?.id;
    const users = usersDB.getAll();
    const user = users.find(u => u.id === userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const books = booksDB.getAll();
    const book = books.find(b => b.id === Number(bookId));
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Ensure member has no active reservation for the same book
    const reservations = reservationsDB.getAll();
    const existing = reservations.find(r => r.userId === userId && r.bookId === book.id && (r.status === 'pending' || r.status === 'available'));
    if (existing) {
      return res.status(400).json({ message: 'You have already placed a reservation for this book.' });
    }

    const today = new Date();
    const expiry = new Date();
    expiry.setDate(today.getDate() + 3); // Reservation valid for 3 days

    const nextId = reservations.length > 0 ? Math.max(...reservations.map(r => r.id)) + 1 : 1;
    const newReservation: Reservation = {
      id: nextId,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userEmail: user.email,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.authorName,
      bookCover: book.coverImage,
      reservationDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      status: book.availableQuantity > 0 ? 'available' : 'pending' // If in stock, it's immediately available to pick up!
    };

    reservations.unshift(newReservation);
    reservationsDB.save(reservations);

    logActivity(userId, 'Book Reserved', `Placed reservation on "${book.title}".`);

    return res.status(201).json({ message: 'Reservation placed successfully', reservation: newReservation });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function cancelReservation(req: AuthenticatedRequest, res: Response) {
  try {
    const reservationId = Number(req.params.id);
    const reservations = reservationsDB.getAll();
    const index = reservations.findIndex(r => r.id === reservationId);

    if (index === -1) return res.status(404).json({ message: 'Reservation not found' });

    const reservation = reservations[index];

    if (req.user?.role !== UserRole.ADMIN && req.user?.id !== reservation.userId) {
      return res.status(403).json({ message: 'Forbidden: You cannot cancel other members reservations.' });
    }

    reservation.status = 'cancelled';
    reservationsDB.save(reservations);

    logActivity(req.user?.id, 'Reservation Cancelled', `Cancelled reservation for "${reservation.bookTitle}".`);

    return res.json({ message: 'Reservation cancelled successfully', reservation });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// ==========================================
// FINES CONTROLLERS
// ==========================================

export async function getFines(req: AuthenticatedRequest, res: Response) {
  updateFinesAndOverdueStatus();
  const fines = finesDB.getAll();
  if (req.user?.role === UserRole.ADMIN) {
    return res.json(fines);
  } else {
    return res.json(fines.filter(f => f.userId === req.user?.id));
  }
}

export async function payFine(req: AuthenticatedRequest, res: Response) {
  try {
    const fineId = Number(req.params.id);
    const fines = finesDB.getAll();
    const index = fines.findIndex(f => f.id === fineId);

    if (index === -1) return res.status(404).json({ message: 'Fine record not found' });

    const fine = fines[index];
    if (fine.status === 'paid' || fine.status === 'waived') {
      return res.status(400).json({ message: 'Fine has already been settled.' });
    }

    fine.paidAmount = fine.fineAmount;
    fine.status = 'paid';
    fine.paymentDate = new Date().toISOString().split('T')[0];

    finesDB.save(fines);

    logActivity(req.user?.id, 'Fine Paid', `Fine of $${fine.fineAmount.toFixed(2)} settled for "${fine.bookTitle}".`);

    return res.json({ message: 'Fine settled successfully', fine });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function waiveFine(req: AuthenticatedRequest, res: Response) {
  try {
    const fineId = Number(req.params.id);
    const fines = finesDB.getAll();
    const index = fines.findIndex(f => f.id === fineId);

    if (index === -1) return res.status(404).json({ message: 'Fine record not found' });

    const fine = fines[index];
    if (fine.status === 'paid' || fine.status === 'waived') {
      return res.status(400).json({ message: 'Fine has already been settled.' });
    }

    fine.waivedAmount = fine.fineAmount;
    fine.status = 'waived';
    fine.paymentDate = new Date().toISOString().split('T')[0];

    finesDB.save(fines);

    logActivity(req.user?.id, 'Fine Waived', `Librarian waived fine of $${fine.fineAmount.toFixed(2)} for "${fine.bookTitle}".`);

    return res.json({ message: 'Fine waived successfully', fine });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// ==========================================
// REVIEWS CONTROLLERS
// ==========================================

export async function createReview(req: AuthenticatedRequest, res: Response) {
  try {
    const bookId = Number(req.params.id);
    const { rating, comment } = req.body;
    const userId = req.user?.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Invalid rating. Please rate between 1 and 5.' });
    }

    const books = booksDB.getAll();
    const bookIndex = books.findIndex(b => b.id === bookId);
    if (bookIndex === -1) return res.status(404).json({ message: 'Book not found' });

    const users = usersDB.getAll();
    const user = users.find(u => u.id === userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const reviews = reviewsDB.getAll();
    // Check if already reviewed
    const existingIdx = reviews.findIndex(r => r.userId === userId && r.bookId === bookId);

    const newReview: Review = {
      id: reviews.length > 0 ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
      userPhoto: user.profilePhoto,
      bookId,
      rating: Number(rating),
      comment,
      createdAt: new Date().toISOString()
    };

    if (existingIdx !== -1) {
      reviews[existingIdx] = newReview;
    } else {
      reviews.push(newReview);
    }
    reviewsDB.save(reviews);

    // Recalculate book ratings
    const bookReviews = reviews.filter(r => r.bookId === bookId);
    const sumRatings = bookReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Number((sumRatings / bookReviews.length).toFixed(1));

    books[bookIndex].rating = avgRating;
    books[bookIndex].reviewsCount = bookReviews.length;
    booksDB.save(books);

    logActivity(userId, 'Book Reviewed', `Rated "${books[bookIndex].title}" as ${rating} stars.`);

    return res.status(201).json({ message: 'Review posted successfully', review: newReview, book: books[bookIndex] });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// ==========================================
// WISHLIST CONTROLLERS
// ==========================================

export async function getWishlist(req: AuthenticatedRequest, res: Response) {
  const list = wishlistDB.getAll().filter(w => w.userId === req.user?.id);
  return res.json(list);
}

export async function addToWishlist(req: AuthenticatedRequest, res: Response) {
  try {
    const { bookId } = req.body;
    const userId = req.user?.id;

    const books = booksDB.getAll();
    const book = books.find(b => b.id === Number(bookId));
    if (!book) return res.status(404).json({ message: 'Book not found' });

    const list = wishlistDB.getAll();
    const exists = list.find(w => w.userId === userId && w.bookId === book.id);
    if (exists) {
      return res.status(400).json({ message: 'Book is already in your wishlist.' });
    }

    const nextId = list.length > 0 ? Math.max(...list.map(l => l.id)) + 1 : 1;
    const newItem: WishlistItem = {
      id: nextId,
      userId: userId!,
      bookId: book.id,
      bookTitle: book.title,
      bookAuthor: book.authorName,
      bookCover: book.coverImage,
      addedAt: new Date().toISOString()
    };

    list.push(newItem);
    wishlistDB.save(list);

    return res.status(201).json(newItem);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function removeFromWishlist(req: AuthenticatedRequest, res: Response) {
  const id = Number(req.params.id);
  const list = wishlistDB.getAll();
  const filtered = list.filter(w => !(w.id === id && w.userId === req.user?.id));
  wishlistDB.save(filtered);
  return res.json({ message: 'Removed from wishlist successfully' });
}

// ==========================================
// CONTACT CONTROLLERS
// ==========================================

export async function getContacts(req: AuthenticatedRequest, res: Response) {
  const messages = contactsDB.getAll();
  return res.json(messages);
}

export async function createContact(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Please fill in all mandatory fields.' });
    }

    const submissions = contactsDB.getAll();
    const nextId = submissions.length > 0 ? Math.max(...submissions.map(s => s.id)) + 1 : 1;

    const newContact: ContactSubmission = {
      id: nextId,
      name,
      email,
      phone,
      subject,
      message,
      status: 'unread',
      createdAt: new Date().toISOString()
    };

    submissions.unshift(newContact);
    contactsDB.save(submissions);

    logActivity(undefined, 'Contact Inquiry', `Form submitted by "${name}" regarding "${subject}".`);

    return res.status(201).json({ message: 'Message submitted successfully. Our team will contact you shortly!' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// ==========================================
// NOTIFICATION CONTROLLERS
// ==========================================

export async function getNotifications(req: AuthenticatedRequest, res: Response) {
  const notifications = notificationsDB.getAll().filter(n => n.userId === req.user?.id);
  return res.json(notifications);
}

export async function markNotificationsRead(req: AuthenticatedRequest, res: Response) {
  const notifications = notificationsDB.getAll();
  notifications.forEach(n => {
    if (n.userId === req.user?.id) {
      n.isRead = true;
    }
  });
  notificationsDB.save(notifications);
  return res.json({ message: 'All notifications marked as read' });
}

export async function clearNotifications(req: AuthenticatedRequest, res: Response) {
  const notifications = notificationsDB.getAll();
  const filtered = notifications.filter(n => n.userId !== req.user?.id);
  notificationsDB.save(filtered);
  return res.json({ message: 'All notifications cleared' });
}

// ==========================================
// ACTIVITY LOG CONTROLLERS
// ==========================================

export async function getActivityLogs(req: AuthenticatedRequest, res: Response) {
  const logs = logsDB.getAll();
  return res.json(logs);
}

// ==========================================
// AI RECOMMENDATIONS CONTROLLERS
// ==========================================

export async function getRecommendations(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. User session not found.' });
    }

    const books = booksDB.getAll();
    const userBorrows = borrowDB.getAll().filter(b => b.userId === userId);
    const userWishlist = wishlistDB.getAll().filter(w => w.userId === userId);

    const historyList = userBorrows.map(b => ({
      bookTitle: b.bookTitle,
      bookAuthor: b.bookAuthor
    }));

    const wishlistList = userWishlist.map(w => ({
      bookTitle: w.bookTitle,
      bookAuthor: w.bookAuthor
    }));

    const recommendations = await generateBookRecommendations(books, historyList, wishlistList);

    const recommendedBooks = recommendations.map(rec => {
      const book = books.find(b => b.id === rec.bookId);
      if (!book) return null;
      return {
        ...book,
        reason: rec.reason
      };
    }).filter(b => b !== null);

    return res.json(recommendedBooks);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

// ==========================================
// NEW CUSTOM BORROW & RETURN OPERATIONS ENDPOINTS
// ==========================================

export async function getBorrowRecordDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const id = Number(req.params.id);
    updateFinesAndOverdueStatus();
    const records = borrowDB.getAll();
    const record = records.find(r => r.id === id);
    if (!record) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }
    if (req.user?.role !== UserRole.ADMIN && req.user?.id !== record.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    return res.json(record);
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function returnBookById(req: AuthenticatedRequest, res: Response) {
  try {
    const borrowId = Number(req.params.id);
    const borrows = borrowDB.getAll();
    const index = borrows.findIndex(b => b.id === borrowId);

    if (index === -1) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }

    const loan = borrows[index];
    if (loan.status === 'returned') {
      return res.status(400).json({ message: 'Book has already been returned.' });
    }

    // Increment availability
    const books = booksDB.getAll();
    const bookIndex = books.findIndex(b => b.id === loan.bookId);
    if (bookIndex !== -1) {
      const book = books[bookIndex];
      book.availableQuantity = Math.min(book.quantity, book.availableQuantity + 1);
      book.status = 'available';
      booksDB.save(books);
    }

    // Finalize loan
    const today = new Date();
    loan.returnDate = today.toISOString().split('T')[0];
    const prevStatus = loan.status;
    loan.status = 'returned';

    // Calculate final fine
    const dueDate = new Date(loan.dueDate);
    dueDate.setHours(0,0,0,0);
    const returnDateObj = new Date(loan.returnDate);
    returnDateObj.setHours(0,0,0,0);
    let finalFine = 0;
    if (returnDateObj > dueDate) {
      const diffTime = returnDateObj.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      finalFine = diffDays * 10;
    }
    loan.fineAmount = finalFine;
    (loan as any).fine = finalFine;
    (loan as any).updatedAt = today.toISOString();

    borrowDB.save(borrows);

    // Sync fine record if any
    const fines = finesDB.getAll();
    const fine = fines.find(f => f.borrowRecordId === loan.id);
    if (fine) {
      if (fine.status === 'unpaid') {
        fine.fineAmount = finalFine;
      }
      finesDB.save(fines);
    }

    // Notify user
    const notifications = notificationsDB.getAll();
    notifications.unshift({
      id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
      userId: loan.userId,
      title: 'Book Returned Successfully',
      message: `We have successfully checked in "${loan.bookTitle}". Thank you!`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    });
    notificationsDB.save(notifications);

    logActivity(req.user?.id, 'Book Returned', `Checked in "${loan.bookTitle}" from student ID: ${loan.userId}.`);

    return res.json({ message: 'Book returned successfully', loan });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function updateFinesEndpoint(req: AuthenticatedRequest, res: Response) {
  try {
    updateFinesAndOverdueStatus();
    return res.json({ status: 'success', message: 'Fines updated successfully' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

export async function getDashboardStatsCustom(req: AuthenticatedRequest, res: Response) {
  try {
    updateFinesAndOverdueStatus();
    const borrows = borrowDB.getAll();
    const fines = finesDB.getAll();
    
    const totalBorrowed = borrows.filter(b => b.status === 'borrowed' || b.status === 'renewed' || b.status === 'overdue').length;
    const totalReturned = borrows.filter(b => b.status === 'returned').length;
    const overdueCount = borrows.filter(b => b.status === 'overdue').length;
    
    const todayStr = new Date().toISOString().split('T')[0];
    const dueTodayCount = borrows.filter(b => b.status !== 'returned' && b.dueDate === todayStr).length;
    
    const totalFineCollected = fines.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.fineAmount, 0);

    return res.json({
      totalBorrowed,
      totalReturned,
      overdueCount,
      dueTodayCount,
      totalFineCollected
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

