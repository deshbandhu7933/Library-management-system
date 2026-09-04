/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book, Category, Author, UserRole } from '../types.js';
import BookCard from './BookCard.tsx';
import ReviewSection from './ReviewSection.tsx';
import { 
  Search, SlidersHorizontal, BookOpen, AlertCircle, 
  MapPin, Tag, Check, Calendar, HelpCircle, X, Bookmark, 
  Trash2, ShieldCheck, BookmarkCheck 
} from 'lucide-react';

interface BooksCatalogViewProps {
  books: Book[];
  categories: Category[];
  authors: Author[];
  userRole?: UserRole | null;
  onBorrow?: (bookId: number) => void;
  onReserve?: (bookId: number) => void;
  onToggleWishlist?: (bookId: number) => void;
  wishlistIds?: number[];
  onAddReview: (bookId: number, rating: number, comment: string) => Promise<void>;
  onEditBook?: (book: Book) => void;
  onDeleteBook?: (bookId: number) => void;
  initialSearch?: string;
  onClearInitialSearch?: () => void;
}

export function BooksCatalogView({
  books, categories, authors, userRole, onBorrow, onReserve, onToggleWishlist, 
  wishlistIds = [], onAddReview, onEditBook, onDeleteBook, initialSearch = '', onClearInitialSearch
}: BooksCatalogViewProps) {
  
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedAvailability, setSelectedAvailability] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Selected book for details modal overlay
  const [detailBook, setDetailBook] = useState<Book | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
  }, [initialSearch]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedAuthor('');
    setSelectedLanguage('');
    setSelectedAvailability('');
    setSelectedYear('');
    setCurrentPage(1);
    if (onClearInitialSearch) onClearInitialSearch();
  };

  // 1. Apply powerful search & multi-filtering algorithms
  const filteredBooks = books.filter(b => {
    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = b.title.toLowerCase().includes(q) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
        b.authorName.toLowerCase().includes(q) ||
        b.isbn.includes(q) ||
        b.categoryName.toLowerCase().includes(q) ||
        b.publisherName.toLowerCase().includes(q) ||
        b.language.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Dropdown filters
    if (selectedCategory && b.categoryName !== selectedCategory) return false;
    if (selectedAuthor && b.authorName !== selectedAuthor) return false;
    if (selectedLanguage && b.language !== selectedLanguage) return false;
    if (selectedYear && b.publicationYear !== Number(selectedYear)) return false;
    if (selectedAvailability) {
      const isAvail = b.availableQuantity > 0;
      if (selectedAvailability === 'available' && !isAvail) return false;
      if (selectedAvailability === 'borrowed' && isAvail) return false;
    }

    return true;
  });

  // 2. Paginate filtered lists
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage);
  const paginatedBooks = filteredBooks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const languages = Array.from(new Set(books.map(b => b.language)));
  const years = Array.from(new Set(books.map(b => b.publicationYear))).sort((a, b) => b - a);

  const handleViewDetails = (book: Book) => {
    setDetailBook(book);
  };

  const handleCloseDetails = () => {
    setDetailBook(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Books Gallery</h2>
          <p className="text-slate-400 text-xs mt-0.5">Explore physical books and curriculum references</p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 text-xs font-bold border rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer ${
              showFilters 
                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            id="toggle-filters-btn"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>

          <button 
            onClick={handleClearFilters}
            className="px-4 py-2 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Primary Search Input */}
      <form onSubmit={e => e.preventDefault()} className="relative bg-white rounded-2xl border border-slate-200/60 shadow-sm p-1">
        <div className="flex items-center px-3.5 space-x-2.5">
          <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-transparent text-slate-800 text-sm py-3 outline-none placeholder-slate-400"
            placeholder="Type Title, Author, ISBN number, publisher..."
          />
        </div>
      </form>

      {/* Expandable Filtering Panel */}
      {showFilters && (
        <div className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Genre / Category</label>
            <select
              value={selectedCategory}
              onChange={e => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Author */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Author</label>
            <select
              value={selectedAuthor}
              onChange={e => { setSelectedAuthor(e.target.value); setCurrentPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
            >
              <option value="">All Authors</option>
              {authors.map(a => (
                <option key={a.id} value={a.name}>{a.name}</option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Language</label>
            <select
              value={selectedLanguage}
              onChange={e => { setSelectedLanguage(e.target.value); setCurrentPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
            >
              <option value="">All Languages</option>
              {languages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>

          {/* Availability */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">In Stock Availability</label>
            <select
              value={selectedAvailability}
              onChange={e => { setSelectedAvailability(e.target.value); setCurrentPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
            >
              <option value="">All Availability</option>
              <option value="available">In Stock Only</option>
              <option value="borrowed">Out of Stock</option>
            </select>
          </div>

          {/* Year */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Publish Year</label>
            <select
              value={selectedYear}
              onChange={e => { setSelectedYear(e.target.value); setCurrentPage(1); }}
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none"
            >
              <option value="">All Years</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Catalog Results Grid */}
      {filteredBooks.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-3">
          <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No books match your queries.</h4>
          <p className="text-slate-400 text-xs">Try resetting filters or checking spelling.</p>
          <button 
            onClick={handleClearFilters}
            className="mt-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Clear Search & Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-xs font-semibold text-slate-400">Showing {filteredBooks.length} titles</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {paginatedBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                userRole={userRole}
                onViewDetails={handleViewDetails}
                onBorrow={onBorrow}
                onReserve={onReserve}
                onToggleWishlist={onToggleWishlist}
                isWishlisted={wishlistIds.includes(book.id)}
                onEdit={onEditBook}
                onDelete={onDeleteBook}
              />
            ))}
          </div>

          {/* Pagination bar */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              
              <span className="text-xs font-bold text-slate-500">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-bold text-slate-700 disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Book Details Modal Overlay */}
      {detailBook && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="px-6 py-4.5 bg-slate-950 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base leading-none">{detailBook.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5">By {detailBook.authorName} • {detailBook.categoryName}</p>
              </div>
              <button onClick={handleCloseDetails} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[calc(100vh-12rem)] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                {/* Left: Large Cover Image */}
                <div className="aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                  <img 
                    src={detailBook.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'} 
                    alt={detailBook.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Right: Full Specifications */}
                <div className="md:col-span-2 space-y-4">
                  {detailBook.subtitle && (
                    <p className="font-bold text-slate-700 text-sm italic">"{detailBook.subtitle}"</p>
                  )}

                  <div className="grid grid-cols-2 gap-3.5 bg-slate-50 p-4 rounded-2xl text-xs border border-slate-200/50">
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wide">ISBN Code</p>
                      <p className="font-bold text-slate-800 font-mono mt-0.5">{detailBook.isbn}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wide">Shelf Location</p>
                      <p className="font-bold text-slate-800 font-mono mt-0.5">{detailBook.shelfNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wide">Publisher</p>
                      <p className="font-bold text-slate-800 mt-0.5">{detailBook.publisherName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wide">Publish Year</p>
                      <p className="font-bold text-slate-800 mt-0.5">{detailBook.publicationYear} (Ed: {detailBook.edition || '1st'})</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wide">Language / Pages</p>
                      <p className="font-bold text-slate-800 mt-0.5">{detailBook.language} ({detailBook.pages || 'N/A'} pp.)</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wide">Availability State</p>
                      <span className={`inline-block px-2 py-0.5 mt-0.5 font-bold text-[10px] rounded-full ${
                        detailBook.availableQuantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {detailBook.availableQuantity > 0 ? `${detailBook.availableQuantity} of ${detailBook.quantity} Available` : 'Fully Borrowed'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-bold text-slate-800">Book Synopsis</p>
                    <p className="text-xs text-slate-500 leading-relaxed text-justify">
                      {detailBook.description || 'No detailed abstract is available in records.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Subsection */}
              <div className="border-t border-slate-100 pt-5">
                <ReviewSection
                  bookId={detailBook.id}
                  reviews={detailBook.reviews || []}
                  userRole={userRole}
                  onAddReview={(rating, comment) => {
                    onAddReview(detailBook.id, rating, comment);
                    // Sync inside details modal locally
                    const updatedReviews = [{
                      id: Date.now(),
                      userId: 99,
                      userName: 'You',
                      bookId: detailBook.id,
                      rating,
                      comment,
                      createdAt: new Date().toISOString()
                    }, ...(detailBook.reviews || [])];
                    setDetailBook({ ...detailBook, reviews: updatedReviews });
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
