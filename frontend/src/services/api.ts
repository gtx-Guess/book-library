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
  pageCount?: number | null;
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

export interface CurrentlyReadingBook {
  id: string;
  bookId: string;
  book: Book;
  startedDate?: string;
  currentPage?: number;
  own?: boolean;
  willPurchase?: string;
  createdAt: string;
  isSeeded: boolean;
  userId: string;
}

export interface ImportSummary {
  imported: {
    completed: number;
    currentlyReading: number;
    wantToRead: number;
    dnf: number;
  };
  skipped: {
    duplicates: number;
  };
  customShelves: Array<{ name: string; count: number }>;
  importedBookIds: string[];
}

export interface SyncStatus {
  status: 'running' | 'completed' | 'failed';
  total: number;
  processed: number;
}

export interface AdminUser {
  id: string;
  username: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  invitedBy: string | null;
  completedBooks: number;
  dnfBooks: number;
  wantToReadBooks: number;
}

export interface PlatformStats {
  totalUsers: number;
  totalBooks: number;
  totalDNF: number;
  totalWantToRead: number;
  totalInviteCodes: number;
  registrationsByMonth: Record<string, number>;
  topUsers: Array<{ id: string; username: string; completedBooks: number }>;
}

export interface AdminInviteCode {
  id: string;
  code: string;
  creatorUsername: string;
  maxUses: number;
  useCount: number;
  isActive: boolean;
  createdAt: string;
  usedByUsernames: string[];
}

export interface UserProfile {
  id: string;
  userId: string;
  bio: string | null;
  avatarUrl: string | null;
  shareLibrary: boolean;
  friendCode: string;
  displayName: string | null;
  username: string;
}

export interface FriendInfo {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  shareLibrary: boolean;
  lastBook: {
    title: string;
    coverImage: string | null;
    completedDate: string;
    rating: number | null;
  } | null;
  friendSince: string;
}

export interface FriendRequestInfo {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
  createdAt: string;
  sender: {
    id: string;
    username: string;
    displayName: string | null;
  };
}

export interface FriendProfile {
  id: string;
  username: string;
  displayName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  shareLibrary: boolean;
}

export interface FriendStats {
  shareLibrary: boolean;
  booksThisYear?: number;
  totalBooks?: number;
  pagesThisYear?: number;
  goal: {
    goalCount: number;
    booksRead: number;
    progress: number;
  } | null;
  lastBook: {
    title: string;
    coverImage: string | null;
    completedDate: string;
    rating: number | null;
  } | null;
}

export interface FavoritesResponse {
  source: 'manual' | 'auto';
  books: Book[];
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

