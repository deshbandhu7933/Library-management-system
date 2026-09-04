/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Review, UserRole } from '../types.js';
import { Star, MessageSquare, AlertCircle, Calendar, CheckCircle } from 'lucide-react';

interface ReviewSectionProps {
  bookId: number;
  reviews: Review[];
  userRole?: UserRole | null;
  onAddReview: (rating: number, comment: string) => void;
}

export default function ReviewSection({
  bookId, reviews, userRole, onAddReview
}: ReviewSectionProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5 stars.');
      return;
    }

    if (!comment.trim()) {
      setError('Please write a short comment about your experience with this book.');
      return;
    }

    onAddReview(rating, comment.trim());
    setComment('');
    setSuccess('Thank you! Your book review has been published.');
    setTimeout(() => setSuccess(''), 4000);
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  };

  const avgRating = getAverageRating();

  return (
    <div className="space-y-5 pt-4">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
        <MessageSquare className="h-4.5 w-4.5 text-blue-600" />
        <h4 className="font-bold text-slate-800 text-sm">Reader Reviews & Discussions</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Statistics Dashboard */}
        <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Average Score</p>
          <p className="text-4xl font-extrabold text-slate-800 tracking-tight">{avgRating > 0 ? avgRating : '0.0'}</p>
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4.5 w-4.5 ${i < Math.floor(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-400 font-medium">Based on {reviews.length} user reviews</p>
        </div>

        {/* Reviews List */}
        <div className="md:col-span-2 space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
              Be the first to review this book! Readers look for your opinions.
            </div>
          ) : (
            <div className="space-y-3.5 max-h-72 overflow-y-auto pr-1">
              {reviews.map(r => (
                <div key={r.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <img 
                        src={r.userPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} 
                        alt={r.userName} 
                        referrerPolicy="no-referrer"
                        className="h-7.5 w-7.5 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-bold text-xs text-slate-800">{r.userName}</p>
                        <span className="text-[9px] text-slate-400 font-semibold flex items-center gap-1.5 mt-0.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`h-3 w-3 ${i < r.rating ? 'fill-amber-400' : 'text-slate-100'}`} 
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{r.comment}"
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Add Review Panel (Only for Students) */}
          {userRole === UserRole.STUDENT ? (
            <form onSubmit={handleReviewSubmit} className="p-4 border border-blue-100 bg-blue-50/30 rounded-2xl space-y-3">
              <p className="text-xs font-bold text-blue-900">Post Your Review</p>

              {error && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-[11px] font-semibold rounded-lg flex items-center space-x-1.5">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-lg flex items-center space-x-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-500 font-medium">Your Rating:</span>
                <div className="flex text-amber-400 space-x-0.5">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-0.5 hover:scale-125 active:scale-95 transition-transform focus:outline-none cursor-pointer"
                    >
                      <Star className={`h-4.5 w-4.5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-blue-500 rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-blue-500/10 h-20 resize-none"
                  placeholder="Share details of your experience with this book. Is it insightful? Chilling? Educational?"
                  required
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-500/10 cursor-pointer"
                id="submit-book-review-btn"
              >
                Publish Review
              </button>
            </form>
          ) : (
            !userRole && (
              <div className="p-3 bg-slate-50 border border-slate-200 text-center rounded-xl text-xs text-slate-500 font-medium">
                Please register or log in to rate and review this catalog item.
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
