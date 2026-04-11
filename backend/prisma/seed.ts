import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SEEDED_2025_BOOKS = [
  {
    googleBooksId: 'ifn3EAAAQBAJ',
    title: 'Intermezzo',
    authors: ['Sally Rooney'],
    description: 'A sweeping novel about two brothers navigating grief, love, and connection in contemporary Ireland.',
    coverImage: 'http://books.google.com/books/content?id=ifn3EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 432,
    publishedDate: '2024',
    categories: ['Fiction'],
    completedDate: new Date('2025-01-18'),
    rating: 4,
  },
  {
    googleBooksId: 'hPzQEAAAQBAJ',
    title: 'James',
    authors: ['Percival Everett'],
    description: 'A reimagining of Adventures of Huckleberry Finn told from the perspective of the enslaved man Jim.',
    coverImage: 'http://books.google.com/books/content?id=hPzQEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    pageCount: 320,
    publishedDate: '2024',
    categories: ['Fiction'],
    completedDate: new Date('2025-02-05'),
    rating: 5,
  },
  {
    googleBooksId: '0Ua4EAAAQBAJ',
    title: 'The Women',
    authors: ['Kristin Hannah'],
    description: 'The story of a young woman who follows her brother to serve as a nurse in Vietnam.',
    coverImage: 'http://books.google.com/books/content?id=0Ua4EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 480,
    publishedDate: '2024',
    categories: ['Fiction'],
    completedDate: new Date('2025-02-28'),
    rating: 4,
  },
  {
    googleBooksId: '19DSEAAAQBAJ',
    title: 'All Fours',
    authors: ['Miranda July'],
    description: 'A woman in her mid-forties leaves on a cross-country drive and ends up staying in a motel for weeks.',
    coverImage: 'http://books.google.com/books/content?id=19DSEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 352,
    publishedDate: '2024',
    categories: ['Fiction'],
    completedDate: new Date('2025-03-20'),
    rating: 3,
  },
  {
    googleBooksId: '3QPkEAAAQBAJ',
    title: 'Orbital',
    authors: ['Samantha Harvey'],
    description: 'Six astronauts orbit the earth sixteen times in twenty-four hours, in this Booker Prize winning novel.',
    coverImage: 'http://books.google.com/books/content?id=3QPkEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 136,
    publishedDate: '2023',
    categories: ['Fiction'],
    completedDate: new Date('2025-04-10'),
    rating: 5,
  },
  {
    googleBooksId: 'E-OLEAAAQBAJ',
    title: 'Fourth Wing',
    authors: ['Rebecca Yarros'],
    description: 'A young woman enters a war college for dragon riders in this fantasy romance.',
    coverImage: 'http://books.google.com/books/content?id=E-OLEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 528,
    publishedDate: '2023',
    categories: ['Fantasy'],
    completedDate: new Date('2025-05-15'),
    rating: 3,
  },
  {
    googleBooksId: 'LML4EAAAQBAJ',
    title: 'Tomorrow, and Tomorrow, and Tomorrow',
    authors: ['Gabrielle Zevin'],
    description: 'A story about two friends who meet as children and grow up to collaborate as video game designers.',
    coverImage: 'http://books.google.com/books/content?id=LML4EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 480,
    publishedDate: '2022',
    categories: ['Fiction'],
    completedDate: new Date('2025-06-22'),
    rating: 5,
  },
  {
    googleBooksId: 'AABAEAAAQBAJ',
    title: 'Small Things Like These',
    authors: ['Claire Keegan'],
    description: 'A coal merchant in 1980s Ireland discovers a young woman locked in a convent outbuilding.',
    coverImage: 'http://books.google.com/books/content?id=AABAEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 120,
    publishedDate: '2021',
    categories: ['Fiction'],
    completedDate: new Date('2025-07-30'),
    rating: 5,
  },
  {
    googleBooksId: 'QOoOLUV12doC',
    title: 'The God of the Woods',
    authors: ['Lauren Fox'],
    description: 'A missing girl, an Adirondack summer camp, and decades of family secrets collide.',
    coverImage: 'http://books.google.com/books/content?id=QOoOLUV12doC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 400,
    publishedDate: '2024',
    categories: ['Fiction'],
    completedDate: new Date('2025-08-18'),
    rating: 4,
  },
  {
    googleBooksId: '_MO5EAAAQBAJ',
    title: 'The Covenant of Water',
    authors: ['Abraham Verghese'],
    description: 'An epic multigenerational saga set in South India, spanning from 1900 to 1977.',
    coverImage: 'http://books.google.com/books/content?id=_MO5EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 736,
    publishedDate: '2023',
    categories: ['Fiction'],
    completedDate: new Date('2025-10-05'),
    rating: 4,
  },
];

