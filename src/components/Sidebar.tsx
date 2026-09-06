/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, BookOpen, Clock, Calendar, 
  DollarSign, Heart, User, Users, Feather, 
  Layers, Inbox, History, ShieldAlert, LogOut 
} from 'lucide-react';
import { UserRole } from '../types.js';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadInquiriesCount?: number;
  unpaidFinesCount?: number;
}

export default function Sidebar({ 
  role, activeTab, setActiveTab, unreadInquiriesCount = 0, unpaidFinesCount = 0 
}: SidebarProps) {
  
  // Student specific navigation tabs
  const studentTabs = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'borrows', name: 'My Loans & History', icon: Clock },
    { id: 'reservations', name: 'Reservations', icon: Calendar },
    { id: 'fines', name: 'My Fines', icon: DollarSign, badge: unpaidFinesCount > 0 ? `$${unpaidFinesCount}` : null },
    { id: 'wishlist', name: 'My Wishlist', icon: Heart },
    { id: 'profile', name: 'Profile Settings', icon: User }
  ];

  // Admin specific navigation tabs
  const adminTabs = [
    { id: 'overview', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', name: 'Books Catalog', icon: BookOpen },
    { id: 'authors', name: 'Authors Desk', icon: Feather },
    { id: 'categories', name: 'Categories', icon: Layers },
    { id: 'members', name: 'Members Log', icon: Users },
    { id: 'borrow', name: 'Issue & Returns', icon: Clock },
    { id: 'reservations', name: 'Reservations', icon: Calendar },
    { id: 'fines', name: 'Fines Ledger', icon: DollarSign },
    { id: 'inquiries', name: 'Messages Inbox', icon: Inbox, badge: unreadInquiriesCount > 0 ? unreadInquiriesCount : null },
    { id: 'logs', name: 'System Audits', icon: History }
  ];

  const currentTabs = role === UserRole.ADMIN ? adminTabs : studentTabs;

  return (
    <div className="w-full md:w-64 bg-slate-900 text-slate-300 md:min-h-[calc(100vh-4rem)] flex flex-col shadow-xl">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950/40">
        <p className="text-xs uppercase font-semibold text-slate-500 tracking-wider">Navigation Menu</p>
        <p className="font-bold text-white text-sm mt-1">
          {role === UserRole.ADMIN ? 'Librarian Workspace' : 'Student Portal'}
        </p>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        {currentTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' 
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              id={`sidebar-tab-${tab.id}`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{tab.name}</span>
              </div>
              {tab.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-blue-600' : 'bg-blue-600/20 text-blue-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Branding Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 text-center">
        <p className="text-[10px] text-slate-500 font-medium">BandhuLibrary LMS • Version 2.0.0</p>
        <p className="text-[9px] text-slate-600 mt-1">UTC Connection Secured</p>
      </div>
    </div>
  );
}
