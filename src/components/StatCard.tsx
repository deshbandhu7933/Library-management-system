/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtext?: string;
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate' | 'indigo';
}

export default function StatCard({ 
  title, value, icon: Icon, subtext, color = 'blue' 
}: StatCardProps) {
  
  const colors = {
    blue: {
      bg: 'bg-blue-50/50',
      border: 'border-blue-100',
      iconBg: 'bg-blue-100 text-blue-600',
      bar: 'bg-blue-600'
    },
    emerald: {
      bg: 'bg-emerald-50/50',
      border: 'border-emerald-100',
      iconBg: 'bg-emerald-100 text-emerald-600',
      bar: 'bg-emerald-600'
    },
    amber: {
      bg: 'bg-amber-50/50',
      border: 'border-amber-100',
      iconBg: 'bg-amber-100 text-amber-600',
      bar: 'bg-amber-600'
    },
    rose: {
      bg: 'bg-rose-50/50',
      border: 'border-rose-100',
      iconBg: 'bg-rose-100 text-rose-600',
      bar: 'bg-rose-600'
    },
    slate: {
      bg: 'bg-slate-100/50',
      border: 'border-slate-200',
      iconBg: 'bg-slate-200 text-slate-700',
      bar: 'bg-slate-700'
    },
    indigo: {
      bg: 'bg-indigo-50/50',
      border: 'border-indigo-100',
      iconBg: 'bg-indigo-100 text-indigo-600',
      bar: 'bg-indigo-600'
    }
  };

  const style = colors[color];

  return (
    <div className={`p-5 bg-white border ${style.border} rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between h-32`}>
      {/* Accent strip on left side */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${style.bar}`} />

      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</p>
          <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</p>
        </div>
        <div className={`p-2.5 rounded-xl ${style.iconBg} shadow-sm`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {subtext && (
        <p className="text-xs text-slate-500 font-medium truncate flex items-center mt-2">
          {subtext}
        </p>
      )}
    </div>
  );
}
