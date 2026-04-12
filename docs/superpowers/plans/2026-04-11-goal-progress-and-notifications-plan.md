# Goal Progress Bars & Notifications System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reusable goal progress bars to Library, History, and Currently Reading pages, plus a full notifications system with bell icon, modal, DB persistence, and admin announcements tab.

**Architecture:** Feature 1 is frontend-only — a new GoalProgressBar component added to 3 existing pages. Feature 2 is full-stack — new Prisma models (Notification, Announcement), backend controllers/routes, notification triggers in existing friendsController, and frontend NotificationsModal + bell icon on HomePage + admin Announcements tab.

**Tech Stack:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, React, Vite

---

## File Structure

### New Files
- `frontend/src/components/GoalProgressBar.tsx` — Reusable progress bar (compact and standard modes)
- `backend/src/controllers/notificationsController.ts` — CRUD for user notifications
- `backend/src/controllers/announcementsController.ts` — Admin announcement management
- `backend/src/routes/notifications.ts` — Notification routes
- `frontend/src/components/NotificationsModal.tsx` — Notification list modal overlay

### Modified Files
- `backend/prisma/schema.prisma` — Add Notification and Announcement models
- `frontend/src/pages/LibraryPage.tsx` — Add compact goal bar below header
- `frontend/src/pages/HistoryPage.tsx` — Replace text goal display with compact bar
- `frontend/src/pages/CurrentlyReadingPage.tsx` — Add compact goal bar below header
- `backend/src/controllers/friendsController.ts` — Add notification triggers in sendFriendRequest and acceptFriendRequest
- `backend/src/routes/admin.ts` — Add announcement routes
- `backend/src/index.ts` — Register notifications router
- `frontend/src/services/api.ts` — Add Notification/Announcement interfaces and api.notifications/api.admin namespaces
- `frontend/src/pages/HomePage.tsx` — Add bell icon with unread badge
- `frontend/src/pages/AdminPage.tsx` — Add Announcements tab

---

### Task 1: GoalProgressBar Component

**Files:**
- Create: `frontend/src/components/GoalProgressBar.tsx`

- [ ] **Step 1: Create GoalProgressBar component**

```tsx
// frontend/src/components/GoalProgressBar.tsx

interface GoalProgressBarProps {
  booksRead: number;
  goalCount: number;
  compact?: boolean;
}

export default function GoalProgressBar({ booksRead, goalCount, compact }: GoalProgressBarProps) {
  const progress = goalCount > 0 ? Math.round((booksRead / goalCount) * 100) : 0;
  const clampedProgress = Math.min(progress, 100);

  if (compact) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
          {booksRead} / {goalCount}
        </span>
        <div style={{
          flex: 1,
          background: 'var(--border)',
          borderRadius: 99,
          height: 4,
          overflow: 'hidden',
          minWidth: 40,
        }}>
          <div style={{
            background: 'var(--primary)',
            height: '100%',
            width: `${clampedProgress}%`,
            borderRadius: 99,
            transition: 'width 0.3s',
          }} />
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
          {progress}%
        </span>
      </div>
    );
  }

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>
        {booksRead}
        <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 400 }}> / {goalCount}</span>
      </div>
      <div style={{
        background: 'var(--border)',
        borderRadius: 99,
        height: 6,
        overflow: 'hidden',
        marginTop: 6,
      }}>
        <div style={{
          background: 'var(--primary)',
          height: '100%',
          width: `${clampedProgress}%`,
          borderRadius: 99,
          transition: 'width 0.3s',
        }} />
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 3 }}>
        {progress}% complete
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors related to GoalProgressBar

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/GoalProgressBar.tsx
git commit -m "feat: add reusable GoalProgressBar component"
```

---

### Task 2: Add GoalProgressBar to LibraryPage

**Files:**
- Modify: `frontend/src/pages/LibraryPage.tsx`

- [ ] **Step 1: Import GoalProgressBar and add state/fetch**

Add at the top of `LibraryPage.tsx`:

```tsx
import GoalProgressBar from '../components/GoalProgressBar';
```

Add to the component's state declarations (after line 34):

```tsx
const [goalData, setGoalData] = useState<{ hasGoal: boolean; booksRead: number; goalCount: number } | null>(null);
```

Inside `loadBooks`, after the existing fetch logic but before the `finally` block, add a goal stats fetch for non-grand-library views:

