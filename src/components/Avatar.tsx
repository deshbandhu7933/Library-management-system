import React from 'react';

interface AvatarProps {
  firstName: string;
  lastName: string;
  className?: string;
}

export function Avatar({ firstName, lastName, className = 'h-8.5 w-8.5' }: AvatarProps) {
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();
  
  // Deterministic color based on name
  const colors = ['bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-600', 'bg-purple-500', 'bg-pink-500'];
  const colorIndex = (firstName.length + lastName.length) % colors.length;
  const bgColor = colors[colorIndex];

  return (
    <div className={`flex items-center justify-center text-white font-bold text-xs ${bgColor} ${className}`}>
      {initials}
    </div>
  );
}