  updateCompletedBook: async (id: string, data: { link?: string; own?: boolean; willPurchase?: string; rating?: number | null; completedDate?: string; pageCount?: number | null }): Promise<CompletedBook> => {
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

  getAllCurrentlyReadingBooks: async (): Promise<CurrentlyReadingBook[]> => {
    const response = await axiosInstance.get('/currently-reading');
    return response.data;
  },

  addCurrentlyReadingBook: async (data: {
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
    startedDate?: string;
    currentPage?: number;
  }): Promise<CurrentlyReadingBook> => {
    const response = await axiosInstance.post('/currently-reading', data);
    return response.data;
  },

  updateCurrentlyReadingBook: async (id: string, data: { own?: boolean; willPurchase?: string; startedDate?: string; currentPage?: number }): Promise<CurrentlyReadingBook> => {
    const response = await axiosInstance.patch(`/currently-reading/${id}`, data);
    return response.data;
  },

  deleteCurrentlyReadingBook: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/currently-reading/${id}`);
  },

  importGoodReads: async (file: File): Promise<ImportSummary> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/import/goodreads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  startImportSync: async (bookIds: string[]): Promise<{ syncId: string }> => {
    const response = await axiosInstance.post('/import/sync', { bookIds });
    return response.data;
  },

  getImportSyncStatus: async (syncId: string): Promise<SyncStatus> => {
    const response = await axiosInstance.get(`/import/sync-status/${syncId}`);
    return response.data;
  },

  syncAllMetadata: async (): Promise<{ syncId: string | null; total: number; message?: string }> => {
    const response = await axiosInstance.post('/import/sync-all');
    return response.data;
  },

  admin: {
    getStats: async (): Promise<PlatformStats> => {
      const response = await axiosInstance.get('/admin/stats');
      return response.data;
    },
    getUsers: async (): Promise<AdminUser[]> => {
      const response = await axiosInstance.get('/admin/users');
      return response.data;
    },
    toggleUserActive: async (id: string): Promise<{ id: string; username: string; isActive: boolean }> => {
      const response = await axiosInstance.patch(`/admin/users/${id}/toggle-active`);
      return response.data;
    },
    resetUserPassword: async (id: string, newPassword: string): Promise<{ message: string }> => {
      const response = await axiosInstance.post(`/admin/users/${id}/reset-password`, { newPassword });
      return response.data;
    },
    getInviteCodes: async (): Promise<AdminInviteCode[]> => {
      const response = await axiosInstance.get('/admin/invite-codes');
      return response.data;
    },
    deactivateInviteCode: async (id: string): Promise<void> => {
      await axiosInstance.patch(`/admin/invite-codes/${id}/deactivate`);
    },
    getFriendships: async (): Promise<Array<{ id: string; user: { id: string; username: string; displayName: string | null }; friend: { id: string; username: string; displayName: string | null }; createdAt: string }>> => {
      const response = await axiosInstance.get('/admin/friendships');
      return response.data;
    },
    createFriendship: async (userId: string, friendId: string): Promise<{ message: string }> => {
      const response = await axiosInstance.post('/admin/friendships', { userId, friendId });
      return response.data;
    },
    removeFriendship: async (userId: string, friendId: string): Promise<void> => {
      await axiosInstance.delete(`/admin/friendships/${userId}/${friendId}`);
    },
  },

  profile: {
    getMe: async (): Promise<UserProfile> => {
      const response = await axiosInstance.get('/profile/me');
      return response.data;
    },
    updateMe: async (data: { displayName?: string; bio?: string; shareLibrary?: boolean }): Promise<UserProfile> => {
      const response = await axiosInstance.patch('/profile/me', data);
      return response.data;
    },
    getFriendCode: async (): Promise<{ friendCode: string }> => {
      const response = await axiosInstance.get('/profile/friend-code');
      return response.data;
    },
    regenerateFriendCode: async (): Promise<{ friendCode: string }> => {
      const response = await axiosInstance.post('/profile/regenerate-friend-code');
      return response.data;
    },
    getFriend: async (userId: string): Promise<FriendProfile> => {
      const response = await axiosInstance.get(`/profile/${userId}`);
      return response.data;
    },
    getFavorites: async (): Promise<FavoritesResponse> => {
      const response = await axiosInstance.get('/profile/favorites');
      return response.data;
    },
    setFavorites: async (bookIds: string[]): Promise<FavoritesResponse> => {
      const response = await axiosInstance.put('/profile/favorites', { bookIds });
      return response.data;
    },
    clearFavorites: async (): Promise<void> => {
      await axiosInstance.delete('/profile/favorites');
    },
  },

  friends: {
    getAll: async (): Promise<FriendInfo[]> => {
      const response = await axiosInstance.get('/friends');
      return response.data;
    },
    sendRequest: async (friendCode: string): Promise<FriendRequestInfo> => {
      const response = await axiosInstance.post('/friends/request', { friendCode });
      return response.data;
    },
    getPendingRequests: async (): Promise<FriendRequestInfo[]> => {
      const response = await axiosInstance.get('/friends/requests');
      return response.data;
    },
    acceptRequest: async (id: string): Promise<void> => {
      await axiosInstance.post(`/friends/requests/${id}/accept`);
    },
    declineRequest: async (id: string): Promise<void> => {
      await axiosInstance.post(`/friends/requests/${id}/decline`);
    },
    remove: async (friendId: string): Promise<void> => {
      await axiosInstance.delete(`/friends/${friendId}`);
    },
    getCompleted: async (friendId: string, page: number = 1, limit: number = 20): Promise<PaginatedBooks> => {
      const response = await axiosInstance.get(`/friends/${friendId}/library/completed`, { params: { page, limit } });
      return response.data;
    },
    getCurrentlyReading: async (friendId: string): Promise<CurrentlyReadingBook[]> => {
      const response = await axiosInstance.get(`/friends/${friendId}/library/currently-reading`);
      return response.data;
    },
    getDNF: async (friendId: string): Promise<DNFBook[]> => {
      const response = await axiosInstance.get(`/friends/${friendId}/library/dnf`);
      return response.data;
    },
    getWantToRead: async (friendId: string): Promise<WantToReadBook[]> => {
      const response = await axiosInstance.get(`/friends/${friendId}/library/want-to-read`);
      return response.data;
    },
    getStats: async (friendId: string): Promise<FriendStats> => {
      const response = await axiosInstance.get(`/friends/${friendId}/library/stats`);
      return response.data;
    },
    getFavorites: async (friendId: string): Promise<FavoritesResponse> => {
      const response = await axiosInstance.get(`/friends/${friendId}/library/favorites`);
      return response.data;
    },
  },
};