```tsx
if (!isGrandLibrary && year) {
  try {
    const stats = await api.getStats(parseInt(year));
    setGoalData({ hasGoal: stats.hasGoal, booksRead: stats.booksRead, goalCount: stats.goalCount });
  } catch (err) {
    // Goal data is optional — don't block page load
  }
}
```

- [ ] **Step 2: Render the compact bar in the page**

After the header `<div>` (ends around line 337 `</div>`) and before the `{error && ...}` line (line 339), add:

```tsx
{goalData?.hasGoal && (
  <div style={{
    background: 'var(--surface)',
    borderRadius: 10,
    padding: '10px 14px',
    border: '1px solid var(--border)',
    marginBottom: '1rem',
  }}>
    <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontWeight: 600 }}>
      {year} Reading Goal
    </div>
    <GoalProgressBar booksRead={goalData.booksRead} goalCount={goalData.goalCount} compact />
  </div>
)}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/LibraryPage.tsx
git commit -m "feat: add goal progress bar to library page"
```

---

### Task 3: Add GoalProgressBar to HistoryPage

**Files:**
- Modify: `frontend/src/pages/HistoryPage.tsx`

- [ ] **Step 1: Import GoalProgressBar**

Add at the top of `HistoryPage.tsx`:

```tsx
import GoalProgressBar from '../components/GoalProgressBar';
```

- [ ] **Step 2: Replace text goal display with compact bar**

In HistoryPage.tsx, find the year card section that currently renders the goal text (around line 137-140):

```tsx
{yearData.hasGoal && (
  <div className="text-secondary" style={{ fontSize: '0.9rem' }}>
    Goal: {yearData.booksRead}/{yearData.goalCount} ({yearData.progress}%)
  </div>
)}
```

Replace it with:

```tsx
{yearData.hasGoal && (
  <div style={{ marginTop: 4 }}>
    <GoalProgressBar booksRead={yearData.booksRead} goalCount={yearData.goalCount} compact />
  </div>
)}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/HistoryPage.tsx
git commit -m "feat: add goal progress bar to history page year cards"
```

---

### Task 4: Add GoalProgressBar to CurrentlyReadingPage

**Files:**
- Modify: `frontend/src/pages/CurrentlyReadingPage.tsx`

- [ ] **Step 1: Import GoalProgressBar and api, add state/fetch**

Add import at the top (api is already imported):

```tsx
import GoalProgressBar from '../components/GoalProgressBar';
```

Add state after the existing state declarations (after line 17):

```tsx
const [goalData, setGoalData] = useState<{ hasGoal: boolean; booksRead: number; goalCount: number } | null>(null);
```

Inside the `loadBooks` function, after the books fetch but before the `finally` block, add:

```tsx
try {
  const currentYear = new Date().getFullYear();
  const stats = await api.getStats(currentYear);
  setGoalData({ hasGoal: stats.hasGoal, booksRead: stats.booksRead, goalCount: stats.goalCount });
} catch (err) {
  // Goal data is optional
}
```

- [ ] **Step 2: Render the compact bar below the header**

After the header `<div>` block (ends around line 189) and before the `{error && ...}` line (line 191), add:

```tsx
{goalData?.hasGoal && (
  <div style={{
    background: 'var(--surface)',
    borderRadius: 10,
    padding: '10px 14px',
    border: '1px solid var(--border)',
    marginBottom: '1rem',
  }}>
    <div style={{ fontSize: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, fontWeight: 600 }}>
      {new Date().getFullYear()} Reading Goal
    </div>
    <GoalProgressBar booksRead={goalData.booksRead} goalCount={goalData.goalCount} compact />
  </div>
)}
```

- [ ] **Step 3: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/CurrentlyReadingPage.tsx
git commit -m "feat: add goal progress bar to currently reading page"
```

---

### Task 5: Prisma Schema — Notification and Announcement Models

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Add Notification and Announcement models**

Add to the end of `schema.prisma`:

```prisma
model Notification {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  type          String   // 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'ANNOUNCEMENT'
  title         String
  message       String
  read          Boolean  @default(false)
  link          String?
  relatedUserId String?
  createdAt     DateTime @default(now())

  @@index([userId, read])
  @@index([userId, createdAt])
}

model Announcement {
  id        String   @id @default(cuid())
  title     String
  message   String
  createdBy String
  creator   User     @relation("AnnouncementCreator", fields: [createdBy], references: [id])
  createdAt DateTime @default(now())
}
```

- [ ] **Step 2: Add relations to User model**

In the `User` model, add these two lines after the `receivedFriendRequests` line:

```prisma
  notifications          Notification[]
  announcements          Announcement[] @relation("AnnouncementCreator")
