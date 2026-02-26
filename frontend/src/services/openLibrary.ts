import axios from 'axios';

const OPEN_LIBRARY_API = 'https://openlibrary.org';

export interface OpenLibraryBook {
  title?: string;
  authors?: string[];
  pageCount?: number;
  coverImage?: string;
  publisher?: string;
  publishedDate?: string;
}

export async function getBookFromOpenLibrary(
  isbn?: string,
  title?: string,
  author?: string
): Promise<OpenLibraryBook | null> {
  try {
    // Try ISBN first if available
    if (isbn) {
      const response = await axios.get(
        `${OPEN_LIBRARY_API}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
      );

      const bookKey = `ISBN:${isbn}`;
      const bookData = response.data[bookKey];

      if (bookData) {
        return {
          title: bookData.title,
          authors: bookData.authors?.map((a: any) => a.name) || [],
          pageCount: bookData.number_of_pages,
          coverImage: bookData.cover?.large || bookData.cover?.medium,
          publisher: bookData.publishers?.[0]?.name,
          publishedDate: bookData.publish_date,
        };
      }
    }

    // Fallback: Search by title and author
    if (title) {
      const searchParams = new URLSearchParams();
      searchParams.append('title', title);
      if (author) {
        searchParams.append('author', author);
      }
      searchParams.append('limit', '1');

      const response = await axios.get(
        `${OPEN_LIBRARY_API}/search.json?${searchParams.toString()}`
      );

      if (response.data.docs && response.data.docs.length > 0) {
        const book = response.data.docs[0];
        return {
          title: book.title,
          authors: book.author_name || [],
          pageCount: book.number_of_pages_median || book.number_of_pages,
          coverImage: book.cover_i
            ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
            : undefined,
          publisher: book.publisher?.[0],
          publishedDate: book.first_publish_year?.toString(),
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching from Open Library:', error);
    return null;
  }
}
