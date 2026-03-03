import axios from 'axios';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/browser';

// In dev: VITE_API_URL is empty, Vite proxy forwards /api → backend
// In production: VITE_API_URL=https://book-api.tdnet.xyz
const axiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_URL ?? '') + '/api',
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AuthUser {
  id: string;
  username: string;
  role: string;
}

export interface InviteCode {
  id: string;
  code: string;
  creatorId: string;
  maxUses: number;
  useCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface Book {
  id: string;
  googleBooksId?: string;
  title: string;
  authors: string[];
  description?: string;
  coverImage?: string;
  pageCount?: number;
  publisher?: string;
  publishedDate?: string;
  categories: string[];
}

export interface CompletedBook {
  id: string;
  bookId: string;
  book: Book;
  completedDate: string;
  year: number;
  pageCount?: number;
  rating?: number;
  own?: boolean;
  willPurchase?: string;
  link?: string;
  isSeeded: boolean;
  userId: string;
}

export interface YearlyGoal {
  id: string;
  year: number;
  goalCount: number;
}

export interface YearlyStats {
  year: number;
  booksRead: number;
  goalCount: number;
  progress: number;
  hasGoal: boolean;
  totalPagesRead: number;
  lastBook: {
    id: string;
    title: string;
    authors: string[];
    coverImage?: string;
    completedDate: string;
    pageCount?: number;
    rating?: number;
  } | null;
}

export interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    pageCount?: number;
    publisher?: string;
    publishedDate?: string;
    categories?: string[];
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
  };
}

export interface AllYearsStats {
  years: Array<{
    year: number;
    booksRead: number;
    goalCount: number;
    progress: number;
    hasGoal: boolean;
    totalPagesRead: number;
    goalAchieved: boolean;
  }>;
  allTime: {
    totalBooks: number;
    totalPages: number;
    yearsTracked: number;
    avgBooksPerYear: number;
  };
}