```

- [ ] **Step 3: Generate migration**

Run: `cd backend && DATABASE_URL="postgresql://booktracker:booktracker_password@localhost:5432/booktracker" npx prisma migrate dev --name add-notifications-and-announcements`

If the database isn't running locally, just create the migration file:

Run: `cd backend && npx prisma migrate dev --create-only --name add-notifications-and-announcements`

- [ ] **Step 4: Generate Prisma client**

Run: `cd backend && npx prisma generate`

- [ ] **Step 5: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "feat: add Notification and Announcement models to schema"
```

---

### Task 6: Notifications Controller

**Files:**
- Create: `backend/src/controllers/notificationsController.ts`

- [ ] **Step 1: Create the controller**

```typescript
// backend/src/controllers/notificationsController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getNotifications(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [
        { read: 'asc' },
        { createdAt: 'desc' },
      ],
      take: 50,
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
}

export async function getUnreadCount(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const count = await prisma.notification.count({
      where: { userId, read: false },
    });

    res.json({ count });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Failed to fetch unread count' });
  }
}

export async function markAsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification || notification.userId !== userId) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
}

export async function markAllAsRead(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/notificationsController.ts
git commit -m "feat: add notifications controller"
```

---

### Task 7: Announcements Controller

**Files:**
- Create: `backend/src/controllers/announcementsController.ts`

- [ ] **Step 1: Create the controller**

```typescript
// backend/src/controllers/announcementsController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAnnouncements(req: Request, res: Response) {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
}

export async function createAnnouncement(req: Request, res: Response) {
  try {
    const { title, message } = req.body;
    const createdBy = req.user!.id;

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' });
    }

    const announcement = await prisma.announcement.create({
      data: { title, message, createdBy },
    });

    // Create notifications for all active non-demo users
    const users = await prisma.user.findMany({
      where: { isActive: true, role: { not: 'demo' } },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        type: 'ANNOUNCEMENT',
        title,
        message,
      })),
    });

    res.status(201).json(announcement);
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
}

export async function deleteAnnouncement(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add backend/src/controllers/announcementsController.ts
git commit -m "feat: add announcements controller"
```

---

### Task 8: Notification Routes and Server Registration

**Files:**
- Create: `backend/src/routes/notifications.ts`
- Modify: `backend/src/routes/admin.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Create notifications router**

```typescript
// backend/src/routes/notifications.ts
import { Router } from 'express';
import { authenticate } from '../middleware/authenticate';
import { requireNonDemo } from '../middleware/requireNonDemo';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationsController';

const router = Router();

router.get('/', authenticate, requireNonDemo, getNotifications);
router.get('/unread-count', authenticate, requireNonDemo, getUnreadCount);
router.patch('/:id/read', authenticate, requireNonDemo, markAsRead);
router.patch('/read-all', authenticate, requireNonDemo, markAllAsRead);

