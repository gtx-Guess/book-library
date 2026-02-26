import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export interface GoogleBook {
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
  };
}

export async function searchBooks(query: string): Promise<GoogleBook[]> {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY || '';
    const params: any = {
      q: query,
      maxResults: 20,
    };

    if (apiKey) {
      params.key = apiKey;
    }

    const response = await axios.get(GOOGLE_BOOKS_API, { params });
    return response.data.items || [];
  } catch (error) {
    console.error('Error searching Google Books:', error);
    throw new Error('Failed to search books');
  }
}

export async function getBookById(googleBooksId: string): Promise<GoogleBook | null> {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY || '';
    const url = `${GOOGLE_BOOKS_API}/${googleBooksId}`;
    const params: any = {};

    if (apiKey) {
      params.key = apiKey;
    }

    const response = await axios.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching book from Google Books:', error);
    return null;
  }
}