export interface PaginatedBooks {
  books: CompletedBook[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export interface DNFBook {
  id: string;
  bookId: string;
  book: Book;
  own?: boolean;
  willPurchase?: string;
  createdAt: string;
  isSeeded: boolean;
  userId: string;
}

export interface WantToReadBook {
  id: string;
  bookId: string;
  book: Book;
  own?: boolean;
  willPurchase?: string;
  createdAt: string;
  isSeeded: boolean;
  userId: string;
}

export const api = {
  auth: {
    login: async (username: string, password: string): Promise<{ token: string; user: AuthUser }> => {
      const response = await axiosInstance.post('/auth/login', { username, password });
      return response.data;
    },
    me: async (): Promise<AuthUser> => {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    },
    logout: async (): Promise<void> => {
      await axiosInstance.post('/auth/logout');
    },
    webAuthnRegistrationOptions: async (): Promise<PublicKeyCredentialCreationOptionsJSON> => {
      const response = await axiosInstance.post('/auth/webauthn/register/start');
      return response.data;
    },
    webAuthnRegistrationVerify: async (credential: RegistrationResponseJSON): Promise<{ verified: boolean }> => {
      const response = await axiosInstance.post('/auth/webauthn/register/finish', credential);
      return response.data;
    },
    webAuthnAuthOptions: async (username: string): Promise<PublicKeyCredentialRequestOptionsJSON> => {
      const response = await axiosInstance.post('/auth/webauthn/authenticate/start', { username });
      return response.data;
    },
    webAuthnAuthVerify: async (username: string, response: AuthenticationResponseJSON): Promise<{ token: string; user: AuthUser }> => {
      const resp = await axiosInstance.post('/auth/webauthn/authenticate/finish', { username, response });
      return resp.data;
    },
    register: async (username: string, password: string, inviteCode: string): Promise<{ token: string; user: AuthUser }> => {
      const response = await axiosInstance.post('/auth/register', { username, password, inviteCode });
      return response.data;
    },
  },

  inviteCodes: {
    generate: async (maxUses?: number): Promise<InviteCode> => {
      const response = await axiosInstance.post('/auth/invite-codes', maxUses ? { maxUses } : {});
      return response.data;
    },
    getMine: async (): Promise<InviteCode[]> => {
      const response = await axiosInstance.get('/auth/invite-codes');
      return response.data;
    },
    deactivate: async (id: string): Promise<InviteCode> => {
      const response = await axiosInstance.patch(`/auth/invite-codes/${id}/deactivate`);
      return response.data;
    },
  },

  searchBooks: async (query: string): Promise<GoogleBookResult[]> => {
    const response = await axiosInstance.get('/books/search', { params: { query } });
    return response.data;
  },

  addCompletedBook: async (data: {
    googleBooksId?: string;
    title: string;
    authors?: string[];
    description?: string;
    coverImage?: string;
    pageCount?: number;
    rating?: number;
    own?: boolean;
    willPurchase?: string;
    link?: string;
    publisher?: string;
    publishedDate?: string;
    categories?: string[];
    completedDate: string;
  }): Promise<CompletedBook> => {
    const response = await axiosInstance.post('/books/completed', data);
    return response.data;
  },

  getCompletedBooks: async (year: number): Promise<CompletedBook[]> => {
    const response = await axiosInstance.get(`/books/completed/${year}`);
    return response.data;
  },

  getAllCompletedBooks: async (page: number = 1, limit: number = 20): Promise<PaginatedBooks> => {
    const response = await axiosInstance.get('/books/completed/all/paginated', { params: { page, limit } });
    return response.data;
  },

  updateCompletedBook: async (id: string, data: { link?: string; own?: boolean; willPurchase?: string; rating?: number | null }): Promise<CompletedBook> => {
    const response = await axiosInstance.patch(`/books/completed/${id}`, data);
    return response.data;
  },

  deleteCompletedBook: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/books/completed/${id}`);
  },

  getGoal: async (year: number): Promise<YearlyGoal> => {
    const response = await axiosInstance.get(`/goals/${year}`);
    return response.data;
  },

  setGoal: async (year: number, goalCount: number): Promise<YearlyGoal> => {
    const response = await axiosInstance.post(`/goals/${year}`, { goalCount });
    return response.data;
  },

  getStats: async (year: number): Promise<YearlyStats> => {
    const response = await axiosInstance.get(`/stats/${year}`);
    return response.data;
  },

  getAllYears: async (): Promise<number[]> => {
    const response = await axiosInstance.get('/stats/years');
    return response.data;
  },

  getAllYearsWithStats: async (): Promise<AllYearsStats> => {
    const response = await axiosInstance.get('/stats/all-years');
    return response.data;
  },

  getAllDNFBooks: async (): Promise<DNFBook[]> => {
    const response = await axiosInstance.get('/dnf');
    return response.data;
  },

  addDNFBook: async (data: {
    googleBooksId?: string;
    title: string;
    authors?: string[];
    description?: string;
    coverImage?: string;
    pageCount?: number;
    publisher?: string;
    publishedDate?: string;
    categories?: string[];
    own?: boolean;
    willPurchase?: string;
  }): Promise<DNFBook> => {
    const response = await axiosInstance.post('/dnf', data);
    return response.data;
  },

  updateDNFBook: async (id: string, data: { own?: boolean; willPurchase?: string }): Promise<DNFBook> => {
    const response = await axiosInstance.patch(`/dnf/${id}`, data);
    return response.data;
  },

  deleteDNFBook: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/dnf/${id}`);
  },

  getAllWantToReadBooks: async (): Promise<WantToReadBook[]> => {
    const response = await axiosInstance.get('/want-to-read');
    return response.data;
  },

  addWantToReadBook: async (data: {
    googleBooksId?: string;
    title: string;
    authors?: string[];
    description?: string;
    coverImage?: string;
    pageCount?: number;
    publisher?: string;
    publishedDate?: string;
    categories?: string[];
    own?: boolean;
    willPurchase?: string;
  }): Promise<WantToReadBook> => {
    const response = await axiosInstance.post('/want-to-read', data);
    return response.data;
  },

  updateWantToReadBook: async (id: string, data: { own?: boolean; willPurchase?: string }): Promise<WantToReadBook> => {
    const response = await axiosInstance.patch(`/want-to-read/${id}`, data);
    return response.data;
  },

  deleteWantToReadBook: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/want-to-read/${id}`);
  },
};
