/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Search, ShieldCheck, Clock, BookOpen, Users, 
  Award, MessageSquare, ChevronDown, Check, Send, 
  Library, HelpCircle, Sparkles 
} from 'lucide-react';
import { Category, Book } from '../types.js';

interface HomeViewProps {
  categories: Category[];
  books: Book[];
  onNavigate: (view: string) => void;
  onSearchQuery: (query: string) => void;
  onSubmitContact: (data: any) => Promise<void>;
  toast: (msg: string, type?: 'success' | 'error') => void;
}

export function HomeView({ 
  categories, books, onNavigate, onSearchQuery, onSubmitContact, toast 
}: HomeViewProps) {
  const [searchVal, setSearchVal] = useState('');
  
  // Contact Form States
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);

  // FAQ open state accordion index
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      onSearchQuery(searchVal.trim());
      onNavigate('books-catalog');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactSubject || !contactMessage) {
      toast('Please fill in all contact fields.', 'error');
      return;
    }
    setContactLoading(true);
    try {
      await onSubmitContact({
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage
      });
      toast('Thank you! Your message was saved successfully.', 'success');
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err: any) {
      toast(err.message || 'Error sending message', 'error');
    } finally {
      setContactLoading(false);
    }
  };

  const stats = [
    { title: 'Total Volume', value: '1,500+', icon: BookOpen, sub: 'Physical books & PDFs' },
    { title: 'Active Students', value: '120+', icon: Users, sub: 'Enrolled on-campus' },
    { title: 'Completed Loans', value: '3,200+', icon: ShieldCheck, sub: 'With zero book loss' },
    { title: 'Subjects & Genres', value: '15+', icon: Library, sub: 'Across 6 faculties' }
  ];

  const benefits = [
    { title: 'Secure Relational Auditing', desc: 'Every borrow, reservation, return, and fine is securely logged and synchronized in real-time.', icon: ShieldCheck },
    { title: 'Extended 14-Day Loans', desc: 'Borrow physical items for up to 2 weeks with immediate online renewals from your user dashboard.', icon: Clock },
    { title: 'Automated Overdue Alarms', desc: 'Avoid massive penalties with our clear daily reminders and fair, automated fine calculation algorithms.', icon: Award }
  ];

  const testimonials = [
    { quote: "BandhuLibrary has completely transformed how I secure reference papers for my computer engineering thesis. Online reservations are seamless!", author: "Marcus Vance", role: "Junior CS Student" },
    { quote: "Being able to immediately check borrow logs and print loan receipts from my personal panel is incredibly neat and saves heaps of administrative overhead.", author: "Elena Rostova", role: "Biochemistry Undergrad" }
  ];

  const faqs = [
    { q: "How do I register for a BandhuLibrary account?", a: "Students can register directly using the SignUp button in the top navigation bar. Enter your campus details, and your account will be immediately activated." },
    { q: "What is the borrowing duration limit?", a: "The standard borrowing term is 14 days. You can extend your term up to three times online from your Student Dashboard before the due date passes." },
    { q: "How are overdue penalties calculated?", a: "If a loan exceeds its due date, a fine of $1.00 per day accumulates until the physical book is returned to the library desk." },
    { q: "Can I reserve out of stock items?", a: "Yes! If a book is currently fully borrowed, clicking 'Reserve' places you in a queue. You will receive an immediate notification when a copy is checked back in." }
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* 1. Hero Section */}
      <section className="relative bg-slate-950 text-white py-20 px-4 overflow-hidden">
        {/* Ambient abstract glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <span className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smarter Campus Asset Distribution</span>
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Unlock the World’s Greatest <br />
              <span className="text-blue-500">Knowledge Reservoirs</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
              Experience the state-of-the-art BandhuLibrary. Search detailed catalogs, reserve incoming copies, renew loans instantly, and audit transactions securely.
            </p>
          </motion.div>

          {/* Search Box */}
          <motion.form 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto flex bg-white rounded-2xl p-1.5 shadow-xl shadow-blue-900/10 border border-slate-200/20"
          >
            <div className="flex-1 flex items-center px-3.5 space-x-2.5">
              <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
              <input 
                type="text" 
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                className="w-full bg-transparent text-slate-800 text-sm outline-none placeholder-slate-400"
                placeholder="Search by Title, Author, Category, or 13-Digit ISBN..."
                required
              />
            </div>
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer"
              id="hero-search-btn"
            >
              Search
            </button>
          </motion.form>
        </div>
      </section>

      {/* 2. Library Statistics Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((st, i) => {
            const Icon = st.icon;
            return (
              <div key={i} className="bg-white border border-slate-200/60 p-5 rounded-2xl shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{st.title}</p>
                  <p className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">{st.value}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{st.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Categories Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Academic Categories</h2>
          <p className="text-slate-400 text-xs mt-1">Browse items matching your curriculum focus</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {categories.slice(0, 6).map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                onSearchQuery(cat.name);
                onNavigate('books-catalog');
              }}
              className="p-4 bg-white border border-slate-200/50 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all text-center space-y-2 cursor-pointer focus:outline-none"
            >
              <div className="mx-auto w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs uppercase font-mono">
                {cat.name.charAt(0)}
              </div>
              <p className="font-bold text-slate-700 text-xs truncate">{cat.name}</p>
              <p className="text-[10px] text-slate-400">{cat.bookCount || 0} Titles</p>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Why Choose Our Library */}
      <section className="bg-slate-100 py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">The BandhuLibrary Advantage</h2>
            <p className="text-slate-400 text-xs max-w-lg mx-auto">Engineered to support high-performance learning and bulletproof academic tracking</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((bf, i) => {
              const Icon = bf.icon;
              return (
                <div key={i} className="p-6 bg-white border border-slate-200/50 rounded-2xl shadow-sm space-y-3 hover:-translate-y-1 transition-transform">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl inline-block">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">{bf.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{bf.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Reader Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Student Testimonials</h2>
          <p className="text-slate-400 text-xs mt-1">What students say about their reading experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="p-5.5 bg-white border border-slate-200/50 rounded-2xl shadow-sm space-y-3 relative">
              <MessageSquare className="h-8 w-8 text-blue-500/10 absolute top-4 right-4" />
              <p className="text-slate-600 text-xs leading-relaxed italic">
                "{t.quote}"
              </p>
              <div>
                <p className="font-bold text-xs text-slate-800">{t.author}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ Accordion */}
      <section className="max-w-3xl mx-auto px-4 space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-xs mt-1">Settle your queries regarding borrowing and penalty rules</p>
        </div>

        <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden divide-y divide-slate-100">
          {faqs.map((faq, idx) => {
            const isOpen = faqOpen === idx;
            return (
              <div key={idx} className="bg-white">
                <button
                  type="button"
                  onClick={() => setFaqOpen(isOpen ? null : idx)}
                  className="w-full px-5 py-4 flex justify-between items-center hover:bg-slate-50/50 transition-colors text-left focus:outline-none cursor-pointer"
                >
                  <span className="font-bold text-slate-700 text-xs sm:text-sm">{faq.q}</span>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-500 leading-relaxed bg-slate-50/20">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. Contact Section */}
      <section className="max-w-3xl mx-auto px-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Get in Touch</h2>
          <p className="text-slate-400 text-xs mt-1">Need a specific book procured? Submit your inquiries below</p>
        </div>

        <form onSubmit={handleContactSubmit} className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Your Name</label>
              <input 
                type="text" 
                value={contactName} 
                onChange={e => setContactName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 outline-none"
                placeholder="John Doe"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Your Email</label>
              <input 
                type="email" 
                value={contactEmail} 
                onChange={e => setContactEmail(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 outline-none"
                placeholder="john@doe.com"
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Subject</label>
            <input 
              type="text" 
              value={contactSubject} 
              onChange={e => setContactSubject(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 outline-none"
              placeholder="e.g. Request for computer science catalog procurement"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Message</label>
            <textarea 
              value={contactMessage} 
              onChange={e => setContactMessage(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none h-28 resize-none"
              placeholder="Write inquiry details here..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={contactLoading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/10 cursor-pointer disabled:opacity-50"
            id="home-contact-submit-btn"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{contactLoading ? 'Transmitting inquiry...' : 'Send Message'}</span>
          </button>
        </form>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200 pt-10 text-center text-xs text-slate-400 space-y-4">
        <div className="flex flex-wrap justify-center items-center gap-6">
          <button onClick={() => onNavigate('home')} className="hover:text-slate-600 cursor-pointer">Home</button>
          <button onClick={() => onNavigate('books-catalog')} className="hover:text-slate-600 cursor-pointer">Books Gallery</button>
          <button onClick={() => onNavigate('about')} className="hover:text-slate-600 cursor-pointer">About Us</button>
          <button onClick={() => onNavigate('contact')} className="hover:text-slate-600 cursor-pointer">Contact</button>
          <button onClick={() => onNavigate('admin-login')} className="text-slate-600 hover:text-slate-900 font-semibold inline-flex items-center space-x-1 cursor-pointer" id="footer-admin-login-btn">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
            <span>Admin Portal Login</span>
          </button>
        </div>
        <p className="max-w-md mx-auto text-[11px] leading-relaxed">
          BandhuLibrary Services is licensed under Apache-2.0. High-performance campus book tracking system, secure JWT session management, automatic fine ledger sync, and print integrations.
        </p>
        <p className="text-[10px]">© {new Date().getFullYear()} BandhuLibrary LMS. All rights reserved.</p>
      </footer>
    </div>
  );
}
