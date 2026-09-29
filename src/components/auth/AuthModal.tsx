'use client';

import React, { useState } from 'react';
import type { User } from '@/types';
import { isValidEmail, validatePassword, getInitials } from '@/lib/utils';
import { Modal } from '../common/Modal';
import { IconCheck } from '../icons/Icons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onUpdateUser: (user: User) => void;
}

export function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'profile'>('profile');
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState<User['role']>(currentUser.role);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isValidEmail(email)) {
      setError('Please provide a valid institutional email address.');
      return;
    }

    if (mode === 'signup' || mode === 'signin') {
      const passErr = validatePassword(password || 'Password123');
      if (passErr && mode === 'signup') {
        setError(passErr);
        return;
      }
    }

    const updated: User = {
      ...currentUser,
      name: name.trim() || 'Educator',
      email: email.trim(),
      avatarInitials: getInitials(name.trim() || 'Educator'),
      role,
    };

    onUpdateUser(updated);
    setSuccess('Teacher credentials updated successfully.');
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'profile'
          ? 'Educator Profile & Preferences'
          : mode === 'signin'
          ? 'Educator Sign In'
          : 'Create Educator Account'
      }
      maxWidth="500px"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Mode Tabs */}
        <div className="flex gap-2 border-b pb-2 mb-2" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'profile' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              setMode('profile');
              setError(null);
            }}
          >
            Profile Settings
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'signin' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`btn btn-sm ${mode === 'signup' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
          >
            New Registration
          </button>
        </div>

        {error && (
          <div className="alert alert-error text-xs">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success text-xs">
            <IconCheck size={14} /> {success}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="auth-full-name" className="form-label form-label-required">Full Name</label>
          <input
            id="auth-full-name"
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="auth-email" className="form-label form-label-required">Institutional Email</label>
          <input
            id="auth-email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label htmlFor="auth-user-role" className="form-label">Role</label>
            <select
              id="auth-user-role"
              className="select"
              value={role}
              onChange={(e) => setRole(e.target.value as User['role'])}
            >
              <option value="teacher">Classroom Teacher</option>
              <option value="admin">Curriculum Lead / Admin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="auth-access-level" className="form-label">Access Level</label>
            <input
              id="auth-access-level"
              type="text"
              className="input"
              value="Full Generation & Review"
              disabled
            />
          </div>
        </div>

        {mode !== 'profile' && (
          <div className="form-group">
            <label htmlFor="auth-password-input" className="form-label form-label-required">Password</label>
            <input
              id="auth-password-input"
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <span className="form-hint">At least 8 characters with 1 capital and 1 number.</span>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            <IconCheck size={16} /> Save &amp; Continue
          </button>
        </div>
      </form>
    </Modal>
  );
}