const SEEDED_2026_BOOKS = [
  {
    googleBooksId: '_6TAEAAAQBAJ',
    title: 'Scythe',
    authors: ['Neal Shusterman'],
    description: 'Two teens must learn the art of killing in this chilling series from the author of the Unwind dystology.',
    coverImage: 'http://books.google.com/books/content?id=_6TAEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 464,
    publishedDate: '2017-11-28',
    categories: ['Juvenile Fiction'],
    completedDate: new Date('2026-02-26'),
    rating: 9,
  },
  {
    googleBooksId: 'iZt4CgAAQBAJ',
    title: 'Thunderhead',
    authors: ['Neal Shusterman'],
    description: 'The second book in the Arc of a Scythe series.',
    coverImage: 'http://books.google.com/books/content?id=iZt4CgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 512,
    publishedDate: '2018-01-09',
    categories: ['Juvenile Fiction'],
    completedDate: new Date('2026-02-26'),
    rating: 5,
  },
  {
    googleBooksId: 'Ld0dEQAAQBAJ',
    title: 'The Toll',
    authors: ['Neal Shusterman'],
    description: 'The thrilling conclusion to the Arc of a Scythe trilogy.',
    coverImage: 'http://books.google.com/books/content?id=Ld0dEQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 640,
    publishedDate: '2020-11-03',
    categories: ['Juvenile Fiction'],
    completedDate: new Date('2026-02-26'),
    rating: 6,
  },
];

const SEEDED_DNF_BOOKS = [
  {
    googleBooksId: 'K5UEEAAAQBAJ',
    title: 'Lilo & Stitch (Disney Lilo & Stitch)',
    authors: [] as string[],
    description: 'The official Disney Lilo & Stitch novelization.',
    coverImage: 'http://books.google.com/books/content?id=K5UEEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 15,
    publishedDate: '2021-05-25',
    categories: [] as string[],
  },
  {
    googleBooksId: '5Z9oDwAAQBAJ',
    title: 'Mighty Morphin Power Rangers Vol. 2',
    authors: ['Kyle Higgins'],
    description: 'The second volume of the Mighty Morphin Power Rangers comic series.',
    coverImage: 'http://books.google.com/books/content?id=5Z9oDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 115,
    publishedDate: '2017-03-08',
    categories: [] as string[],
  },
];

const SEEDED_WANT_TO_READ_BOOKS = [
  {
    googleBooksId: 'mBH8EAAAQBAJ',
    title: 'Oppenheimer',
    authors: ['Christopher Nolan'],
    description: 'The official screenplay of the acclaimed film about J. Robert Oppenheimer.',
    coverImage: 'http://books.google.com/books/content?id=mBH8EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 232,
    publishedDate: '2023-07-25',
    categories: [] as string[],
  },
  {
    googleBooksId: '1n7prQEACAAJ',
    title: 'Vinland Saga',
    authors: ['Makoto Yukimura'],
    description: 'An epic manga set in the age of the Vikings.',
    coverImage: 'http://books.google.com/books/content?id=1n7prQEACAAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
    pageCount: 191,
    publishedDate: '2015-04-28',
    categories: [] as string[],
  },
];

const SEEDED_CURRENTLY_READING_BOOKS = [
  {
    googleBooksId: 'wrOQLV6xB-wC',
    title: 'The Hobbit',
    authors: ['J.R.R. Tolkien'],
    description: 'Bilbo Baggins is a hobbit who enjoys a comfortable life, rarely traveling far from home. Then one day the wizard Gandalf arrives.',
    coverImage: 'http://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 366,
    publishedDate: '2012-02-15',
    categories: ['Fiction'],
    startedDate: new Date('2026-04-01'),
    currentPage: 120,
  },
];

