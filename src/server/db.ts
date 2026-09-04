/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import bcryptjs from 'bcryptjs';
import { 
  User, UserRole, Author, Category, Publisher, Book, 
  BorrowRecord, Reservation, Fine, Notification, 
  ContactSubmission, Review, ActivityLog, WishlistItem 
} from '../types.js';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Database helper functions
function readJSON<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    writeJSON(filename, defaultValue);
    return defaultValue;
  }
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`Error reading database file ${filename}:`, err);
    return defaultValue;
  }
}

function writeJSON<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing database file ${filename}:`, err);
  }
}

// Initialize tables with mock/seed data
const seedUsers = (): User[] => {
  const adminHash = bcryptjs.hashSync('Admin@123', 10);
  const studentHash = bcryptjs.hashSync('Student@123', 10);
  
  return [
    {
      id: 1,
      email: 'admin@library.com',
      firstName: 'Library',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      phone: '+1 (555) 0199',
      status: 'active',
      profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date('2026-01-01T00:00:00Z').toISOString()
    },
    {
      id: 2,
      email: 'student@library.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.STUDENT,
      phone: '+1 (555) 0122',
      status: 'active',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: new Date('2026-01-15T00:00:00Z').toISOString()
    },
    {
      id: 3,
      email: 'alice@library.com',
      firstName: 'Alice',
      lastName: 'Smith',
      role: UserRole.STUDENT,
      phone: '+1 (555) 0144',
      status: 'active',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: new Date('2026-02-01T00:00:00Z').toISOString()
    },
    {
      id: 4,
      email: 'bob@library.com',
      firstName: 'Bob',
      lastName: 'Johnson',
      role: UserRole.STUDENT,
      phone: '+1 (555) 0155',
      status: 'inactive',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      createdAt: new Date('2026-02-10T00:00:00Z').toISOString()
    }
  ];
};

const seedPasswords = (): Record<number, string> => {
  const adminHash = bcryptjs.hashSync('Admin@123', 10);
  const studentHash = bcryptjs.hashSync('Student@123', 10);
  return {
    1: adminHash,
    2: studentHash,
    3: studentHash,
    4: studentHash
  };
};

const seedAuthors = (): Author[] => [
  { id: 1, name: 'George Orwell', bio: 'English novelist, essayist, journalist and critic, famous for 1984 and Animal Farm.', birthDate: '1903-06-25' },
  { id: 2, name: 'J.K. Rowling', bio: 'British author, best known for the Harry Potter fantasy series.', birthDate: '1965-07-31' },
  { id: 3, name: 'Isaac Asimov', bio: 'American writer and professor of biochemistry, known for hard science fiction (Foundation series).', birthDate: '1920-01-02' },
  { id: 4, name: 'Harper Lee', bio: 'American novelist widely known for her Pulitzer Prize-winning bestseller To Kill a Mockingbird.', birthDate: '1926-04-28' },
  { id: 5, name: 'J.R.R. Tolkien', bio: 'English writer, poet, philologist, and academic, best known as the author of The Hobbit and The Lord of the Rings.', birthDate: '1892-01-03' },
  { id: 6, name: 'Jane Austen', bio: 'English novelist known primarily for her six major novels, which interpret, critique and comment upon the British landed gentry.', birthDate: '1775-12-16' },
  { id: 7, name: 'Stephen King', bio: 'American author of horror, supernatural fiction, suspense, crime, science-fiction, and fantasy novels.', birthDate: '1947-09-21' },
  { id: 8, name: 'Agatha Christie', bio: 'English writer known for her sixty-six detective novels and fourteen short story collections, particularly those revolving around fictional detectives Hercule Poirot and Miss Marple.', birthDate: '1890-09-15' },
  { id: 9, name: 'Arthur Conan Doyle', bio: 'British writer and physician, most noted for his fictional stories about the detective Sherlock Holmes.', birthDate: '1859-05-22' },
  { id: 10, name: 'F. Scott Fitzgerald', bio: 'American novelist, essayist, screenwriter, and short-story writer, best known for his novel The Great Gatsby.', birthDate: '1896-09-24' },
  { id: 11, name: 'Mary Shelley', bio: 'English novelist who wrote the Gothic novel Frankenstein; or, The Modern Prometheus.', birthDate: '1797-08-30' },
  { id: 12, name: 'Aldous Huxley', bio: 'English writer and philosopher, best known for his dystopian novel Brave New World.', birthDate: '1894-07-26' },
  { id: 13, name: 'Walter Isaacson', bio: 'American author, journalist, and professor, famous for writing biographies of Steve Jobs, Albert Einstein, and Elon Musk.', birthDate: '1952-05-20' },
  { id: 14, name: 'Robert C. Martin', bio: 'American software engineer, author, and consultant, widely known for Clean Code and being co-author of the Agile Manifesto.', birthDate: '1952-12-05' },
  { id: 15, name: 'Frank Herbert', bio: 'American science-fiction writer best known for his 1965 novel Dune and its five sequels.', birthDate: '1920-10-08' }
];

const seedCategories = (): Category[] => [
  { id: 1, name: 'Classic Literature', description: 'Timeless masterpieces of world literature.' },
  { id: 2, name: 'Fantasy', description: 'Epic fantasy, magic, worlds and mystical creatures.' },
  { id: 3, name: 'Science Fiction', description: 'Speculative fiction dealing with imaginative concepts like space exploration and time travel.' },
  { id: 4, name: 'Mystery & Thriller', description: 'Suspenseful plots, crime solving, and intense investigation.' },
  { id: 5, name: 'History & Biography', description: 'Real stories of the past and profiles of influential historical figures.' },
  { id: 6, name: 'Science & Technology', description: 'Popular science, coding, tech engineering, and physics.' }
];

const seedPublishers = (): Publisher[] => [
  { id: 1, name: 'Penguin Classics', address: '80 Strand, London, UK', contactPhone: '+44 20 7139 3000' },
  { id: 2, name: 'HarperCollins Publishers', address: '195 Broadway, New York, NY, USA', contactPhone: '+1 212-207-7000' },
  { id: 3, name: 'Bantam Books', address: '1745 Broadway, New York, NY, USA', contactPhone: '+1 212-782-9000' },
  { id: 4, name: 'Bloomsbury Publishing', address: '50 Bedford Square, London, UK', contactPhone: '+44 20 7631 5600' },
  { id: 5, name: 'Scribner', address: '1230 Avenue of the Americas, New York, NY, USA', contactPhone: '+1 212-698-7000' },
  { id: 6, name: 'Doubleday', address: '1745 Broadway, New York, NY, USA', contactPhone: '+1 212-782-9000' },
  { id: 7, name: 'Simon & Schuster', address: '1230 Avenue of the Americas, New York, NY, USA', contactPhone: '+1 212-698-7000' },
  { id: 8, name: 'Pearson Education', address: '80 Strand, London, UK', contactPhone: '+44 20 7010 2000' },
  { id: 9, name: 'Chilton Books', address: '201 King of Prussia Road, Radnor, PA, USA', contactPhone: '+1 610-964-4000' }
];

const seedBooks = (): Book[] => [
  {
    id: 1,
    isbn: '9780451524935',
    title: '1984',
    subtitle: 'A Novel of Social Science Fiction',
    authorId: 1,
    authorName: 'George Orwell',
    publisherId: 1,
    publisherName: 'Penguin Classics',
    categoryId: 3,
    categoryName: 'Science Fiction',
    publicationYear: 1949,
    edition: 'Signet Classic Edition',
    language: 'English',
    pages: 328,
    shelfNumber: 'SF-A4',
    quantity: 5,
    availableQuantity: 4,
    description: 'Winston Smith toes the Party line, rewriting history to satisfy the Ministry of Truth. With each lie he writes, Winston grows to hate the Party that seeks power for its own sake and persecutes those who dare to commit thoughtcrimes. But as he starts to think for himself, Winston cannot escape the fact that Big Brother is always watching...',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    status: 'available',
    rating: 4.8,
    reviewsCount: 2,
    createdAt: new Date('2026-01-02T10:00:00Z').toISOString()
  },
  {
    id: 2,
    isbn: '9780439708180',
    title: "Harry Potter and the Sorcerer's Stone",
    subtitle: 'Book 1 of the Harry Potter Series',
    authorId: 2,
    authorName: 'J.K. Rowling',
    publisherId: 4,
    publisherName: 'Bloomsbury Publishing',
    categoryId: 2,
    categoryName: 'Fantasy',
    publicationYear: 1997,
    edition: 'First US Edition',
    language: 'English',
    pages: 309,
    shelfNumber: 'F-B1',
    quantity: 6,
    availableQuantity: 5,
    description: 'Harry Potter has no idea how famous he is. That is because he is being raised by his miserable aunt and uncle who are terrified Harry will discover that he is a wizard, just as his parents were. But everything changes when Harry is summoned to attend an infamous school for wizards, and he begins a magic-filled adventure of a lifetime.',
    coverImage: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400',
    status: 'available',
    rating: 4.9,
    reviewsCount: 1,
    createdAt: new Date('2026-01-05T12:00:00Z').toISOString()
  },
  {
    id: 3,
    isbn: '9780061120084',
    title: 'To Kill a Mockingbird',
    subtitle: 'Classic American Drama',
    authorId: 4,
    authorName: 'Harper Lee',
    publisherId: 2,
    publisherName: 'HarperCollins Publishers',
    categoryId: 1,
    categoryName: 'Classic Literature',
    publicationYear: 1960,
    edition: '50th Anniversary Edition',
    language: 'English',
    pages: 324,
    shelfNumber: 'CL-A1',
    quantity: 4,
    availableQuantity: 3,
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it, To Kill a Mockingbird became both an instant bestseller and a critical success when it was first published. Compassionate, dramatic, and deeply moving, it takes readers to the roots of human behavior—to innocence and experience, kindness and cruelty, love and hatred.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    status: 'available',
    rating: 4.7,
    reviewsCount: 1,
    createdAt: new Date('2026-01-10T09:00:00Z').toISOString()
  },
  {
    id: 4,
    isbn: '9780553293357',
    title: 'Foundation',
    subtitle: 'Book 1 of the Foundation Trilogy',
    authorId: 3,
    authorName: 'Isaac Asimov',
    publisherId: 3,
    publisherName: 'Bantam Books',
    categoryId: 3,
    categoryName: 'Science Fiction',
    publicationYear: 1951,
    edition: 'Mass Market Paperback',
    language: 'English',
    pages: 244,
    shelfNumber: 'SF-C1',
    quantity: 3,
    availableQuantity: 2,
    description: 'For twelve thousand years the Galactic Empire has ruled supreme. Now it is dying. But only Hari Seldon, creator of the revolutionary science of psychohistory, can see into the future—to a dark age of ignorance, barbarism, and warfare that will last for thirty thousand years. To preserve knowledge and save mankind, Seldon gathers the best minds in the Empire and brings them to a bleak planet at the edge of the galaxy.',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    status: 'available',
    rating: 4.5,
    reviewsCount: 1,
    createdAt: new Date('2026-01-12T14:30:00Z').toISOString()
  },
  {
    id: 5,
    isbn: '9780261103252',
    title: 'The Lord of the Rings',
    subtitle: 'The Fellowship of the Ring',
    authorId: 5,
    authorName: 'J.R.R. Tolkien',
    publisherId: 2,
    publisherName: 'HarperCollins Publishers',
    categoryId: 2,
    categoryName: 'Fantasy',
    publicationYear: 1954,
    edition: 'Standard UK Edition',
    language: 'English',
    pages: 423,
    shelfNumber: 'F-C2',
    quantity: 4,
    availableQuantity: 4,
    description: 'One Ring to rule them all, One Ring to find them, One Ring to bring them all and in the darkness bind them. In ancient times the Rings of Power were crafted by the Elven-smiths, and Sauron, the Dark Lord, forged the One Ring, filling it with his own power so that he could rule all others. But the One Ring was taken from him...',
    coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400',
    status: 'available',
    rating: 5.0,
    reviewsCount: 1,
    createdAt: new Date('2026-01-20T16:00:00Z').toISOString()
  },
  {
    id: 6,
    isbn: '9780141439518',
    title: 'Pride and Prejudice',
    subtitle: 'An Elegant Regency Romance',
    authorId: 6,
    authorName: 'Jane Austen',
    publisherId: 1,
    publisherName: 'Penguin Classics',
    categoryId: 1,
    categoryName: 'Classic Literature',
    publicationYear: 1813,
    edition: 'Penguin Classics Deluxe',
    language: 'English',
    pages: 432,
    shelfNumber: 'CL-B3',
    quantity: 3,
    availableQuantity: 3,
    description: "No novel in English literature is more beloved than Pride and Prejudice. In telling the story of Elizabeth Bennet, a clever, spirited young woman, and Mr. Darcy, a wealthy, haughty aristocrat, Jane Austen created an unmatched battle of wits, a masterly comedy of manners, and a profound study of human psychology.",
    coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400',
    status: 'available',
    rating: 4.6,
    reviewsCount: 1,
    createdAt: new Date('2026-01-22T11:00:00Z').toISOString()
  },
  {
    id: 7,
    isbn: '9780439064866',
    title: 'Harry Potter and the Chamber of Secrets',
    subtitle: 'Book 2 of the Harry Potter Series',
    authorId: 2,
    authorName: 'J.K. Rowling',
    publisherId: 4,
    publisherName: 'Bloomsbury Publishing',
    categoryId: 2,
    categoryName: 'Fantasy',
    publicationYear: 1998,
    edition: 'First US Edition',
    language: 'English',
    pages: 341,
    shelfNumber: 'F-B2',
    quantity: 4,
    availableQuantity: 4,
    description: 'The Dursleys were so mean and hideous that summer that all Harry Potter wanted was to get back to the Hogwarts School for Witchcraft and Wizardry. But just as he’s packing his bags, Harry receives a warning from a strange, mischievous creature named Dobby who says that if Harry Potter returns to Hogwarts, disaster will strike.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    status: 'available',
    rating: 4.8,
    reviewsCount: 0,
    createdAt: new Date('2026-01-25T14:00:00Z').toISOString()
  },
  {
    id: 8,
    isbn: '9780439136365',
    title: 'Harry Potter and the Prisoner of Azkaban',
    subtitle: 'Book 3 of the Harry Potter Series',
    authorId: 2,
    authorName: 'J.K. Rowling',
    publisherId: 4,
    publisherName: 'Bloomsbury Publishing',
    categoryId: 2,
    categoryName: 'Fantasy',
    publicationYear: 1999,
    edition: 'First US Edition',
    language: 'English',
    pages: 435,
    shelfNumber: 'F-B3',
    quantity: 5,
    availableQuantity: 5,
    description: 'For twelve long years, the dread fortress of Azkaban held an infamous prisoner named Sirius Black. Convicted of killing thirteen people with a single curse, he was said to be the heir apparent to the Dark Lord, Voldemort. Now he has escaped, leaving only two clues as to where he might be headed...',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    status: 'available',
    rating: 4.9,
    reviewsCount: 0,
    createdAt: new Date('2026-01-26T09:00:00Z').toISOString()
  },
  {
    id: 9,
    isbn: '9780451526342',
    title: 'Animal Farm',
    subtitle: 'A Fairy Story',
    authorId: 1,
    authorName: 'George Orwell',
    publisherId: 1,
    publisherName: 'Penguin Classics',
    categoryId: 1,
    categoryName: 'Classic Literature',
    publicationYear: 1945,
    edition: 'Signet Classic Edition',
    language: 'English',
    pages: 141,
    shelfNumber: 'CL-A2',
    quantity: 8,
    availableQuantity: 8,
    description: 'A farm is taken over by its overworked, mistreated animals. With flaming idealism and stirring slogans, they set out to create a paradise of progress, justice, and equality. Thus the stage is set for one of the most telling satiric fables ever penned—a razor-sharp fairy-tale for grown-ups that records the evolution of revolution.',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400',
    status: 'available',
    rating: 4.7,
    reviewsCount: 0,
    createdAt: new Date('2026-01-28T10:00:00Z').toISOString()
  },
  {
    id: 10,
    isbn: '9780261103344',
    title: 'The Hobbit',
    subtitle: 'There and Back Again',
    authorId: 5,
    authorName: 'J.R.R. Tolkien',
    publisherId: 2,
    publisherName: 'HarperCollins Publishers',
    categoryId: 2,
    categoryName: 'Fantasy',
    publicationYear: 1937,
    edition: 'Illustrated Edition',
    language: 'English',
    pages: 310,
    shelfNumber: 'F-C1',
    quantity: 6,
    availableQuantity: 6,
    description: 'Bilbo Baggins is a hobbit who enjoys a comfortable, unambitious life, rarely traveling any farther than his pantry or cellar. But his contentment is disturbed when the wizard Gandalf and a company of dwarves arrive on his doorstep one day to enlist him as their burglar in a quest to raid the treasure hoard of Smaug the Magnificent.',
    coverImage: 'https://images.unsplash.com/photo-1618666012114-a19ff33a457f?w=400',
    status: 'available',
    rating: 4.8,
    reviewsCount: 0,
    createdAt: new Date('2026-01-29T11:00:00Z').toISOString()
  },
  {
    id: 11,
    isbn: '9780345339713',
    title: 'The Lord of the Rings: The Two Towers',
    subtitle: 'Part 2 of the Epic Fantasy',
    authorId: 5,
    authorName: 'J.R.R. Tolkien',
    publisherId: 2,
    publisherName: 'HarperCollins Publishers',
    categoryId: 2,
    categoryName: 'Fantasy',
    publicationYear: 1954,
    edition: 'Standard UK Edition',
    language: 'English',
    pages: 352,
    shelfNumber: 'F-C3',
    quantity: 4,
    availableQuantity: 4,
    description: 'The Fellowship has been scattered. Some are preparing for war against the Dark Lord Sauron. Others are dealing with the treachery of Saruman. Meanwhile, Frodo and Sam must continue their dangerous journey to Mount Doom to destroy the One Ring, guided by the mysterious and untrustworthy Gollum.',
    coverImage: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=400',
    status: 'available',
    rating: 4.9,
    reviewsCount: 0,
    createdAt: new Date('2026-01-30T14:00:00Z').toISOString()
  },
  {
    id: 12,
    isbn: '9780345339737',
    title: 'The Lord of the Rings: The Return of the King',
    subtitle: 'Part 3 of the Epic Fantasy',
    authorId: 5,
    authorName: 'J.R.R. Tolkien',
    publisherId: 2,
    publisherName: 'HarperCollins Publishers',
    categoryId: 2,
    categoryName: 'Fantasy',
    publicationYear: 1955,
    edition: 'Standard UK Edition',
    language: 'English',
    pages: 416,
    shelfNumber: 'F-C4',
    quantity: 4,
    availableQuantity: 4,
    description: 'The final battle for Middle-earth begins. Sauron’s armies are laying siege to Minas Tirith, the great stone city of Gondor. Aragorn must rise to claim his birthright as King of Men. Meanwhile, Frodo and Sam approach the fiery cracks of Mount Doom to fulfill their quest, facing the ultimate test of strength and friendship.',
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    status: 'available',
    rating: 5.0,
    reviewsCount: 0,
    createdAt: new Date('2026-01-31T15:00:00Z').toISOString()
  },
  {
    id: 13,
    isbn: '9780553382563',
    title: 'I, Robot',
    subtitle: 'Nine Science Fiction Stories',
    authorId: 3,
    authorName: 'Isaac Asimov',
    publisherId: 3,
    publisherName: 'Bantam Books',
    categoryId: 3,
    categoryName: 'Science Fiction',
    publicationYear: 1950,
    edition: 'Spectra Edition',
    language: 'English',
    pages: 224,
    shelfNumber: 'SF-C2',
    quantity: 4,
    availableQuantity: 4,
    description: 'In this collection of stories, Asimov chronicles the development of artificial intelligence and robotics from crude beginnings to ultimate dominance. He introduces the famous Three Laws of Robotics, designed to protect humans from their mechanical creations, and explores how those laws can fail in unexpected ways.',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    status: 'available',
    rating: 4.6,
    reviewsCount: 0,
    createdAt: new Date('2026-02-01T10:00:00Z').toISOString()
  },
  {
    id: 14,
    isbn: '9780385121675',
    title: 'The Shining',
    subtitle: 'A Masterpiece of Modern Terror',
    authorId: 7,
    authorName: 'Stephen King',
    publisherId: 6,
    publisherName: 'Doubleday',
    categoryId: 4,
    categoryName: 'Mystery & Thriller',
    publicationYear: 1977,
    edition: 'First Edition Reprint',
    language: 'English',
    pages: 447,
    shelfNumber: 'MT-A1',
    quantity: 3,
    availableQuantity: 3,
    description: 'Jack Torrance accepts a job as the winter caretaker of the historic Overlook Hotel, hoping to reconnect with his family and find the peace he needs to write. But as the winter storms close in, the hotel’s dark, malevolent secrets begin to unfold, affecting Jack’s sanity and putting his family in grave danger.',
    coverImage: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400',
    status: 'available',
    rating: 4.7,
    reviewsCount: 0,
    createdAt: new Date('2026-02-02T11:00:00Z').toISOString()
  },
  {
    id: 15,
    isbn: '9780062073501',
    title: 'Murder on the Orient Express',
    subtitle: 'A Hercule Poirot Mystery',
    authorId: 8,
    authorName: 'Agatha Christie',
    publisherId: 2,
    publisherName: 'HarperCollins Publishers',
    categoryId: 4,
    categoryName: 'Mystery & Thriller',
    publicationYear: 1934,
    edition: 'Poirot Signature Edition',
    language: 'English',
    pages: 256,
    shelfNumber: 'MT-B1',
    quantity: 5,
    availableQuantity: 5,
    description: 'Just after midnight, a snowdrift stops the Orient Express in its tracks. The luxurious train is surprisingly full for the time of the year, but by the morning it has one passenger fewer. An American tycoon lies dead in his compartment, stabbed a dozen times, his door locked from the inside. Hercule Poirot must find the killer.',
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400',
    status: 'available',
    rating: 4.8,
    reviewsCount: 0,
    createdAt: new Date('2026-02-03T12:00:00Z').toISOString()
  },
  {
    id: 16,
    isbn: '9780140437713',
    title: 'The Adventures of Sherlock Holmes',
    subtitle: 'Classic Detective Tales',
    authorId: 9,
    authorName: 'Arthur Conan Doyle',
    publisherId: 2,
    publisherName: 'HarperCollins Publishers',
    categoryId: 4,
    categoryName: 'Mystery & Thriller',
    publicationYear: 1892,
    edition: 'Penguin Popular Classics',
    language: 'English',
    pages: 350,
    shelfNumber: 'MT-C1',
    quantity: 4,
    availableQuantity: 4,
    description: 'A collection of twelve short stories featuring Arthur Conan Doyle’s legendary consulting detective Sherlock Holmes and his loyal companion Dr. John H. Watson. Includes famous mysteries like "A Scandal in Bohemia", "The Red-Headed League", and "The Adventure of the Speckled Band".',
    coverImage: 'https://images.unsplash.com/photo-1629019725048-776e2740af33?w=400',
    status: 'available',
    rating: 4.7,
    reviewsCount: 0,
    createdAt: new Date('2026-02-04T13:00:00Z').toISOString()
  },
  {
    id: 17,
    isbn: '9780743273565',
    title: 'The Great Gatsby',
    subtitle: 'Jazz Age Classic',
    authorId: 10,
    authorName: 'F. Scott Fitzgerald',
    publisherId: 5,
    publisherName: 'Scribner',
    categoryId: 1,
    categoryName: 'Classic Literature',
    publicationYear: 1925,
    edition: 'Scribner Trade Paperback',
    language: 'English',
    pages: 180,
    shelfNumber: 'CL-B1',
    quantity: 4,
    availableQuantity: 4,
    description: 'Set in Long Island during the Roaring Twenties, Fitzgerald’s brilliant, poetic masterpiece tells the story of Jay Gatsby, a self-made millionaire, and his tragic obsession with the beautiful Daisy Buchanan. A powerful critique of the American Dream, disillusionment, and wealth excess.',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400',
    status: 'available',
    rating: 4.5,
    reviewsCount: 0,
    createdAt: new Date('2026-02-05T14:00:00Z').toISOString()
  },
  {
    id: 18,
    isbn: '9780141439471',
    title: 'Frankenstein',
    subtitle: 'The Modern Prometheus',
    authorId: 11,
    authorName: 'Mary Shelley',
    publisherId: 1,
    publisherName: 'Penguin Classics',
    categoryId: 1,
    categoryName: 'Classic Literature',
    publicationYear: 1818,
    edition: 'Penguin Classics Deluxe',
    language: 'English',
    pages: 288,
    shelfNumber: 'CL-C1',
    quantity: 4,
    availableQuantity: 4,
    description: 'Obsessed with the secret of life, young scientist Victor Frankenstein pieces together human remains to construct a giant, animate creature. Terrified by his creation’s hideousness, Victor flees, leaving the creature lonely, rejected, and seeking vengeance against its maker.',
    coverImage: 'https://images.unsplash.com/photo-1511108690759-009324a90311?w=400',
    status: 'available',
    rating: 4.4,
    reviewsCount: 0,
    createdAt: new Date('2026-02-06T15:00:00Z').toISOString()
  },
  {
    id: 19,
    isbn: '9780060850524',
    title: 'Brave New World',
    subtitle: 'A Dystopian Masterpiece',
    authorId: 12,
    authorName: 'Aldous Huxley',
    publisherId: 2,
    publisherName: 'HarperCollins Publishers',
    categoryId: 3,
    categoryName: 'Science Fiction',
    publicationYear: 1932,
    edition: 'Perennial Classics Edition',
    language: 'English',
    pages: 268,
    shelfNumber: 'SF-B1',
    quantity: 5,
    availableQuantity: 5,
    description: 'Huxley’s classic dystopian novel describes a genetically engineered, highly conformity-driven society where citizens are kept content through consumerism, biological engineering, and a mood-stabilizing drug called Soma. A powerful exploration of freedom, technological control, and human cost.',
    coverImage: 'https://images.unsplash.com/photo-1531988042231-d39a9cc12a9a?w=400',
    status: 'available',
    rating: 4.6,
    reviewsCount: 0,
    createdAt: new Date('2026-02-07T16:00:00Z').toISOString()
  },
  {
    id: 20,
    isbn: '9781451648539',
    title: 'Steve Jobs',
    subtitle: 'The Exclusive Biography',
    authorId: 13,
    authorName: 'Walter Isaacson',
    publisherId: 7,
    publisherName: 'Simon & Schuster',
    categoryId: 5,
    categoryName: 'History & Biography',
    publicationYear: 2011,
    edition: 'Hardcover First Edition',
    language: 'English',
    pages: 656,
    shelfNumber: 'HB-A1',
    quantity: 3,
    availableQuantity: 3,
    description: 'Based on more than forty interviews with Steve Jobs conducted over two years, as well as interviews with more than a hundred family members, friends, adversaries, competitors, and colleagues, Walter Isaacson has written a riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur.',
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
    status: 'available',
    rating: 4.7,
    reviewsCount: 0,
    createdAt: new Date('2026-02-08T09:00:00Z').toISOString()
  },
  {
    id: 21,
    isbn: '9780132350884',
    title: 'Clean Code',
    subtitle: 'A Handbook of Agile Software Craftsmanship',
    authorId: 14,
    authorName: 'Robert C. Martin',
    publisherId: 8,
    publisherName: 'Pearson Education',
    categoryId: 6,
    categoryName: 'Science & Technology',
    publicationYear: 2008,
    edition: 'Agile Software Development Series',
    language: 'English',
    pages: 464,
    shelfNumber: 'ST-A1',
    quantity: 6,
    availableQuantity: 6,
    description: 'Even bad code can function. But if code isn’t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. Software expert Robert C. Martin presents a revolutionary paradigm with Clean Code.',
    coverImage: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=400',
    status: 'available',
    rating: 4.8,
    reviewsCount: 0,
    createdAt: new Date('2026-02-09T10:00:00Z').toISOString()
  },
  {
    id: 22,
    isbn: '9780553293432',
    title: 'The Caves of Steel',
    subtitle: 'Book 1 of the Robot Series',
    authorId: 3,
    authorName: 'Isaac Asimov',
    publisherId: 3,
    publisherName: 'Bantam Books',
    categoryId: 3,
    categoryName: 'Science Fiction',
    publicationYear: 1953,
    edition: 'Mass Market Paperback',
    language: 'English',
    pages: 206,
    shelfNumber: 'SF-C3',
    quantity: 3,
    availableQuantity: 3,
    description: 'A detective story featuring New York City police detective Elijah Baley and his humanoid robot partner, R. Daneel Olivaw, as they investigate the murder of a prominent Spacer scientist in the Spacertown settlement outside Earth’s domed cities.',
    coverImage: 'https://images.unsplash.com/photo-1618666012114-a19ff33a457f?w=400',
    status: 'available',
    rating: 4.5,
    reviewsCount: 0,
    createdAt: new Date('2026-02-10T11:00:00Z').toISOString()
  },
  {
    id: 23,
    isbn: '9780141439662',
    title: 'Sense and Sensibility',
    subtitle: 'A Tale of Two Sisters',
    authorId: 6,
    authorName: 'Jane Austen',
    publisherId: 1,
    publisherName: 'Penguin Classics',
    categoryId: 1,
    categoryName: 'Classic Literature',
    publicationYear: 1811,
    edition: 'Penguin Classics Deluxe',
    language: 'English',
    pages: 409,
    shelfNumber: 'CL-B4',
    quantity: 3,
    availableQuantity: 3,
    description: 'Marianne Dashwood wears her heart on her sleeve, and when she falls in love with the dashing but unsuitable John Willoughby she ignores her sister Elinor’s warning that her impulsive behaviour leaves her open to gossip and innuendo. Elinor, meanwhile, is struggling to conceal her own romantic disappointment.',
    coverImage: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400',
    status: 'available',
    rating: 4.6,
    reviewsCount: 0,
    createdAt: new Date('2026-02-11T12:00:00Z').toISOString()
  },
  {
    id: 24,
    isbn: '9780451169519',
    title: 'It',
    subtitle: 'The Epic Supernatural Horror',
    authorId: 7,
    authorName: 'Stephen King',
    publisherId: 6,
    publisherName: 'Doubleday',
    categoryId: 4,
    categoryName: 'Mystery & Thriller',
    publicationYear: 1986,
    edition: 'Mass Market Paperback',
    language: 'English',
    pages: 1138,
    shelfNumber: 'MT-A2',
    quantity: 4,
    availableQuantity: 4,
    description: 'They were seven teenagers when they first stumbled upon a horrifying, shape-shifting entity that preyed on the children of Derry, Maine. Now they are adults, successful and living far away, but a terrible phone call summons them back to Derry to face the nightmare once again.',
    coverImage: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400',
    status: 'available',
    rating: 4.8,
    reviewsCount: 0,
    createdAt: new Date('2026-02-12T13:00:00Z').toISOString()
  },
  {
    id: 25,
    isbn: '9781982181284',
    title: 'Elon Musk',
    subtitle: 'The Inspiring Modern Biography',
    authorId: 13,
    authorName: 'Walter Isaacson',
    publisherId: 7,
    publisherName: 'Simon & Schuster',
    categoryId: 5,
    categoryName: 'History & Biography',
    publicationYear: 2023,
    edition: 'First Edition Hardcover',
    language: 'English',
    pages: 688,
    shelfNumber: 'HB-A2',
    quantity: 4,
    availableQuantity: 4,
    description: 'From the author of Steve Jobs and other bestselling biographies, this is the astonishingly intimate story of the most fascinating and controversial innovator of our era—a rule-breaking visionary who helped to lead the world into the era of electric vehicles, private space exploration, and artificial intelligence.',
    coverImage: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400',
    status: 'available',
    rating: 4.4,
    reviewsCount: 0,
    createdAt: new Date('2026-02-13T14:00:00Z').toISOString()
  },
  {
    id: 26,
    isbn: '9780618640157',
    title: 'Dune',
    subtitle: 'The Epic Science Fiction Masterpiece',
    authorId: 15,
    authorName: 'Frank Herbert',
    publisherId: 9,
    publisherName: 'Chilton Books',
    categoryId: 3,
    categoryName: 'Science Fiction',
    publicationYear: 1965,
    edition: '40th Anniversary Edition',
    language: 'English',
    pages: 604,
    shelfNumber: 'SF-D1',
    quantity: 5,
    availableQuantity: 5,
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, who would become the mysterious man known as Muad’Dib. He would avenge the traitorous plot against his noble family and bring to fruition humankind’s most ancient and unattainable dream.',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    status: 'available',
    rating: 4.9,
    reviewsCount: 0,
    createdAt: new Date('2026-02-14T15:00:00Z').toISOString()
  }
];

// Seed Transactions to make charts and analytics rich on startup
const seedBorrowRecords = (): BorrowRecord[] => {
  const today = new Date();
  
  // Create some past dates for charts (last 6 months)
  const getPastDate = (monthsAgo: number, day: number): string => {
    const d = new Date(today);
    d.setMonth(today.getMonth() - monthsAgo);
    d.setDate(day);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 1,
      userId: 2, // John Doe
      bookId: 1, // 1984
      userName: 'John Doe',
      userEmail: 'student@library.com',
      bookTitle: '1984',
      bookAuthor: 'George Orwell',
      borrowDate: getPastDate(3, 10),
      dueDate: getPastDate(3, 24),
      returnDate: getPastDate(3, 23),
      status: 'returned',
      renewalsCount: 0,
      fineAmount: 0
    },
    {
      id: 2,
      userId: 2, // John Doe
      bookId: 2, // Harry Potter
      userName: 'John Doe',
      userEmail: 'student@library.com',
      bookTitle: "Harry Potter and the Sorcerer's Stone",
      bookAuthor: 'J.K. Rowling',
      borrowDate: getPastDate(2, 5),
      dueDate: getPastDate(2, 19),
      returnDate: getPastDate(2, 18),
      status: 'returned',
      renewalsCount: 0,
      fineAmount: 0
    },
    {
      id: 3,
      userId: 3, // Alice Smith
      bookId: 3, // To Kill a Mockingbird
      userName: 'Alice Smith',
      userEmail: 'alice@library.com',
      bookTitle: 'To Kill a Mockingbird',
      bookAuthor: 'Harper Lee',
      borrowDate: getPastDate(1, 15),
      dueDate: getPastDate(1, 29),
      returnDate: getPastDate(1, 30), // Overdue by 1 day
      status: 'returned',
      renewalsCount: 0,
      fineAmount: 1.00
    },
    {
      id: 4,
      userId: 2, // John Doe
      bookId: 4, // Foundation
      userName: 'John Doe',
      userEmail: 'student@library.com',
      bookTitle: 'Foundation',
      bookAuthor: 'Isaac Asimov',
      borrowDate: getPastDate(0, 10), // Borrowed 26 days ago (assuming current date is July 6)
      dueDate: getPastDate(0, 24),    // Overdue by many days! (approx 12 days)
      status: 'borrowed',
      renewalsCount: 0,
      fineAmount: 12.00
    },
    {
      id: 5,
      userId: 3, // Alice Smith
      bookId: 1, // 1984
      userName: 'Alice Smith',
      userEmail: 'alice@library.com',
      bookTitle: '1984',
      bookAuthor: 'George Orwell',
      borrowDate: getPastDate(0, 28), // Borrowed 8 days ago
      dueDate: getPastDate(0, 12),    // Due 12 days in the future (relative to today)
      status: 'borrowed',
      renewalsCount: 0,
      fineAmount: 0
    },
    {
      id: 6,
      userId: 2, // John Doe
      bookId: 3, // To Kill a Mockingbird
      userName: 'John Doe',
      userEmail: 'student@library.com',
      bookTitle: 'To Kill a Mockingbird',
      bookAuthor: 'Harper Lee',
      borrowDate: getPastDate(0, 1), // Borrowed 5 days ago
      dueDate: getPastDate(0, 15),   // Due in 9 days
      status: 'borrowed',
      renewalsCount: 0,
      fineAmount: 0
    }
  ];
};

const seedReservations = (): Reservation[] => {
  const today = new Date();
  const getFutureDate = (days: number): string => {
    const d = new Date(today);
    d.setDate(today.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  return [
    {
      id: 1,
      userId: 2,
      userName: 'John Doe',
      userEmail: 'student@library.com',
      bookId: 6, // Pride and Prejudice
      bookTitle: 'Pride and Prejudice',
      bookAuthor: 'Jane Austen',
      reservationDate: today.toISOString().split('T')[0],
      expiryDate: getFutureDate(3),
      status: 'pending'
    },
    {
      id: 2,
      userId: 3,
      userName: 'Alice Smith',
      userEmail: 'alice@library.com',
      bookId: 2, // Harry Potter
      bookTitle: "Harry Potter and the Sorcerer's Stone",
      bookAuthor: 'J.K. Rowling',
      reservationDate: today.toISOString().split('T')[0],
      expiryDate: getFutureDate(3),
      status: 'available'
    }
  ];
};

const seedFines = (): Fine[] => [
  {
    id: 1,
    userId: 3,
    userName: 'Alice Smith',
    userEmail: 'alice@library.com',
    borrowRecordId: 3,
    bookTitle: 'To Kill a Mockingbird',
    fineAmount: 1.00,
    paidAmount: 1.00,
    waivedAmount: 0.00,
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'paid'
  },
  {
    id: 2,
    userId: 2,
    userName: 'John Doe',
    userEmail: 'student@library.com',
    borrowRecordId: 4,
    bookTitle: 'Foundation',
    fineAmount: 12.00,
    paidAmount: 0.00,
    waivedAmount: 0.00,
    status: 'unpaid'
  }
];

const seedNotifications = (): Notification[] => [
  {
    id: 1,
    userId: 2,
    title: 'Welcome to the Library!',
    message: 'We are thrilled to have you here. Browse over thousands of titles and manage your loans easily.',
    type: 'success',
    isRead: false,
    createdAt: new Date('2026-06-15T08:00:00Z').toISOString()
  },
  {
    id: 2,
    userId: 2,
    title: 'Book Borrowed Successfully',
    message: 'You have successfully borrowed "Foundation" by Isaac Asimov. It is due on ' + new Date(new Date().setDate(new Date().getDate() + 14)).toLocaleDateString(),
    type: 'info',
    isRead: true,
    createdAt: new Date('2026-06-25T10:30:00Z').toISOString()
  },
  {
    id: 3,
    userId: 2,
    title: 'Overdue Notice',
    message: 'Your loan for "Foundation" is currently overdue. A fine of $1.00 per day has been registered.',
    type: 'warning',
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    userId: 3,
    title: 'Reservation Ready',
    message: 'The reserved book "Harry Potter and the Sorcerer\'s Stone" is now available on shelf F-B1. Please pick it up before the reservation expires.',
    type: 'success',
    isRead: false,
    createdAt: new Date().toISOString()
  }
];

const seedReviews = (): Review[] => [
  {
    id: 1,
    userId: 2,
    userName: 'John Doe',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bookId: 1,
    rating: 5,
    comment: 'An absolute masterpiece of futuristic control and thought policing. Orwell’s dark vision is more relevant today than ever.',
    createdAt: new Date('2026-05-10T14:22:00Z').toISOString()
  },
  {
    id: 2,
    userId: 3,
    userName: 'Alice Smith',
    userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bookId: 1,
    rating: 4,
    comment: 'Incredibly chilling and atmospheric. A very important book that should be read by everyone.',
    createdAt: new Date('2026-05-18T10:15:00Z').toISOString()
  },
  {
    id: 3,
    userId: 2,
    userName: 'John Doe',
    userPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bookId: 2,
    rating: 5,
    comment: 'The beginning of a magical journey! Rowling crafts a beautiful world that captures the imagination instantly.',
    createdAt: new Date('2026-06-01T09:45:00Z').toISOString()
  }
];

const seedContacts = (): ContactSubmission[] => [
  {
    id: 1,
    name: 'Emily Davis',
    email: 'emily@gmail.com',
    phone: '+1 (555) 0188',
    subject: 'Book Request',
    message: 'Could the library procure the latest edition of "Designing Data-Intensive Applications" by Martin Kleppmann? Many computer science students are looking for it.',
    status: 'unread',
    createdAt: new Date('2026-07-01T15:00:00Z').toISOString()
  }
];

const seedActivityLogs = (): ActivityLog[] => [
  { id: 1, action: 'User Registration', details: 'Librarian/Admin (admin@library.com) registered successfully.', createdAt: new Date('2026-01-01T00:00:00Z').toISOString() },
  { id: 2, action: 'User Registration', details: 'Student (student@library.com) registered successfully.', createdAt: new Date('2026-01-15T00:00:00Z').toISOString() },
  { id: 3, action: 'Book Insertion', details: 'Added new book: "1984" by George Orwell.', createdAt: new Date('2026-01-02T10:05:00Z').toISOString() },
  { id: 4, action: 'Book Issued', details: 'Book "1984" issued to John Doe (student@library.com).', createdAt: new Date().toISOString() }
];

// Load database instances
export const usersDB = {
  getAll: () => readJSON<User[]>('users.json', seedUsers()),
  getPasswords: () => readJSON<Record<number, string>>('passwords.json', seedPasswords()),
  save: (data: User[]) => writeJSON<User[]>('users.json', data),
  savePasswords: (data: Record<number, string>) => writeJSON<Record<number, string>>('passwords.json', data)
};

export const authorsDB = {
  getAll: () => readJSON<Author[]>('authors.json', seedAuthors()),
  save: (data: Author[]) => writeJSON<Author[]>('authors.json', data)
};

export const categoriesDB = {
  getAll: () => readJSON<Category[]>('categories.json', seedCategories()),
  save: (data: Category[]) => writeJSON<Category[]>('categories.json', data)
};

export const publishersDB = {
  getAll: () => readJSON<Publisher[]>('publishers.json', seedPublishers()),
  save: (data: Publisher[]) => writeJSON<Publisher[]>('publishers.json', data)
};

export const booksDB = {
  getAll: () => readJSON<Book[]>('books.json', seedBooks()),
  save: (data: Book[]) => writeJSON<Book[]>('books.json', data)
};

export const borrowDB = {
  getAll: () => readJSON<BorrowRecord[]>('borrow_records.json', seedBorrowRecords()),
  save: (data: BorrowRecord[]) => writeJSON<BorrowRecord[]>('borrow_records.json', data)
};

export const reservationsDB = {
  getAll: () => readJSON<Reservation[]>('reservations.json', seedReservations()),
  save: (data: Reservation[]) => writeJSON<Reservation[]>('reservations.json', data)
};

export const finesDB = {
  getAll: () => readJSON<Fine[]>('fines.json', seedFines()),
  save: (data: Fine[]) => writeJSON<Fine[]>('fines.json', data)
};

export const notificationsDB = {
  getAll: () => readJSON<Notification[]>('notifications.json', seedNotifications()),
  save: (data: Notification[]) => writeJSON<Notification[]>('notifications.json', data)
};

export const reviewsDB = {
  getAll: () => readJSON<Review[]>('reviews.json', seedReviews()),
  save: (data: Review[]) => writeJSON<Review[]>('reviews.json', data)
};

export const contactsDB = {
  getAll: () => readJSON<ContactSubmission[]>('contacts.json', seedContacts()),
  save: (data: ContactSubmission[]) => writeJSON<ContactSubmission[]>('contacts.json', data)
};

export const logsDB = {
  getAll: () => readJSON<ActivityLog[]>('activity_logs.json', seedActivityLogs()),
  save: (data: ActivityLog[]) => writeJSON<ActivityLog[]>('activity_logs.json', data)
};

export const wishlistDB = {
  getAll: () => readJSON<WishlistItem[]>('wishlist.json', []),
  save: (data: WishlistItem[]) => writeJSON<WishlistItem[]>('wishlist.json', data)
};

// Auto-upgrade block for expanded books seed
try {
  const currentBooks = booksDB.getAll();
  const freshSeedBooks = seedBooks();
  if (currentBooks.length < freshSeedBooks.length) {
    console.log(`[Database Migration] Upgrading books collection. Current: ${currentBooks.length}, Seeded: ${freshSeedBooks.length}`);
    booksDB.save(freshSeedBooks);
    
    // Also sync authors
    const freshSeedAuthors = seedAuthors();
    const currentAuthors = authorsDB.getAll();
    if (currentAuthors.length < freshSeedAuthors.length) {
      authorsDB.save(freshSeedAuthors);
    }
    
    // Also sync publishers
    const freshSeedPublishers = seedPublishers();
    const currentPublishers = publishersDB.getAll();
    if (currentPublishers.length < freshSeedPublishers.length) {
      publishersDB.save(freshSeedPublishers);
    }
    
    // Also sync categories
    const freshSeedCategories = seedCategories();
    const currentCategories = categoriesDB.getAll();
    if (currentCategories.length < freshSeedCategories.length) {
      categoriesDB.save(freshSeedCategories);
    }
  }
} catch (err) {
  console.error('[Database Migration] Error auto-upgrading books database:', err);
}

// Logger Utility
export function logActivity(userId: number | undefined, action: string, details: string): void {
  const logs = logsDB.getAll();
  const users = usersDB.getAll();
  const user = userId ? users.find(u => u.id === userId) : null;
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Guest/System';
  
  const newLog: ActivityLog = {
    id: logs.length > 0 ? Math.max(...logs.map(l => l.id)) + 1 : 1,
    userId,
    userName,
    action,
    details,
    createdAt: new Date().toISOString()
  };
  
  logs.unshift(newLog); // Prepend so most recent is first
  logsDB.save(logs.slice(0, 500)); // Keep last 500 logs
}

// Global scheduler/fine checker that runs on queries
// Fine starts after dueDate. It is Rs. 10.00 per day.
export function updateFinesAndOverdueStatus(): void {
  const today = new Date();
  today.setHours(0,0,0,0);
  const borrows = borrowDB.getAll();
  const fines = finesDB.getAll();
  const users = usersDB.getAll();
  const notifications = notificationsDB.getAll();
  
  let modifiedBorrows = false;
  let modifiedFines = false;
  let modifiedNotifications = false;

  borrows.forEach(record => {
    if (record.status === 'borrowed' || record.status === 'renewed') {
      const dueDate = new Date(record.dueDate);
      dueDate.setHours(0,0,0,0);
      
      if (dueDate < today) {
        // Overdue! Calculate days overdue
        const diffTime = today.getTime() - dueDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const fineAmount = diffDays * 10; // Rs. 10 per day
        
        record.status = 'overdue';
        record.fineAmount = fineAmount;
        (record as any).fine = fineAmount;
        (record as any).updatedAt = new Date().toISOString();
        modifiedBorrows = true;

        // Sync fine in finesDB
        const existingFineIndex = fines.findIndex(f => f.borrowRecordId === record.id);
        if (existingFineIndex !== -1) {
          const f = fines[existingFineIndex];
          if (f.status === 'unpaid' && f.fineAmount !== fineAmount) {
            f.fineAmount = fineAmount;
            modifiedFines = true;
          }
        } else {
          // Create new fine record
          const user = users.find(u => u.id === record.userId);
          const newFine: Fine = {
            id: fines.length > 0 ? Math.max(...fines.map(fi => fi.id)) + 1 : 1,
            userId: record.userId,
            userName: user ? `${user.firstName} ${user.lastName}` : record.userName,
            userEmail: user ? user.email : record.userEmail,
            borrowRecordId: record.id,
            bookTitle: record.bookTitle,
            fineAmount,
            paidAmount: 0.00,
            waivedAmount: 0.00,
            status: 'unpaid'
          };
          fines.push(newFine);
          modifiedFines = true;

          // Add Overdue Notification
          const newNotif: Notification = {
            id: notifications.length > 0 ? Math.max(...notifications.map(n => n.id)) + 1 : 1,
            userId: record.userId,
            title: 'Overdue Book Fine Generated',
            message: `The book "${record.bookTitle}" is overdue. A fine of Rs. ${fineAmount} has been registered. Please return it as soon as possible.`,
            type: 'error',
            isRead: false,
            createdAt: new Date().toISOString()
          };
          notifications.unshift(newNotif);
          modifiedNotifications = true;
        }
      }
    } else if (record.status === 'overdue') {
      // Overdue. Keep calculating fine
      const dueDate = new Date(record.dueDate);
      dueDate.setHours(0,0,0,0);
      const returnDate = record.returnDate ? new Date(record.returnDate) : today;
      returnDate.setHours(0,0,0,0);
      const diffTime = returnDate.getTime() - dueDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const fineAmount = diffDays * 10;

      if (record.fineAmount !== fineAmount) {
        record.fineAmount = fineAmount;
        (record as any).fine = fineAmount;
        (record as any).updatedAt = new Date().toISOString();
        modifiedBorrows = true;

        const fine = fines.find(f => f.borrowRecordId === record.id);
        if (fine && fine.status === 'unpaid') {
          fine.fineAmount = fineAmount;
          modifiedFines = true;
        }
      }
    }
  });

  if (modifiedBorrows) borrowDB.save(borrows);
  if (modifiedFines) finesDB.save(fines);
  if (modifiedNotifications) notificationsDB.save(notifications);
}
