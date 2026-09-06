/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Library, BookOpen, Clock, Heart } from 'lucide-react';

interface ContactViewProps {
  onSubmitContact: (data: any) => Promise<void>;
  toast: (msg: string, type?: 'success' | 'error') => void;
}

export function ContactView({ onSubmitContact, toast }: ContactViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast('Please fill in all mandatory fields.', 'error');
      return;
    }
    setLoading(true);
    try {
      await onSubmitContact({ name, email, phone, subject, message });
      toast('Message dispatched successfully. We will follow up via email.', 'success');
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err: any) {
      toast(err.message || 'Error transmitting message.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-1.5">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Contact Library Services</h2>
        <p className="text-slate-400 text-xs sm:text-sm">Connect with our head catalogers and administrative desks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Details cards */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Inquiry</p>
              <p className="text-sm font-bold text-slate-800 mt-1">support@bandhulibrary.com</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Response within 24 business hours</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hotline Assistance</p>
              <p className="text-sm font-bold text-slate-800 mt-1">+1 (555) 0199</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Mon-Fri 08:00 AM - 06:00 PM EST</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Physical Desk</p>
              <p className="text-sm font-bold text-slate-800 mt-1">Block B, Ground Floor</p>
              <p className="text-[11px] text-slate-400 mt-0.5">University Campus, Sector 4</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Your Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 outline-none"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Your Email *</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 outline-none"
                  placeholder="john@doe.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Phone Number</label>
                <input 
                  type="text" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 outline-none"
                  placeholder="+1 (555) 0122"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Subject *</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:border-blue-500 outline-none"
                  placeholder="Inquiry Topic"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Message Body *</label>
              <textarea 
                value={message} 
                onChange={e => setMessage(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:border-blue-500 outline-none h-28 resize-none"
                placeholder="Type your message details here..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{loading ? 'Dispatched message details...' : 'Submit Inquiry'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export function AboutView() {
  const values = [
    { title: 'Academic Excellence', desc: 'Curating world-class text catalogs supporting deep computer science, technology, classic literature, and science fields.', icon: BookOpen },
    { title: 'Universal Accessibility', desc: 'Promoting free and open digital/physical reference access across student, researcher, and professor cohorts.', icon: Library },
    { title: 'Automated Operations', desc: 'Utilizing modern digital tracking interfaces to manage borrow records, reservation queues, and library receipts.', icon: Clock }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">About BandhuLibrary</h2>
        <p className="text-slate-400 text-xs sm:text-sm">Empowering campus research through state-of-the-art catalog tracking and seamless operation flows since 2012.</p>
      </div>

      {/* Vision & Mission Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm">
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-slate-800">Our Shared Mission</h4>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            BandhuLibrary was founded on the principle that academic references should be completely fluid, organized, and effortlessly auditable. By replacing outdated paper ledger logs with an integrated full-stack relational management ecosystem, we allow students and administrators to focus on what matters most: academic excellence.
          </p>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            We actively coordinate with world-class publishing houses, university faculties, and technical bodies to procure rare research texts, computer coding textbooks, and classic anthologies.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-slate-800">Our Vision For The Future</h4>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
            Our vision is to expand our physical boundaries into a completely decentralized hybrid model, allowing members to access high-res PDFs and borrow physical textbooks via secure RFID lockers.
          </p>
          <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl space-y-2">
            <p className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
              <Heart className="h-4 w-4 fill-blue-800" />
              <span>Campus Impact Stats</span>
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">Active average library desk processing time has been reduced by 85% since launching the automated dashboard portal.</p>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="space-y-8">
        <div className="text-center">
          <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Core Operational Values</h3>
          <p className="text-slate-400 text-xs">The architectural pillars that define our daily operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((v, i) => {
            const Icon = v.icon;
            return (
              <div key={i} className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm text-center space-y-3">
                <div className="mx-auto p-3 bg-blue-50 text-blue-600 rounded-xl inline-block">
                  <Icon className="h-5 w-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{v.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
