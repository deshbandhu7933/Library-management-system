/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, Bell, Menu, X, User as UserIcon, 
  LogOut, Settings, ListFilter, Library, FileText, ShieldCheck 
} from 'lucide-react';
import { User, Notification } from '../types.js';
import { Avatar } from './Avatar.js';

interface NavbarProps {
  user: User | null;
  onNavigate: (view: string) => void;
  currentView: string;
  onLogout: () => void;
  notifications: Notification[];
  onMarkNotificationsRead: () => void;
}

export default function Navbar({ 
  user, onNavigate, currentView, onLogout, notifications, onMarkNotificationsRead 
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Close dropdowns on route changes
  useEffect(() => {
    setIsOpen(false);
    setShowNotif(false);
    setShowProfile(false);
  }, [currentView]);

  const handleNotifClick = () => {
    setShowNotif(!showNotif);
    setShowProfile(false);
    if (!showNotif && unreadCount > 0) {
      onMarkNotificationsRead();
    }
  };

  const handleProfileClick = () => {
    setShowProfile(!showProfile);
    setShowNotif(false);
  };

  const getNavLinkClass = (viewName: string) => {
    return currentView === viewName
      ? 'text-blue-600 font-semibold px-3 py-2 rounded-lg bg-blue-50/50'
      : 'text-slate-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors';
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button 
              onClick={() => onNavigate('home')} 
              className="flex items-center space-x-2.5 group cursor-pointer focus:outline-none"
              id="navbar-logo-btn"
            >
              <div className="p-2 bg-blue-600 rounded-xl text-white group-hover:scale-110 transition-transform shadow-md shadow-blue-500/20">
                <Library className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                Bandhu<span className="text-blue-600">Library</span>
              </span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <button onClick={() => onNavigate('home')} className={getNavLinkClass('home')} id="nav-home">Home</button>
            <button onClick={() => onNavigate('books-catalog')} className={getNavLinkClass('books-catalog')} id="nav-books">Books Gallery</button>
            <button onClick={() => onNavigate('about')} className={getNavLinkClass('about')} id="nav-about">About Us</button>
            <button onClick={() => onNavigate('contact')} className={getNavLinkClass('contact')} id="nav-contact">Contact</button>

            {user ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-200">
                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={handleNotifClick}
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors relative focus:outline-none"
                    id="notif-bell-btn"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  <AnimatePresence>
                    {showNotif && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                          <span className="font-bold text-slate-800 text-sm">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full font-semibold">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                          {notifications.length === 0 ? (
                            <div className="p-6 text-center text-slate-400 text-sm">
                              No notifications yet
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} className="p-3.5 hover:bg-slate-50/80 transition-colors">
                                <div className="flex items-start justify-between">
                                  <p className="font-semibold text-slate-800 text-xs">{n.title}</p>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(n.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-slate-600 text-xs mt-1 leading-relaxed">{n.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Card Trigger */}
                <div className="relative">
                  <button 
                    onClick={handleProfileClick}
                    className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
                    id="profile-trigger-btn"
                  >
                    <Avatar firstName={user.firstName} lastName={user.lastName} />
                  </button>

                  {/* Profile Dropdown */}
                  <AnimatePresence>
                    {showProfile && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden z-50"
                      >
                        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                          <p className="font-bold text-slate-800 text-sm leading-none">{user.firstName} {user.lastName}</p>
                          <p className="text-slate-400 text-xs mt-1.5 truncate">{user.email}</p>
                          <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200/50">
                            {user.role === 'admin' ? 'Librarian/Admin' : 'Student'}
                          </span>
                        </div>
                        <div className="p-1.5">
                          <button 
                            onClick={() => onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard')}
                            className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition-colors text-sm"
                            id="profile-dashboard-btn"
                          >
                            <UserIcon className="h-4 w-4" />
                            <span>My Dashboard</span>
                          </button>
                          <button 
                            onClick={onLogout}
                            className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors text-sm"
                            id="profile-logout-btn"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-4 border-l border-slate-200">
                <button 
                  onClick={() => onNavigate('login')} 
                  className="px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  id="nav-login-btn"
                >
                  Log In
                </button>
                <button 
                  onClick={() => onNavigate('admin-login')} 
                  className="inline-flex items-center space-x-1.5 px-3 py-2 text-sm font-semibold text-slate-800 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                  id="nav-admin-login-btn"
                  title="Log In as Administrator"
                >
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  <span>Login as Admin</span>
                </button>
                <button 
                  onClick={() => onNavigate('register')} 
                  className="px-3.5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 cursor-pointer"
                  id="nav-register-btn"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="p-2 text-slate-600 rounded-lg focus:outline-none hover:bg-slate-100"
              id="mobile-hamburger-btn"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 shadow-lg overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <button onClick={() => onNavigate('home')} className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm">Home</button>
              <button onClick={() => onNavigate('books-catalog')} className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm">Books Gallery</button>
              <button onClick={() => onNavigate('about')} className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm">About Us</button>
              <button onClick={() => onNavigate('contact')} className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm">Contact</button>
              
              {user ? (
                <div className="pt-4 mt-4 border-t border-slate-200">
                  <div className="px-4 py-2">
                    <p className="font-bold text-slate-800 text-sm">{user.firstName} {user.lastName}</p>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">{user.email}</p>
                  </div>
                  <button onClick={() => onNavigate(user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard')} className="w-full text-left px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-100 text-sm flex items-center space-x-2">
                    <UserIcon className="h-4 w-4" />
                    <span>My Dashboard</span>
                  </button>
                  <button onClick={onLogout} className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 text-sm flex items-center space-x-2">
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="pt-4 mt-4 border-t border-slate-200 flex flex-col space-y-2 px-4">
                  <button onClick={() => onNavigate('login')} className="w-full px-4 py-2 text-center text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer">
                    Log In
                  </button>
                  <button onClick={() => onNavigate('admin-login')} className="w-full px-4 py-2 text-center text-sm font-semibold text-slate-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 rounded-lg transition-colors flex items-center justify-center space-x-1.5 cursor-pointer">
                    <ShieldCheck className="h-4 w-4 text-amber-600" />
                    <span>Login as Admin</span>
                  </button>
                  <button onClick={() => onNavigate('register')} className="w-full px-4 py-2 text-center text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer">
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
