import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dev-only data...');

  const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
  if (!admin) {
    console.log('Admin user not found — run the main seed first');
    return;
  }

  // --- Seed fake friends for testing social features ---
  const friendPassword = await bcrypt.hash('friend123', 12);

  // Friend 1: Sarah
  let sarah = await prisma.user.findUnique({ where: { username: 'sarah_reads' } });
  if (!sarah) {
    sarah = await prisma.user.create({
      data: { username: 'sarah_reads', passwordHash: friendPassword, role: 'user', displayName: 'Sarah' },
    });
    console.log(`Created friend user: sarah_reads (${sarah.id})`);
  }

  // Friend 2: Marcus
  let marcus = await prisma.user.findUnique({ where: { username: 'marcus_b' } });
  if (!marcus) {
    marcus = await prisma.user.create({
      data: { username: 'marcus_b', passwordHash: friendPassword, role: 'user', displayName: 'Marcus' },
    });
    console.log(`Created friend user: marcus_b (${marcus.id})`);
  }

  // Create profiles with friend codes
  for (const friendUser of [sarah, marcus]) {
    const existing = await prisma.userProfile.findUnique({ where: { userId: friendUser.id } });
    if (!existing) {
      await prisma.userProfile.create({
        data: {
          userId: friendUser.id,
          friendCode: crypto.randomBytes(4).toString('hex'),
          bio: friendUser.username === 'sarah_reads' ? 'Fiction lover and coffee addict' : 'Sci-fi and fantasy nerd',
        },
      });
    }
  }

  // Create admin profile if it doesn't exist
  const adminProfile = await prisma.userProfile.findUnique({ where: { userId: admin.id } });
  if (!adminProfile) {
    await prisma.userProfile.create({
      data: { userId: admin.id, friendCode: crypto.randomBytes(4).toString('hex') },
    });
  }

  // Make admin friends with both sarah and marcus (bidirectional)
  for (const friendUser of [sarah, marcus]) {
    const existing = await prisma.friendship.findUnique({
      where: { userId_friendId: { userId: admin.id, friendId: friendUser.id } },
    });
    if (!existing) {
      await prisma.friendship.createMany({
        data: [
          { userId: admin.id, friendId: friendUser.id },
          { userId: friendUser.id, friendId: admin.id },
        ],
        skipDuplicates: true,
      });
    }
  }
  console.log('Admin is now friends with sarah_reads and marcus_b');

  // Seed Sarah's completed books
  const sarahBooks = [
    {
      googleBooksId: 'OjPLDgAAQBAJ',
      title: 'Educated',
      authors: ['Tara Westover'],
      description: 'A memoir about a young girl who leaves her survivalist family and goes on to earn a PhD from Cambridge.',
      coverImage: 'http://books.google.com/books/content?id=OjPLDgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      pageCount: 352,
      publishedDate: '2018-02-20',
      categories: ['Biography & Autobiography'],
      completedDate: new Date('2026-01-15'),
      rating: 5,
      year: 2026,
    },
    {
      googleBooksId: 'lFkBDgAAQBAJ',
      title: 'The Silent Patient',
      authors: ['Alex Michaelides'],
      description: 'A woman shoots her husband and then never speaks another word. A criminal psychotherapist becomes obsessed with uncovering her motive.',
      coverImage: 'http://books.google.com/books/content?id=lFkBDgAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      pageCount: 336,
      publishedDate: '2019-02-05',
      categories: ['Fiction'],
      completedDate: new Date('2026-02-20'),
      rating: 4,
      year: 2026,
    },
    {
      googleBooksId: 'PGR2AwAAQBAJ',
      title: 'Gone Girl',
      authors: ['Gillian Flynn'],
      description: 'On their fifth wedding anniversary, Nick\'s wife Amy disappears.',
      coverImage: 'http://books.google.com/books/content?id=PGR2AwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      pageCount: 432,
      publishedDate: '2012-06-05',
      categories: ['Fiction'],
      completedDate: new Date('2026-03-10'),
      rating: 4,
      year: 2026,
    },
  ];

  for (const bookData of sarahBooks) {
    const { completedDate, rating, year, ...bookFields } = bookData;
    const book = await prisma.book.upsert({
      where: { googleBooksId: bookFields.googleBooksId },
      update: {},
      create: { ...bookFields, authors: bookFields.authors, categories: bookFields.categories },
    });
    const existing = await prisma.completedBook.findFirst({
      where: { bookId: book.id, userId: sarah.id, isSeeded: true },
    });
    if (!existing) {
      await prisma.completedBook.create({
        data: { bookId: book.id, userId: sarah.id, isSeeded: true, completedDate, year, pageCount: bookFields.pageCount, rating },
      });
    }
  }

  // Sarah's currently reading
  const sarahCurrentBook = {
    googleBooksId: 'aWZzLPhY4o0C',
    title: 'The Fellowship of the Ring',
    authors: ['J.R.R. Tolkien'],
    description: 'The first volume of The Lord of the Rings.',
    coverImage: 'http://books.google.com/books/content?id=aWZzLPhY4o0C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 432,
    publishedDate: '2012-02-15',
    categories: ['Fiction'],
  };
  const sarahCrBook = await prisma.book.upsert({
    where: { googleBooksId: sarahCurrentBook.googleBooksId },
    update: {},
    create: { ...sarahCurrentBook, authors: sarahCurrentBook.authors, categories: sarahCurrentBook.categories },
  });
  const sarahCrExisting = await prisma.currentlyReadingBook.findFirst({
    where: { bookId: sarahCrBook.id, userId: sarah.id, isSeeded: true },
  });
  if (!sarahCrExisting) {
    await prisma.currentlyReadingBook.create({
      data: { bookId: sarahCrBook.id, userId: sarah.id, isSeeded: true, startedDate: new Date('2026-04-01'), currentPage: 200 },
    });
  }
  console.log('Seeded sarah_reads books');

  // Seed Marcus's completed books
  const marcusBooks = [
    {
      googleBooksId: 'B1hSG45JCX4C',
      title: 'Dune',
      authors: ['Frank Herbert'],
      description: 'Set on the desert planet Arrakis, Dune is the story of Paul Atreides.',
      coverImage: 'http://books.google.com/books/content?id=B1hSG45JCX4C&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      pageCount: 687,
      publishedDate: '2005-08-02',
      categories: ['Fiction'],
      completedDate: new Date('2026-01-28'),
      rating: 5,
      year: 2026,
    },
    {
      googleBooksId: 'IxdEDwAAQBAJ',
      title: 'Project Hail Mary',
      authors: ['Andy Weir'],
      description: 'A lone astronaut must save Earth from disaster in this propulsive interstellar adventure.',
      coverImage: 'http://books.google.com/books/content?id=IxdEDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      pageCount: 496,
      publishedDate: '2021-05-04',
      categories: ['Fiction'],
      completedDate: new Date('2026-03-05'),
      rating: 5,
      year: 2026,
    },
    {
      googleBooksId: 'iJmeBQAAQBAJ',
      title: 'The Martian',
      authors: ['Andy Weir'],
      description: 'An astronaut becomes stranded on Mars and must use his ingenuity to survive.',
      coverImage: 'http://books.google.com/books/content?id=iJmeBQAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
      pageCount: 369,
      publishedDate: '2014-02-11',
      categories: ['Fiction'],
      completedDate: new Date('2026-04-02'),
      rating: 4,
      year: 2026,
    },
  ];

  for (const bookData of marcusBooks) {
    const { completedDate, rating, year, ...bookFields } = bookData;
    const book = await prisma.book.upsert({
      where: { googleBooksId: bookFields.googleBooksId },
      update: {},
      create: { ...bookFields, authors: bookFields.authors, categories: bookFields.categories },
    });
    const existing = await prisma.completedBook.findFirst({
      where: { bookId: book.id, userId: marcus.id, isSeeded: true },
    });
    if (!existing) {
      await prisma.completedBook.create({
        data: { bookId: book.id, userId: marcus.id, isSeeded: true, completedDate, year, pageCount: bookFields.pageCount, rating },
      });
    }
  }

  // Marcus's DNF
  const marcusDnfBook = {
    googleBooksId: 'LuZ1zN4MXJYC',
    title: 'A Brief History of Time',
    authors: ['Stephen Hawking'],
    description: 'A landmark volume in science writing exploring the big bang, black holes, and the nature of time.',
    coverImage: 'http://books.google.com/books/content?id=LuZ1zN4MXJYC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
    pageCount: 212,
    publishedDate: '1998-09-01',
    categories: ['Science'],
  };
  const marcusDnf = await prisma.book.upsert({
    where: { googleBooksId: marcusDnfBook.googleBooksId },
    update: {},
    create: { ...marcusDnfBook, authors: marcusDnfBook.authors, categories: marcusDnfBook.categories },
  });
  const marcusDnfExisting = await prisma.dNFBook.findFirst({
    where: { bookId: marcusDnf.id, userId: marcus.id, isSeeded: true },
  });
  if (!marcusDnfExisting) {
    await prisma.dNFBook.create({
      data: { bookId: marcusDnf.id, userId: marcus.id, isSeeded: true },
    });
  }
  console.log('Seeded marcus_b books');

  // Set yearly goals for both friends
  for (const { userId, goalCount } of [
    { userId: sarah.id, goalCount: 12 },
    { userId: marcus.id, goalCount: 20 },
  ]) {
    const existingGoal = await prisma.yearlyGoal.findUnique({
      where: { userId_year: { userId, year: 2026 } },
    });
    if (!existingGoal) {
      await prisma.yearlyGoal.create({ data: { userId, year: 2026, goalCount } });
    }
  }
  console.log('Set 2026 goals for friend users');

  console.log('Dev seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
