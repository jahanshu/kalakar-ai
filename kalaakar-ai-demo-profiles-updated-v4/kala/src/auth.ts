import { ArtisanProfile } from './types';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  artisan: ArtisanProfile;
  createdAt: string;
}

const USERS_KEY = 'kalaakar_auth_users';
const SESSION_KEY = 'kalaakar_auth_session';

const DEMO_EMAIL = 'demo@kalaakar.ai';
const DEMO_PASSWORD = 'Kalaakar@123';

export interface DemoProfile {
  id: string;
  name: string;
  email: string;
  password: string;
  artisan: ArtisanProfile;
}

// The three artisan profiles already used in the app are the demo login profiles.
const DEMO_ARTISANS: DemoProfile[] = [
  {
    id: 'user-vedansh-demo',
    name: 'Vedansh',
    email: 'vedansh.demo@kalaakar.ai',
    password: '1234',
    artisan: {
      id: 'artisan-1',
      name: 'Vedansh',
      hindiName: 'वेदांश',
      title: 'Master Weaver & Clay Artisan',
      location: 'Varanasi, UP',
      craft: 'Handloom & Pottery',
      avatar: '/assets/profiles/vedansh.png',
      story: 'I have been weaving traditional textiles and shaping clay crafts for over 22 years. My work is inspired by the ghats of Varanasi.',
      ngoPartner: 'Srijan Foundation',
      phone: '+91 98765 43210',
      totalProducts: 42,
      activeListings: 38,
      totalShares: 156,
    },
  },
  {
    id: 'user-nitish-demo',
    name: 'Nitish',
    email: 'nitish.demo@kalaakar.ai',
    password: '1234',
    artisan: {
      id: 'artisan-2',
      name: 'Nitish',
      hindiName: 'नितिश',
      title: 'Terracotta & Ceramic Sculptor',
      location: 'Gorakhpur, UP',
      craft: 'Terracotta Sculptures',
      avatar: '/assets/profiles/nitish.png',
      story: 'Third-generation terracotta artisan. We specialize in elephant pots and ornate garden sculptures using alluvial clay.',
      ngoPartner: 'Gramin Shilp Samiti',
      phone: '+91 91234 56789',
      totalProducts: 28,
      activeListings: 24,
      totalShares: 92,
    },
  },
  {
    id: 'user-vaishu-demo',
    name: 'Vaishu',
    email: 'vaishu.demo@kalaakar.ai',
    password: '1234',
    artisan: {
      id: 'artisan-3',
      name: 'Vaishu',
      hindiName: 'वैशु',
      title: 'Channapatna Wooden Toy Maker',
      location: 'Ramanagara, Karnataka',
      craft: 'Channapatna Toys',
      avatar: '/assets/profiles/vaishu.png',
      story: 'Carving child-safe lacquer toys using ivory wood and organic vegetable dyes for over 15 years.',
      ngoPartner: 'Maya Craft Collective',
      phone: '+91 98450 12345',
      totalProducts: 34,
      activeListings: 30,
      totalShares: 118,
    },
  },
];

export const DEMO_PROFILES = DEMO_ARTISANS;

const readUsers = (): AuthUser[] => {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeUsers = (users: AuthUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const hashPassword = async (password: string): Promise<string> => {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

export const getCurrentUserId = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

export const getCurrentUser = (): AuthUser | null => {
  const id = getCurrentUserId();
  if (!id) return null;
  return readUsers().find((user) => user.id === id) || null;
};

export const ensureDemoUsers = async (defaultArtisan: ArtisanProfile): Promise<AuthUser[]> => {
  const users = readUsers();
  const nextUsers = users.filter(
    (user) => user.id !== 'user-ramesh-demo' && user.id !== 'user-meera-demo'
  );

  // Keep the original demo account working for existing users/data.
  if (!nextUsers.some((user) => user.email.toLowerCase() === DEMO_EMAIL)) {
    nextUsers.push({
      id: 'user-demo',
      name: defaultArtisan.name,
      email: DEMO_EMAIL,
      passwordHash: await hashPassword(DEMO_PASSWORD),
      artisan: defaultArtisan,
      createdAt: new Date().toISOString(),
    });
  }

  for (const profile of DEMO_ARTISANS) {
    const existing = nextUsers.find((user) => user.id === profile.id || user.email.toLowerCase() === profile.email);
    if (!existing) {
      nextUsers.push({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        passwordHash: await hashPassword(profile.password),
        artisan: profile.artisan,
        createdAt: new Date().toISOString(),
      });
    }
  }

  writeUsers(nextUsers);
  return nextUsers.filter((user) => user.id === 'user-demo' || DEMO_ARTISANS.some((profile) => profile.id === user.id));
};

export const ensureDemoUser = async (defaultArtisan: ArtisanProfile): Promise<AuthUser> => {
  const users = await ensureDemoUsers(defaultArtisan);
  return users.find((user) => user.id === 'user-demo') || users[0];
};

export const signIn = async (email: string, password: string): Promise<AuthUser> => {
  const user = readUsers().find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!user) {
    throw new Error('No account found with this email.');
  }

  const passwordHash = await hashPassword(password);
  if (passwordHash !== user.passwordHash) {
    throw new Error('Incorrect password.');
  }

  localStorage.setItem(SESSION_KEY, user.id);
  return user;
};

export const signUp = async ({
  name,
  email,
  password,
  artisan,
}: {
  name: string;
  email: string;
  password: string;
  artisan: ArtisanProfile;
}): Promise<AuthUser> => {
  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === normalizedEmail)) {
    throw new Error('An account with this email already exists.');
  }

  const user: AuthUser = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    artisan,
    createdAt: new Date().toISOString(),
  };

  writeUsers([...users, user]);
  localStorage.setItem(SESSION_KEY, user.id);
  return user;
};

export const updateCurrentUser = (updates: Partial<AuthUser>): AuthUser | null => {
  const id = getCurrentUserId();
  if (!id) return null;

  const users = readUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) return null;

  const updated = { ...users[index], ...updates };
  users[index] = updated;
  writeUsers(users);
  return updated;
};

export const signOut = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getUserProductsKey = (userId: string) => `kalaakar_products_${userId}`;

export const getLegacyProductsKey = () => 'kalaakar_products';

export const demoCredentials = {
  email: DEMO_EMAIL,
  password: DEMO_PASSWORD,
};
