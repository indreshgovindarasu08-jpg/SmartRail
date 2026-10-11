// Service to manage commuter users and admin accounts across localStorage
import { UserPreferences } from '../../types';

export interface RegisteredUserRecord {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  station: string;
  category: 'daily' | 'express' | 'student' | 'senior' | 'tourist' | 'admin';
  role: 'admin' | 'user';
  isVerified: boolean;
  registeredAt: string;
  status: 'active' | 'suspended';
  accessibility: string;
}

const STORAGE_KEY = 'smartrail_registered_users';

export const ADMIN_EMAIL = 'indreshgovindarasu08@gmail.com';

const INITIAL_USERS: RegisteredUserRecord[] = [
  {
    id: 'usr-admin-01',
    name: 'Indresh Govindarasu (Admin)',
    email: 'indreshgovindarasu08@gmail.com',
    phoneNumber: '9876543210',
    station: 'Coimbatore Junction (CBE)',
    category: 'admin',
    role: 'admin',
    isVerified: true,
    registeredAt: '2026-03-01 08:30:00',
    status: 'active',
    accessibility: 'Standard',
  },
  {
    id: 'usr-002',
    name: 'Priya Sundaram',
    email: 'priya.rail@southernrail.in',
    phoneNumber: '9840123456',
    station: 'Chennai Central (MAS)',
    category: 'express',
    role: 'user',
    isVerified: true,
    registeredAt: '2026-03-05 14:22:10',
    status: 'active',
    accessibility: 'Standard',
  },
  {
    id: 'usr-003',
    name: 'Dr. Ramanathan K',
    email: 'raman.mdu@railnet.in',
    phoneNumber: '9789012345',
    station: 'Madurai Jn (MDU)',
    category: 'senior',
    role: 'user',
    isVerified: true,
    registeredAt: '2026-03-08 10:15:45',
    status: 'active',
    accessibility: 'Wheelchair',
  },
  {
    id: 'usr-004',
    name: 'Karthik Subramanian',
    email: 'karthik.cbe.tn@gmail.com',
    phoneNumber: '9443219870',
    station: 'Tuticorin (TN)',
    category: 'daily',
    role: 'user',
    isVerified: true,
    registeredAt: '2026-03-10 19:40:12',
    status: 'active',
    accessibility: 'Standard',
  },
];

class UserService {
  private getUsers(): RegisteredUserRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load registered users:', e);
    }
    // Seed initial users if not present
    this.saveUsers(INITIAL_USERS);
    return INITIAL_USERS;
  }

  private saveUsers(users: RegisteredUserRecord[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to persist users:', e);
    }
  }

  public getAllUsers(): RegisteredUserRecord[] {
    return this.getUsers();
  }

  public registerOrUpdateUser(user: Partial<UserPreferences>): RegisteredUserRecord {
    const users = this.getUsers();
    const email = (user.email || '').trim().toLowerCase();
    const phone = (user.phoneNumber || '').trim();

    const isAdmin = email === ADMIN_EMAIL.toLowerCase() || user.role === 'admin';

    const existingIndex = users.findIndex(
      (u) => u.email.toLowerCase() === email || (phone && u.phoneNumber === phone)
    );

    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (existingIndex >= 0) {
      const updated: RegisteredUserRecord = {
        ...users[existingIndex],
        name: user.name || users[existingIndex].name,
        email: user.email || users[existingIndex].email,
        phoneNumber: user.phoneNumber || users[existingIndex].phoneNumber,
        accessibility: user.accessibility || users[existingIndex].accessibility,
        role: isAdmin ? 'admin' : users[existingIndex].role,
        isVerified: true,
      };
      users[existingIndex] = updated;
      this.saveUsers(users);
      return updated;
    } else {
      const newUser: RegisteredUserRecord = {
        id: `usr-${Date.now().toString().slice(-6)}`,
        name: user.name || (isAdmin ? 'Indresh Govindarasu' : 'New Commuter'),
        email: user.email || (isAdmin ? ADMIN_EMAIL : 'commuter@smartrail.in'),
        phoneNumber: user.phoneNumber || '9876543210',
        station: 'Coimbatore Junction (CBE)',
        category: isAdmin ? 'admin' : 'express',
        role: isAdmin ? 'admin' : 'user',
        isVerified: true,
        registeredAt: now,
        status: 'active',
        accessibility: user.accessibility || 'Standard',
      };
      users.unshift(newUser);
      this.saveUsers(users);
      return newUser;
    }
  }

  public deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length !== users.length) {
      this.saveUsers(filtered);
      return true;
    }
    return false;
  }

  public toggleUserStatus(id: string): RegisteredUserRecord | null {
    const users = this.getUsers();
    const user = users.find((u) => u.id === id);
    if (user) {
      user.status = user.status === 'active' ? 'suspended' : 'active';
      this.saveUsers(users);
      return user;
    }
    return null;
  }

  public isUserAdmin(emailOrUser?: string | UserPreferences | null): boolean {
    if (!emailOrUser) return false;
    if (typeof emailOrUser === 'string') {
      return emailOrUser.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
    }
    return (
      emailOrUser.email?.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
      emailOrUser.role === 'admin'
    );
  }
}

export const userService = new UserService();
