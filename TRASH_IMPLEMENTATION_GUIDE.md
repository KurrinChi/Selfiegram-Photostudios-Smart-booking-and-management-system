# 🗑️ Trash/Archive Implementation for Notifications Table

## 📋 Overview

This guide implements **Move to Trash**, **Restore**, and **Delete Forever** functionality for messages in the **Sent** and **Starred** tabs (which come from the `notifications` table), making them consistent with the **Inbox** tab (from `messages` table).

---

## ⚠️ Problem Statement

### Current State
- **messages** table → Has `archived` column ✅
  - Inbox tab can move to trash, restore, delete forever
  
- **notifications** table → **NO `archived` column** ❌
  - Sent/Starred tabs cannot move to trash
  - Delete button doesn't work for sent messages

### Why This Happens
- Sent messages (ID format: `notif-123`) are stored in `notifications` table
- Inbox messages (ID format: `123`) are stored in `messages` table
- The `archived` column only exists in `messages` table

---

## 🎯 Solution: Add `archived` Column to Notifications

### Step 1: Database Migration

**Run this SQL to add the `archived` column:**

```sql
-- File: mysql/add_archived_to_notifications.sql

ALTER TABLE `notifications` 
ADD COLUMN `archived` TINYINT(1) NOT NULL DEFAULT 0 AFTER `starred`;

-- Index for performance
CREATE INDEX idx_archived ON `notifications` (`archived`);

-- Add comment for documentation
ALTER TABLE `notifications` 
MODIFY COLUMN `archived` TINYINT(1) NOT NULL DEFAULT 0 
COMMENT '0 = active, 1 = archived/trashed';
```

**To apply:**
```bash
# Option 1: Via MySQL CLI
mysql -u root -p selfiegram < mysql/add_archived_to_notifications.sql

# Option 2: Via phpMyAdmin
# Copy and paste the SQL content into the SQL tab
```

---

### Step 2: Backend Controller Updates

**File: `backend/app/Http/Controllers/NotificationController.php`**

Added three new methods:

#### 1. `updateArchived()` - Move to Trash / Restore
```php
public function updateArchived($id, Request $request)
{
    $request->validate([
        'archived' => 'required|integer|in:0,1'
    ]);

    $notification = Notification::find($id);
    if (!$notification) {
        return response()->json(['error' => 'Notification not found'], 404);
    }

    $notification->archived = $request->input('archived');
    $notification->save();

    return response()->json([
        'success' => true,
        'notificationID' => $notification->notificationID,
        'archived' => $notification->archived
    ]);
}
```

#### 2. `emptyTrash()` - Permanently Delete All Archived
```php
public function emptyTrash(Request $request)
{
    try {
        $deletedCount = Notification::where('archived', 1)->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Trash emptied successfully',
            'deleted_count' => $deletedCount
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'error' => 'Failed to empty trash',
            'message' => $e->getMessage()
        ], 500);
    }
}
```

---

### Step 3: API Routes

**File: `backend/routes/api.php`**

Added new routes:

```php
Route::post('/notifications/{id}/archived', [NotificationController::class, 'updateArchived']);
Route::delete('/notifications/trash/empty', [NotificationController::class, 'emptyTrash']);
```

**Complete notification routes section:**
```php
//Client Notification
Route::get('/notifications/{userID}', [NotificationController::class, 'getUserNotifications']);
Route::get('/booking-details', [NotificationController::class, 'getBookingDetails']);
Route::get('/reschedule-details', [NotificationController::class, 'getRescheduleDetails']);
Route::post('/notifications/{id}/mark-as-read', [NotificationController::class, 'markAsRead']);
Route::post('/notifications/{id}/starred', [NotificationController::class, 'updateStarred']);
Route::post('/notifications/{id}/archived', [NotificationController::class, 'updateArchived']); // NEW
Route::delete('/notifications/trash/empty', [NotificationController::class, 'emptyTrash']); // NEW
Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
```

---

### Step 4: Frontend Updates

**Files:**
- `src/components/AdminMessageContent.tsx`
- `src/components/StaffMessageContent.tsx`

#### Updated `updateMessageFlags()` Function

Now handles `archived` flag for notifications:

