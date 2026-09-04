/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book, Author, Category, Publisher } from '../types.js';
import { X, Save, AlertCircle, Sparkles } from 'lucide-react';

interface AdminBookModalProps {
  book: Book | null; // If null, we are in CREATE mode. If present, we are in EDIT mode.
  authors: Author[];
  categories: Category[];
  publishers: Publisher[];
  onClose: () => void;
  onSave: (bookData: any) => void;
}

export default function AdminBookModal({
  book, authors, categories, publishers, onClose, onSave
}: AdminBookModalProps) {
  
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [publisherId, setPublisherId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [publicationYear, setPublicationYear] = useState(new Date().getFullYear());
  const [edition, setEdition] = useState('');
  const [language, setLanguage] = useState('English');
  const [pages, setPages] = useState('');
  const [shelfNumber, setShelfNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (book) {
      setIsbn(book.isbn);
      setTitle(book.title);
      setSubtitle(book.subtitle || '');
      setAuthorId(String(book.authorId));
      setPublisherId(String(book.publisherId));
      setCategoryId(String(book.categoryId));
      setPublicationYear(book.publicationYear);
      setEdition(book.edition || '');
      setLanguage(book.language || 'English');
      setPages(book.pages ? String(book.pages) : '');
      setShelfNumber(book.shelfNumber || '');
      setQuantity(book.quantity);
      setDescription(book.description || '');
      setCoverImage(book.coverImage || '');
    } else {
      // Defaults
      setIsbn('');
      setTitle('');
      setSubtitle('');
      setAuthorId(authors.length > 0 ? String(authors[0].id) : '');
      setPublisherId(publishers.length > 0 ? String(publishers[0].id) : '');
      setCategoryId(categories.length > 0 ? String(categories[0].id) : '');
      setPublicationYear(new Date().getFullYear());
      setEdition('');
      setLanguage('English');
      setPages('');
      setShelfNumber('');
      setQuantity(1);
      setDescription('');
      setCoverImage('');
    }
  }, [book, authors, categories, publishers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isbn || !title || !authorId || !publisherId || !categoryId || !publicationYear || !quantity) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (quantity < 1) {
      setError('Quantity must be at least 1.');
      return;
    }

    onSave({
      isbn,
      title,
      subtitle,
      authorId,
      publisherId,
      categoryId,
      publicationYear,
      edition,
      language,
      pages: pages ? Number(pages) : undefined,
      shelfNumber,
      quantity,
      description,
      coverImage
    });
  };

  const handleGenerateBarcode = () => {
    if (!isbn) {
      setError('Please enter an ISBN first.');
      return;
    }
    // Generate a beautiful mock layout cover using unsplash matching keywords
    const keywords = title ? encodeURIComponent(title.split(' ')[0]) : 'book';
    setCoverImage(`https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400`);
    setShelfNumber(`SF-${title ? title.charAt(0).toUpperCase() : 'A'}${Math.floor(Math.random() * 9) + 1}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-950 text-white flex justify-between items-center">
          <div>
            <h3 className="font-bold text-base">{book ? 'Edit Catalog Entry' : 'Add New Book'}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Maintain physical and digital inventory parameters</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-14rem)] overflow-y-auto">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-2.5 text-xs font-semibold">
              <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Book Title *</label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="e.g. 1984"
                required
              />
            </div>

            {/* Subtitle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Subtitle</label>
              <input 
                type="text" 
                value={subtitle} 
                onChange={e => setSubtitle(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="e.g. A Novel of Social Science Fiction"
              />
            </div>

            {/* ISBN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">ISBN Code *</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={isbn} 
                  onChange={e => setIsbn(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                  placeholder="e.g. 9780451524935"
                  required
                />
                <button 
                  type="button" 
                  onClick={handleGenerateBarcode}
                  className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center space-x-1"
                  title="Auto Generate Details"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Autofill</span>
                </button>
              </div>
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Author *</label>
              <select 
                value={authorId} 
                onChange={e => setAuthorId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                required
              >
                <option value="">-- Select Author --</option>
                {authors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>

            {/* Publisher */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Publisher *</label>
              <select 
                value={publisherId} 
                onChange={e => setPublisherId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                required
              >
                <option value="">-- Select Publisher --</option>
                {publishers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Category *</label>
              <select 
                value={categoryId} 
                onChange={e => setCategoryId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                required
              >
                <option value="">-- Select Category --</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Publication Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Publication Year *</label>
              <input 
                type="number" 
                value={publicationYear} 
                onChange={e => setPublicationYear(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                min="1000"
                max={new Date().getFullYear()}
                required
              />
            </div>

            {/* Edition */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Edition</label>
              <input 
                type="text" 
                value={edition} 
                onChange={e => setEdition(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="e.g. 50th Anniversary"
              />
            </div>

            {/* Language */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Language</label>
              <input 
                type="text" 
                value={language} 
                onChange={e => setLanguage(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="e.g. English"
              />
            </div>

            {/* Pages */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Page Count</label>
              <input 
                type="number" 
                value={pages} 
                onChange={e => setPages(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="e.g. 328"
              />
            </div>

            {/* Shelf Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Shelf Number</label>
              <input 
                type="text" 
                value={shelfNumber} 
                onChange={e => setShelfNumber(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="e.g. SF-C1"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Quantity (Stock) *</label>
              <input 
                type="number" 
                value={quantity} 
                onChange={e => setQuantity(Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                min="1"
                required
              />
            </div>
          </div>

          {/* Cover Image URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Cover Image URL</label>
            <input 
              type="text" 
              value={coverImage} 
              onChange={e => setCoverImage(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
              placeholder="e.g. https://images.unsplash.com/..."
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Synopsis / Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-24 resize-none"
              placeholder="Synopsis details..."
            />
          </div>

          {/* Action Footer */}
          <div className="pt-4.5 border-t border-slate-100 flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Book</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
