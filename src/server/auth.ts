/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, UserRole } from '../types.js';
import { usersDB } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'library-management-system-secret-key-2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: UserRole;
  };
}

/**
 * Generate a secure JWT Token for a user session
 */
export function generateToken(user: User): string {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Authenticate incoming HTTP request by verifying JWT Bearer Token
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <Token>"

  if (!token) {
    return res.status(401).json({ message: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired session token' });
    }
    
    // Check if user still exists and is active
    const users = usersDB.getAll();
    const user = users.find(u => u.id === decoded.id);
    
    if (!user) {
      return res.status(403).json({ message: 'User account no longer exists' });
    }
    
    if (user.status === 'inactive') {
      return res.status(403).json({ message: 'Your account has been deactivated. Please contact support.' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    
    next();
  });
}

/**
 * Optional authentication: attaches user if token is valid, but allows guest access
 */
export function optionalAuthenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (!err && decoded) {
      const users = usersDB.getAll();
      const user = users.find(u => u.id === decoded.id);
      if (user && user.status !== 'inactive') {
        req.user = {
          id: user.id,
          email: user.email,
          role: user.role
        };
      }
    }
    next();
  });
}

/**
 * Authorize only Admin/Librarian roles
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ message: 'Access denied: Admin permissions required' });
  }
  next();
}

/**
 * Authorize only Student/User roles (or Admin)
 */
export function requireStudent(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(403).json({ message: 'Access denied: Authentication required' });
  }
  next();
}