```typescript
const updateMessageFlags = useCallback(
  async (
    id: string,
    flags: Partial<{ starred: boolean; archived: boolean }>
  ) => {
    if (!API_URL || !token) return;
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    };
    try {
      const isNotification = id.startsWith("notif-");
      
      if (isNotification) {
        const notificationID = id.replace("notif-", "");
        
        // ✅ NOW SUPPORTS ARCHIVED
        if (flags.starred !== undefined) {
          await fetch(`${API_URL}/api/notifications/${notificationID}/starred`, {
            method: "POST",
            headers,
            body: JSON.stringify({ starred: flags.starred ? 1 : 0 }),
          });
        }
        if (flags.archived !== undefined) {
          await fetch(`${API_URL}/api/notifications/${notificationID}/archived`, {
            method: "POST",
            headers,
            body: JSON.stringify({ archived: flags.archived ? 1 : 0 }),
          });
        }
      } else {
        // Messages table logic (unchanged)
        if (flags.starred !== undefined) {
          await fetch(`${API_URL}/api/messages/${id}/starred`, {
            method: "POST",
            headers,
            body: JSON.stringify({ starred: flags.starred ? 1 : 0 }),
          });
        }
        if (flags.archived !== undefined) {
          await fetch(`${API_URL}/api/messages/${id}/archived`, {
            method: "POST",
            headers,
            body: JSON.stringify({ archived: flags.archived ? 1 : 0 }),
          });
        }
      }
    } catch (err) {
      console.warn("Failed updating message flags", err);
    }
  },
  [API_URL, token]
);
```

#### Updated `permanentlyDelete()` Function

Now handles both messages and notifications:

