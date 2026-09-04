/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Author, Category } from '../types.js';
import { X, Save, AlertCircle } from 'lucide-react';

interface AdminAuthorCategoryModalProps {
  mode: 'author' | 'category';
  item: Author | Category | null; // If null, we are adding a new one
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function AdminAuthorCategoryModal({
  mode, item, onClose, onSave
}: AdminAuthorCategoryModalProps) {
  
  const [name, setName] = useState('');
  const [bio, setBio] = useState(''); // biography for author, description for category
  const [birthDate, setBirthDate] = useState(''); // only for author
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name);
      if (mode === 'author') {
        setBio((item as Author).bio || '');
        setBirthDate((item as Author).birthDate || '');
      } else {
        setBio((item as Category).description || '');
      }
    } else {
      setName('');
      setBio('');
      setBirthDate('');
    }
  }, [item, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name) {
      setError('Name is required.');
      return;
    }

    if (mode === 'author') {
      onSave({
        name,
        bio,
        birthDate: birthDate || undefined
      });
    } else {
      onSave({
        name,
        description: bio
      });
    }
  };

  const titleText = item 
    ? `Edit ${mode === 'author' ? 'Author' : 'Category'}` 
    : `Add New ${mode === 'author' ? 'Author' : 'Category'}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 text-white flex justify-between items-center">
          <h3 className="font-bold text-sm tracking-tight">{titleText}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer">
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-xl flex items-center space-x-2 text-xs font-semibold">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {mode === 'author' ? 'Author Name' : 'Category Name'} *
            </label>
            <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              placeholder={mode === 'author' ? 'e.g. George Orwell' : 'e.g. Science Fiction'}
              required
            />
          </div>

          {/* Birth Date Field (Author Only) */}
          {mode === 'author' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Birth Date</label>
              <input 
                type="date" 
                value={birthDate} 
                onChange={e => setBirthDate(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          )}

          {/* Bio or Description Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              {mode === 'author' ? 'Biography' : 'Description'}
            </label>
            <textarea 
              value={bio} 
              onChange={e => setBio(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none h-24 resize-none"
              placeholder={mode === 'author' ? 'Write biography details...' : 'Describe category characteristics...'}
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center space-x-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