async function main() {
  console.log('Seeding database...');

  // Create admin user (only set password on first creation)
  let admin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!admin) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'changeme';
    const adminHash = await bcrypt.hash(adminPassword, 12);
    admin = await prisma.user.create({
      data: { username: 'admin', passwordHash: adminHash, role: 'admin' },
    });
    console.log(`Admin user created: ${admin.id}`);
  } else {
    console.log(`Admin user exists: ${admin.id}`);
  }

  // Create demo user (always reset demo password to 'demo')
  const demoHash = await bcrypt.hash('demo', 12);
  const demo = await prisma.user.upsert({
    where: { username: 'demo' },
    update: { passwordHash: demoHash },
    create: { username: 'demo', passwordHash: demoHash, role: 'demo' },
  });
  console.log(`Demo user: ${demo.id}`);

  // Assign any existing books without a userId to the admin
  const unassignedCompleted = await prisma.completedBook.updateMany({
    where: { userId: '' },
    data: { userId: admin.id },
  });
  const unassignedDnf = await prisma.dNFBook.updateMany({
    where: { userId: '' },
    data: { userId: admin.id },
  });
  const unassignedWantToRead = await prisma.wantToReadBook.updateMany({
    where: { userId: '' },
    data: { userId: admin.id },
  });
  const unassignedCurrentlyReading = await prisma.currentlyReadingBook.updateMany({
    where: { userId: '' },
    data: { userId: admin.id },
  });
  const unassignedGoals = await prisma.yearlyGoal.updateMany({
    where: { userId: '' },
    data: { userId: admin.id },
  });

  if (unassignedCompleted.count || unassignedDnf.count || unassignedWantToRead.count || unassignedCurrentlyReading.count || unassignedGoals.count) {
    console.log(`Assigned existing records to admin`);
  }

  // Seed demo 2025 completed books
  for (const bookData of SEEDED_2025_BOOKS) {
    const { completedDate, rating, ...bookFields } = bookData;

    const book = await prisma.book.upsert({
      where: { googleBooksId: bookFields.googleBooksId },
      update: {},
      create: { ...bookFields, authors: bookFields.authors, categories: bookFields.categories },
    });

    const existing = await prisma.completedBook.findFirst({
      where: { bookId: book.id, userId: demo.id, isSeeded: true },
    });

    if (!existing) {
      await prisma.completedBook.create({
        data: {
          bookId: book.id,
          userId: demo.id,
          isSeeded: true,
          completedDate,
          year: 2025,
          pageCount: bookFields.pageCount,
          rating,
        },
      });
    }
  }
  console.log(`Seeded ${SEEDED_2025_BOOKS.length} demo 2025 books`);

  // Seed demo 2026 completed books
  for (const bookData of SEEDED_2026_BOOKS) {
    const { completedDate, rating, ...bookFields } = bookData;

    const book = await prisma.book.upsert({
      where: { googleBooksId: bookFields.googleBooksId },
      update: {},
      create: { ...bookFields, authors: bookFields.authors, categories: bookFields.categories },
    });

    const existing = await prisma.completedBook.findFirst({
      where: { bookId: book.id, userId: demo.id, isSeeded: true },
    });

    if (!existing) {
      await prisma.completedBook.create({
        data: {
          bookId: book.id,
          userId: demo.id,
          isSeeded: true,
          completedDate,
          year: 2026,
          pageCount: bookFields.pageCount,
          rating,
        },
      });
    }
  }
  console.log(`Seeded ${SEEDED_2026_BOOKS.length} demo 2026 books`);

  // Seed demo DNF books
  for (const bookData of SEEDED_DNF_BOOKS) {
    const book = await prisma.book.upsert({
      where: { googleBooksId: bookData.googleBooksId },
      update: {},
      create: { ...bookData, authors: bookData.authors, categories: bookData.categories },
    });

    const existing = await prisma.dNFBook.findFirst({
      where: { bookId: book.id, userId: demo.id, isSeeded: true },
    });

    if (!existing) {
      await prisma.dNFBook.create({
        data: { bookId: book.id, userId: demo.id, isSeeded: true },
      });
    }
  }
  console.log(`Seeded ${SEEDED_DNF_BOOKS.length} demo DNF books`);

  // Seed demo Want to Read books
  for (const bookData of SEEDED_WANT_TO_READ_BOOKS) {
    const book = await prisma.book.upsert({
      where: { googleBooksId: bookData.googleBooksId },
      update: {},
      create: { ...bookData, authors: bookData.authors, categories: bookData.categories },
    });

    const existing = await prisma.wantToReadBook.findFirst({
      where: { bookId: book.id, userId: demo.id, isSeeded: true },
    });

    if (!existing) {
      await prisma.wantToReadBook.create({
        data: { bookId: book.id, userId: demo.id, isSeeded: true },
      });
    }
  }
  console.log(`Seeded ${SEEDED_WANT_TO_READ_BOOKS.length} demo Want to Read books`);

  // Seed demo Currently Reading books
  for (const bookData of SEEDED_CURRENTLY_READING_BOOKS) {
    const { startedDate, currentPage, ...bookFields } = bookData;

    const book = await prisma.book.upsert({
      where: { googleBooksId: bookFields.googleBooksId },
      update: {},
      create: { ...bookFields, authors: bookFields.authors, categories: bookFields.categories },
    });

    const existing = await prisma.currentlyReadingBook.findFirst({
      where: { bookId: book.id, userId: demo.id, isSeeded: true },
    });

    if (!existing) {
      await prisma.currentlyReadingBook.create({
        data: {
          bookId: book.id,
          userId: demo.id,
          isSeeded: true,
          startedDate,
          currentPage,
        },
      });
    }
  }
  console.log(`Seeded ${SEEDED_CURRENTLY_READING_BOOKS.length} demo Currently Reading books`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