```typescript
const permanentlyDelete = useCallback(
  (id?: string) => {
    const bulk = selectedMailbox === "trash";
    const archivedCount = emails.filter((e) => e.archived).length;
    setConfirmDialog({
      open: true,
      title: bulk ? "Empty Trash" : "Delete Message",
      message: bulk
        ? `This will permanently delete ${archivedCount} archived message${
            archivedCount !== 1 ? "s" : ""
          }. This cannot be undone.`
        : "This will permanently delete the selected message. This cannot be undone.",
      confirmLabel: bulk ? "Empty Trash" : "Delete",
      variant: "danger",
      onConfirm: () => {
        if (API_URL && token) {
          if (bulk) {
            // ✅ EMPTY BOTH TABLES
            fetch(`${API_URL}/api/messages/trash/empty`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => {});
            
            fetch(`${API_URL}/api/notifications/trash/empty`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            }).catch(() => {});
          } else if (id) {
            // ✅ DETECT AND DELETE FROM CORRECT TABLE
            const isNotification = id.startsWith("notif-");
            
            if (isNotification) {
              const notificationID = id.replace("notif-", "");
              fetch(`${API_URL}/api/notifications/${notificationID}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => {});
            } else {
              fetch(`${API_URL}/api/messages/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => {});
            }
          }
        }
        setEmails((prev) =>
          bulk
            ? prev.filter((e) => !e.archived)
            : prev.filter((e) => e.id !== id)
        );
        setSelectedEmailId(null);
        pushFlash("success", bulk ? "Trash emptied." : "Message deleted.");
      },
    });
  },
  [pushFlash, API_URL, token, selectedMailbox, emails]
);
```

---

## 🎬 How It Works

### Move to Trash Flow

```
User clicks trash button on Sent message (ID: "notif-456")
  ↓
deleteMessage("notif-456") called
  ↓
updateMessageFlags("notif-456", { archived: true })
  ↓
Detects "notif-" prefix → Extract notificationID: 456
  ↓
POST /api/notifications/456/archived
  ↓
Database: UPDATE notifications SET archived = 1 WHERE notificationID = 456
  ↓
UI: Message moves to Trash tab ✅
```

### Restore Flow

```
User clicks restore on trashed notification
  ↓
restoreMessage("notif-456")
  ↓
updateMessageFlags("notif-456", { archived: false })
  ↓
POST /api/notifications/456/archived { archived: 0 }
  ↓
Database: UPDATE notifications SET archived = 0 WHERE notificationID = 456
  ↓
UI: Message returns to original mailbox ✅
```

### Delete Forever Flow

```
User clicks "Delete Forever" on notification
  ↓
permanentlyDelete("notif-456")
  ↓
Detects "notif-" prefix → Extract notificationID: 456
  ↓
DELETE /api/notifications/456
  ↓
Database: DELETE FROM notifications WHERE notificationID = 456
  ↓
UI: Message removed permanently ✅
```

### Empty Trash Flow

```
User clicks "Empty Trash" in Trash tab
  ↓
permanentlyDelete() with bulk = true
  ↓
DELETE /api/messages/trash/empty
DELETE /api/notifications/trash/empty
  ↓
Database: 
  - DELETE FROM messages WHERE archived = 1
  - DELETE FROM notifications WHERE archived = 1
  ↓
UI: All trashed items removed ✅
```

---

## 🧪 Testing Checklist

### 1. Sent Tab (Notifications)
- [ ] Click trash on sent message → Moves to Trash tab
- [ ] Message disappears from Sent tab
- [ ] Message appears in Trash tab with correct content

### 2. Starred Tab (Mixed Sources)
- [ ] Star a sent message (notification) → Appears in Starred
- [ ] Move starred notification to trash → Moves to Trash tab
- [ ] Starred inbox message (message table) → Still works

### 3. Trash Tab Operations
- [ ] Restore notification → Returns to original location
- [ ] Delete Forever on notification → Permanently removed
- [ ] Empty Trash → Removes both messages and notifications

### 4. Database Verification
```sql
-- Check archived notifications
SELECT notificationID, title, archived FROM notifications WHERE archived = 1;

-- Check archived messages
SELECT messageID, senderName, archived FROM messages WHERE archived = 1;

-- Verify index exists
SHOW INDEX FROM notifications WHERE Key_name = 'idx_archived';
```

### 5. API Endpoint Testing

**Test Archive Notification:**
```bash
curl -X POST http://localhost:8000/api/notifications/1/archived \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"archived": 1}'
```

**Test Restore Notification:**
```bash
curl -X POST http://localhost:8000/api/notifications/1/archived \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"archived": 0}'
```

**Test Empty Trash:**
```bash
curl -X DELETE http://localhost:8000/api/notifications/trash/empty \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Database Schema Changes

### Before
```sql
CREATE TABLE `notifications` (
  `notificationID` int NOT NULL,
  `userID` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `label` enum(...) DEFAULT NULL,
  `message` text NOT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `starred` tinyint(1) DEFAULT '0',  -- ❌ No archived column
  `bookingID` int NOT NULL,
  `transID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### After
```sql
CREATE TABLE `notifications` (
  `notificationID` int NOT NULL,
  `userID` int DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `label` enum(...) DEFAULT NULL,
  `message` text NOT NULL,
  `time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `starred` tinyint(1) DEFAULT '0',
  `archived` tinyint(1) NOT NULL DEFAULT '0',  -- ✅ NEW COLUMN
  `bookingID` int NOT NULL,
  `transID` int NOT NULL,
  KEY `idx_archived` (`archived`)  -- ✅ NEW INDEX
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

---

## 🔄 Rollback Plan

If you need to revert the changes:

```sql
-- Remove index
DROP INDEX idx_archived ON notifications;

-- Remove column
ALTER TABLE notifications DROP COLUMN archived;
```

Then revert the code changes in:
- `NotificationController.php`
- `routes/api.php`
- `AdminMessageContent.tsx`
- `StaffMessageContent.tsx`

---

## ✅ Summary

| Feature | Before | After |
|---------|--------|-------|
| **Inbox Tab** (messages) | Move to trash ✅ | Move to trash ✅ |
| **Sent Tab** (notifications) | No trash ❌ | Move to trash ✅ |
| **Starred Tab** (mixed) | Partial ⚠️ | Full support ✅ |
| **Restore** | Messages only | Both tables ✅ |
| **Delete Forever** | Messages only | Both tables ✅ |
| **Empty Trash** | Messages only | Both tables ✅ |

---

## 🎯 Next Steps

1. **Run the SQL migration** to add `archived` column
2. **Test all trash operations** in both Admin and Staff interfaces
3. **Verify database changes** using the SQL queries above
4. **Monitor for any errors** in browser console and Laravel logs
5. **Update any related documentation** for your team

---

**Implementation Status:** ✅ COMPLETE

All code changes have been applied. Just need to run the SQL migration!