export default router;
```

- [ ] **Step 2: Add announcement routes to admin router**

In `backend/src/routes/admin.ts`, add the import:

```typescript
import {
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from '../controllers/announcementsController';
```

Add the routes at the end (before `export default router;`):

```typescript
router.get('/announcements', getAnnouncements);
router.post('/announcements', createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);
```

- [ ] **Step 3: Register notifications router in index.ts**

In `backend/src/index.ts`, add the import:

```typescript
import notificationsRouter from './routes/notifications';
```

Add the route registration (after the `friendsRouter` line):

```typescript
app.use('/api/notifications', notificationsRouter);
```

- [ ] **Step 4: Verify it compiles**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/notifications.ts backend/src/routes/admin.ts backend/src/index.ts
git commit -m "feat: add notification and announcement routes"
```

---

### Task 9: Notification Triggers in friendsController

**Files:**
- Modify: `backend/src/controllers/friendsController.ts`

- [ ] **Step 1: Add notification on friend request sent**

In `sendFriendRequest` (around line 125-138), after the `friendRequest` is created and before `res.status(201).json(friendRequest);`, add:

```typescript
    // Create notification for the receiver
    try {
      const senderDisplayName = friendRequest.sender.displayName || friendRequest.sender.username;
      await prisma.notification.create({
        data: {
          userId: profile.userId,
          type: 'FRIEND_REQUEST',
          title: 'Friend Request',
          message: `${senderDisplayName} sent you a friend request`,
          link: '/social',
          relatedUserId: userId,
        },
      });
    } catch (err) {
      console.error('Failed to create friend request notification:', err);
    }
```

- [ ] **Step 2: Add notification on friend request accepted**

In `acceptFriendRequest` (around line 187-200), after the `$transaction` block and before `res.json({ message: 'Friend request accepted' });`, add:

```typescript
    // Create notification for the original sender
    try {
      const acceptor = await prisma.user.findUnique({
        where: { id: userId },
        select: { displayName: true, username: true },
      });
      const acceptorDisplayName = acceptor?.displayName || acceptor?.username || 'Someone';
      await prisma.notification.create({
        data: {
          userId: request.senderId,
          type: 'FRIEND_ACCEPTED',
          title: 'Friend Request Accepted',
          message: `${acceptorDisplayName} accepted your friend request`,
          link: '/social',
          relatedUserId: userId,
        },
      });
    } catch (err) {
      console.error('Failed to create friend accepted notification:', err);
    }
```

- [ ] **Step 3: Verify it compiles**

Run: `cd backend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add backend/src/controllers/friendsController.ts
git commit -m "feat: add notification triggers for friend requests"
```

---

### Task 10: Frontend API Service — Notifications and Announcements

**Files:**
- Modify: `frontend/src/services/api.ts`

- [ ] **Step 1: Add TypeScript interfaces**

After the `FavoritesResponse` interface (around line 309), add:

```typescript
export interface AppNotification {
  id: string;
  type: 'FRIEND_REQUEST' | 'FRIEND_ACCEPTED' | 'ANNOUNCEMENT';
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  createdAt: string;
}
```

- [ ] **Step 2: Add api.notifications namespace**

After the `friends` namespace (before the closing `};` of the api object, around line 667), add:

```typescript
  notifications: {
    getAll: async (): Promise<AppNotification[]> => {
      const response = await axiosInstance.get('/notifications');
      return response.data;
    },
    getUnreadCount: async (): Promise<{ count: number }> => {
      const response = await axiosInstance.get('/notifications/unread-count');
      return response.data;
    },
    markAsRead: async (id: string): Promise<void> => {
      await axiosInstance.patch(`/notifications/${id}/read`);
    },
    markAllAsRead: async (): Promise<void> => {
      await axiosInstance.patch('/notifications/read-all');
    },
  },
```

- [ ] **Step 3: Add announcement methods to api.admin**

Inside the `api.admin` object (after the `removeFriendship` method, around line 583), add:

```typescript
    getAnnouncements: async (): Promise<Announcement[]> => {
      const response = await axiosInstance.get('/admin/announcements');
      return response.data;
    },
    createAnnouncement: async (data: { title: string; message: string }): Promise<Announcement> => {
      const response = await axiosInstance.post('/admin/announcements', data);
      return response.data;
    },
    deleteAnnouncement: async (id: string): Promise<void> => {
      await axiosInstance.delete(`/admin/announcements/${id}`);
    },
```

- [ ] **Step 4: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add frontend/src/services/api.ts
git commit -m "feat: add notification and announcement API methods"
```

---

### Task 11: NotificationsModal Component

**Files:**
- Create: `frontend/src/components/NotificationsModal.tsx`

- [ ] **Step 1: Create the modal component**

```tsx
// frontend/src/components/NotificationsModal.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, AppNotification } from '../services/api';

interface NotificationsModalProps {
  onClose: () => void;
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function NotificationsModal({ onClose }: NotificationsModalProps) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.notifications.getAll();
        setNotifications(data);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.read) {
      try {
        await api.notifications.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
        );
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }
    if (notification.link) {
      onClose();
      navigate(notification.link);
    }
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'FRIEND_REQUEST': return '👋';
      case 'FRIEND_ACCEPTED': return '🤝';
      case 'ANNOUNCEMENT': return '📢';
      default: return '🔔';
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        zIndex: 1000, padding: '3rem 1rem 1rem',
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ maxWidth: 420, width: '100%', maxHeight: '70vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0 }}>Notifications</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {hasUnread && (
              <button
                onClick={handleMarkAllRead}
                style={{
                  background: 'none', border: 'none', color: 'var(--primary)',
                  fontSize: '0.8rem', cursor: 'pointer', padding: '0.25rem',
                }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', fontSize: '1.2rem',
                cursor: 'pointer', color: 'var(--text-secondary)', padding: '0.25rem',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
              <p style={{ fontSize: '0.9rem' }}>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                style={{
                  display: 'flex', gap: '0.75rem', padding: '0.75rem 0',
                  borderBottom: '1px solid var(--border)',
                  cursor: n.link ? 'pointer' : 'default',
                  opacity: n.read ? 0.6 : 1,
                }}
              >
                {/* Unread dot */}
                <div style={{ width: 8, flexShrink: 0, paddingTop: 6 }}>
                  {!n.read && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: 'var(--primary)',
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 14 }}>{typeIcon(n.type)}</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>
                      {n.title}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '2px 0' }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {timeAgo(n.createdAt)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/NotificationsModal.tsx
git commit -m "feat: add NotificationsModal component"
```

---

### Task 12: Bell Icon on HomePage

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`

- [ ] **Step 1: Import NotificationsModal and add state**

Add at the top of `HomePage.tsx`:

```tsx
import NotificationsModal from '../components/NotificationsModal';
```

Add state after the existing state declarations (after line 14):

```tsx
const [unreadCount, setUnreadCount] = useState(0);
const [showNotifications, setShowNotifications] = useState(false);
```

- [ ] **Step 2: Fetch unread count on mount**

Inside the existing `useEffect` `loadData` function (around line 18-39), after the `setListCounts` call but before the `} catch` block, add:

```tsx
        if (user?.role !== 'demo') {
          try {
            const { count } = await api.notifications.getUnreadCount();
            setUnreadCount(count);
          } catch (err) {
            // Notifications are optional
          }
        }
```

- [ ] **Step 3: Add bell icon to the header**

Replace the header section (lines 51-69) with:

```tsx
      {/* Header */}
      <div style={{ marginBottom: 16, textAlign: 'center', position: 'relative' }}>
        {user?.role !== 'demo' && (
          <button
            onClick={() => setShowNotifications(true)}
            style={{
              position: 'absolute', right: 0, top: 0,
              background: 'none', border: 'none',
              fontSize: '1.3rem', cursor: 'pointer',
              padding: '0.25rem', lineHeight: 1,
            }}
            aria-label="Notifications"
          >
            🔔
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: '#ef4444', color: 'white',
                fontSize: 10, fontWeight: 700,
                minWidth: 16, height: 16,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px',
              }}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}
        <h1 style={{ fontSize: '1.5rem', color: 'var(--text)', margin: 0 }}>
          {user?.role === 'demo' ? 'Welcome! 👋' : `Welcome ${user?.username}!`}
        </h1>
        {user?.role === 'demo' && (
          <span style={{
            display: 'inline-block',
            background: '#854d0e',
            color: '#fef08a',
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 4,
            marginTop: 4,
          }}>
            Demo Mode
          </span>
        )}
      </div>
```

- [ ] **Step 4: Add the modal render**

At the very end of the return JSX, before the closing `</div>`, add:

```tsx
      {showNotifications && (
        <NotificationsModal onClose={() => {
          setShowNotifications(false);
          // Refresh unread count when closing
          if (user?.role !== 'demo') {
            api.notifications.getUnreadCount().then(({ count }) => setUnreadCount(count)).catch(() => {});
          }
        }} />
      )}
```

- [ ] **Step 5: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add frontend/src/pages/HomePage.tsx
git commit -m "feat: add notification bell icon with badge to homepage"
```

---

### Task 13: Admin Announcements Tab

**Files:**
- Modify: `frontend/src/pages/AdminPage.tsx`

- [ ] **Step 1: Update Tab type and add state**

Change the Tab type (line 5):

```tsx
type Tab = 'stats' | 'users' | 'codes' | 'friends' | 'announcements';
```

Add announcement state after the friendship state declarations (after line 26):

```tsx
  // Announcements state
  const [announcements, setAnnouncements] = useState<Array<{ id: string; title: string; message: string; createdAt: string }>>([]);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementMsg, setAnnouncementMsg] = useState('');
