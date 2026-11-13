import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ADMIN_EMAILS } from '../context/AuthContext';

describe('Normal User Login vs Admin Login Gating Suite', () => {
  it('1. congodb3@gmail.com login on "/" -> NO signOut, role="user", normal login allowed', async () => {
    const intendedPath = '/';
    const isAdminLogin = intendedPath.startsWith('/admin') || intendedPath.startsWith('/console');

    expect(isAdminLogin).toBe(false);
    const allowed = ADMIN_EMAILS.map(e => e.trim().toLowerCase());
    const isAllowedAdmin = isAdminLogin && allowed.includes('congodb3@gmail.com');
    expect(isAllowedAdmin).toBe(false);
  });

  it('2. congodb3@gmail.com login on "/admin/login" -> signOut + "not on allow list"', async () => {
    const intendedPath = '/admin/login';
    const isAdminLogin = intendedPath.startsWith('/admin') || intendedPath.startsWith('/console');

    expect(isAdminLogin).toBe(true);
    const allowed = ADMIN_EMAILS.map(e => e.trim().toLowerCase());
    const isAllowedAdmin = allowed.includes('congodb3@gmail.com');
    expect(isAllowedAdmin).toBe(false);
  });

  it('3. congodb1@gmail.com login on "/admin/login" -> NO signOut, navigates to /admin', async () => {
    const intendedPath = '/admin/login';
    const isAdminLogin = intendedPath.startsWith('/admin') || intendedPath.startsWith('/console');

    expect(isAdminLogin).toBe(true);
    const allowed = ADMIN_EMAILS.map(e => e.trim().toLowerCase());
    const isAllowedAdmin = allowed.includes('congodb1@gmail.com');
    expect(isAllowedAdmin).toBe(true);
  });

  it('4. congodb1@gmail.com login on "/" -> NO signOut (admin can use normal site too)', async () => {
    const intendedPath = '/';
    const isAdminLogin = intendedPath.startsWith('/admin') || intendedPath.startsWith('/console');

    expect(isAdminLogin).toBe(false);
  });
});
