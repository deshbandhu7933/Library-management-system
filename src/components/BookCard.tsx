/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Book, UserRole } from '../types.js';
import { Star, Heart, Bookmark, Edit, Trash2, ShieldCheck, BookmarkCheck } from 'lucide-react';

interface BookCardProps {
  key?: any;
  book: Book;
  userRole?: UserRole | null;
  onViewDetails: (book: Book) => void;
  onBorrow?: (bookId: number) => void;
  onReserve?: (bookId: number) => void;
  onToggleWishlist?: (bookId: number) => void;
  isWishlisted?: boolean;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: number) => void;
}

export default function BookCard({
  book, userRole, onViewDetails, onBorrow, onReserve, onToggleWishlist, isWishlisted = false, onEdit, onDelete
}: BookCardProps) {
  
  const isAvailable = book.availableQuantity > 0;

  // Custom fallback image if coverImage fails to load or is invalid
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all overflow-hidden flex flex-col group h-full">
      {/* Book Cover Container */}
      <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => onViewDetails(book)}>
        <img 
          src={book.coverImage || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400'} 
          alt={book.title} 
          onError={handleImageError}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Floating Category Badge */}
        <span className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wide">
          {book.categoryName}
        </span>

        {/* Wishlist Button (Only for Students) */}
        {userRole === UserRole.STUDENT && onToggleWishlist && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(book.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-xl bg-white/95 backdrop-blur-sm shadow-md hover:scale-110 active:scale-95 transition-transform text-slate-500 hover:text-red-500 cursor-pointer"
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`h-4.5 w-4.5 transition-colors ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
          </button>
        )}
      </div>

      {/* Book Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-3 w-3 ${i < Math.floor(book.rating || 0) ? 'fill-amber-400' : 'text-slate-200'}`} 
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-500">
              {book.rating && book.rating > 0 ? `${book.rating} (${book.reviewsCount || 0})` : 'New Release'}
            </span>
          </div>

          {/* Title & Author */}
          <h4 
            onClick={() => onViewDetails(book)}
            className="font-bold text-slate-800 text-sm hover:text-blue-600 transition-colors line-clamp-1 cursor-pointer"
          >
            {book.title}
          </h4>
          <p className="text-slate-500 text-xs line-clamp-1">By {book.authorName}</p>
        </div>

        {/* Meta Indicators: Shelf & Availability */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Shelf:</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono uppercase">
              {book.shelfNumber || 'N/A'}
            </span>
          </div>

          <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
            isAvailable 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50' 
              : 'bg-rose-50 text-rose-700 border border-rose-200/50'
          }`}>
            {isAvailable ? `${book.availableQuantity} of ${book.quantity} Left` : 'Out of Stock'}
          </span>
        </div>

        {/* Action Button Strip */}
        <div className="pt-1.5 flex gap-1.5">
          {userRole === UserRole.ADMIN ? (
            // Admin actions
            <>
              <button 
                onClick={() => onEdit && onEdit(book)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 px-2.5 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                id={`edit-book-btn-${book.id}`}
              >
                <Edit className="h-3.5 w-3.5" />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => onDelete && onDelete(book.id)}
                className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold p-2 rounded-xl transition-colors"
                id={`delete-book-btn-${book.id}`}
                title="Delete Book"
              >
                <Trash2 className="h-4.5 w-4.5" />
              </button>
            </>
          ) : (
            // Student / Guest Actions
            <>
              <button 
                onClick={() => onViewDetails(book)}
                className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs py-2 rounded-xl transition-colors text-center"
              >
                Details
              </button>
              {userRole === UserRole.STUDENT ? (
                isAvailable ? (
                  <button 
                    onClick={() => onBorrow && onBorrow(book.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded-xl transition-colors shadow-md shadow-blue-500/10 flex items-center justify-center space-x-1"
                    id={`borrow-book-btn-${book.id}`}
                  >
                    <span>Borrow</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => onReserve && onReserve(book.id)}
                    className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 rounded-xl transition-colors shadow-md shadow-amber-500/10 flex items-center justify-center space-x-1"
                    id={`reserve-book-btn-${book.id}`}
                  >
                    <span>Reserve</span>
                  </button>
                )
              ) : (
                <button 
                  onClick={() => onViewDetails(book)}
                  className="flex-1 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs py-2 rounded-xl transition-colors"
                >
                  Join Library
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