```

- [ ] **Step 2: Add import for Announcement type**

Update the import on line 3:

```tsx
import { api, PlatformStats, AdminUser, AdminInviteCode, Announcement } from '../services/api';
```

Update the announcements state to use the proper type:

```tsx
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
```

- [ ] **Step 3: Add data loading for announcements tab**

Inside the `loadData` function, add a case for the announcements tab (after the `friends` case, before the closing `}` of the try block):

```tsx
      } else if (tab === 'announcements') {
        setAnnouncements(await api.admin.getAnnouncements());
```

- [ ] **Step 4: Add the Announcements tab button**

In the tabs section (around line 153-158), add the Announcements tab button:

```tsx
        <button style={tabStyle('announcements')} onClick={() => setActiveTab('announcements')}>Announce</button>
```

- [ ] **Step 5: Add the Announcements tab content**

After the Invite Codes tab content (before the `</>` closing the conditional render, around line 545), add:

```tsx
          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div>
              {/* Create Announcement */}
              <div className="card" style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                  Create Announcement
                </h3>
                <input
                  className="input"
                  type="text"
                  placeholder="Title"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  style={{ marginBottom: '0.5rem' }}
                />
                <textarea
                  className="input"
                  placeholder="Message"
                  value={announcementMessage}
                  onChange={(e) => setAnnouncementMessage(e.target.value)}
                  rows={3}
                  style={{ marginBottom: '0.5rem', resize: 'vertical' }}
                />
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                  disabled={!announcementTitle.trim() || !announcementMessage.trim()}
                  onClick={async () => {
                    try {
                      await api.admin.createAnnouncement({
                        title: announcementTitle.trim(),
                        message: announcementMessage.trim(),
                      });
                      setAnnouncementTitle('');
                      setAnnouncementMessage('');
                      setAnnouncementMsg('Announcement sent to all users!');
                      setAnnouncements(await api.admin.getAnnouncements());
                      setTimeout(() => setAnnouncementMsg(''), 3000);
                    } catch {
                      setAnnouncementMsg('Failed to create announcement');
                    }
                  }}
                >
                  Send to All Users
                </button>
                {announcementMsg && (
                  <span style={{
                    display: 'block', marginTop: '0.5rem', fontSize: '0.85rem',
                    color: announcementMsg.includes('sent') ? '#6ee7b7' : '#f87171',
                  }}>
                    {announcementMsg}
                  </span>
                )}
              </div>

              {/* Past Announcements */}
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', fontWeight: '600' }}>
                Past Announcements
              </h3>
              {announcements.length === 0 ? (
                <div className="card" style={{ textAlign: 'center' }}>
                  <p className="text-secondary">No announcements yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {announcements.map((a) => (
                    <div key={a.id} className="card">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>
                            {a.title}
                          </div>
                          <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                            {a.message}
                          </p>
                          <span className="text-secondary" style={{ fontSize: '0.75rem' }}>
                            {formatDate(a.createdAt)}
                          </span>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await api.admin.deleteAnnouncement(a.id);
                              setAnnouncements((prev) => prev.filter((ann) => ann.id !== a.id));
                            } catch {
                              setError('Failed to delete announcement');
                            }
                          }}
                          style={{
                            background: 'none', border: 'none',
                            fontSize: '0.75rem', color: '#f87171',
                            cursor: 'pointer', padding: '0.2rem 0.4rem',
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
```

- [ ] **Step 6: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/AdminPage.tsx
git commit -m "feat: add announcements tab to admin dashboard"
```

---

## Self-Review

**Spec coverage check:**
- ✅ GoalProgressBar component (Task 1)
- ✅ Library page progress bar (Task 2)
- ✅ History page progress bar (Task 3)
- ✅ Currently Reading page progress bar (Task 4)
- ✅ Notification model (Task 5)
- ✅ Announcement model (Task 5)
- ✅ Notifications controller (Task 6)
- ✅ Announcements controller (Task 7)
- ✅ Notification routes (Task 8)
- ✅ Announcement routes in admin (Task 8)
- ✅ Server registration (Task 8)
- ✅ Friend request notification trigger (Task 9)
- ✅ Friend accepted notification trigger (Task 9)
- ✅ Announcement bulk notification creation (Task 7)
- ✅ Frontend API interfaces and methods (Task 10)
- ✅ NotificationsModal component (Task 11)
- ✅ Bell icon with badge on HomePage (Task 12)
- ✅ Admin Announcements tab (Task 13)
- ✅ Demo user restrictions (routes use requireNonDemo, bell hidden for demo)
- ✅ No real-time — fetch on mount only

**Placeholder scan:** No TBD, TODO, or vague placeholders found.

**Type consistency:**
- `AppNotification` used consistently (named to avoid conflict with browser's `Notification` API)
- `Announcement` interface matches backend response shape
- `GoalProgressBar` props (`booksRead`, `goalCount`, `compact`) used consistently across all three page integrations
- `api.notifications.getUnreadCount()` returns `{ count: number }` — matches usage in HomePage
