// Simplified Admin Inbox (inbox only) now fetching from Laravel messages table
import { useCallback, useEffect, useMemo, useState, useRef, type JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 as TrashIcon, Search as SearchIcon, Star as StarIcon, Reply as ReplyIcon, X as XIcon, RefreshCcw as RefreshIcon, AlertTriangle as AlertIcon, Inbox as InboxIcon, Send as SendIcon, Plus as PlusIcon } from 'lucide-react';
// Toast notifications removed per request; using inline flash messages instead.
import pusher from '../utils/pusher';
import { fetchWithAuth } from '../utils/fetchWithAuth';

// Toggle verbose debug logs for the admin messages panel
const DEBUG_MESSAGES = true; // set to false to silence debug logs

export type Email = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  time: string; // ISO timestamp
  mailbox: string; // inbox | sent | trash (derived)
  starred: boolean; // tinyint -> boolean
  archived: boolean; // archived flag -> trash
  avatar?: string | null;
  senderID?: number;
  messageStatus?: number; // 0 pending, 1 accommodated
};

/* ---------------- Utilities ---------------- */
const timeShort = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (days < 7) return d.toLocaleDateString([], { weekday: 'short' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};
const extractAddress = (raw: string) => {
  const m = raw.match(/<([^>]+)>/);
  return m ? m[1] : raw.trim();
};

/* -------------- Backend Types / Mapping -------------- */
interface RawMessage {
  messageID: number;
  senderID: number;
  senderName: string;
  senderEmail: string;
  message: string;
  inquiryOptions: string; // pricing | promotions | account | payment | other
  messageStatus: number; // 0 unread / 1 processed(read)
  createdAt?: string; // may exist (nullable)
  profilePicture?: string | null; // appended in controller transform
  starred?: number; // 0/1 from DB
  archived?: number; // 0/1 from DB
}

// Canonical labels for inquiryOptions -> subject/title mapping
const INQUIRY_LABELS: Record<string,string> = {
  other: 'General',
  pricing: 'Pricing & Packages',
  promotions: 'Promotions / Discounts',
  account: 'Account / Technical Support',
  payment: 'Payment & Billing'
};
const inquiryToSubject = (raw: RawMessage) => INQUIRY_LABELS[raw.inquiryOptions] || 'General';

function buildAvatarURL(raw: string | null | undefined, apiBase: string): string | null {
  if (!raw) return null;
  // If already absolute (http/https/data) return as-is
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith('data:')) return raw;
  // Normalize common storage prefixes
  const cleaned = raw.replace(/^storage\//, '').replace(/^\/+/, '');
  // Attempt to detect if backend serves /storage publicly (Laravel default with storage:link)
  return apiBase ? `${apiBase}/storage/${cleaned}` : `/storage/${cleaned}`;
}

function mapRawToEmail(r: RawMessage, apiBase: string): Email {
  const archived = (r.archived ?? 0) === 1;
  const starred = (r.starred ?? 0) === 1;
  let mailbox: string;
  if (archived) mailbox = 'trash';
  else if (r.messageStatus === 1) mailbox = 'sent';
  else mailbox = 'inbox';
  return {
    id: String(r.messageID),
    from: `${r.senderName || 'User'} <${r.senderEmail || 'unknown@example.com'}>` ,
    to: ['support@selfiegram.local'],
    subject: inquiryToSubject(r),
    body: r.message + `\n#${r.messageID}`,
    time: r.createdAt || new Date().toISOString(),
    mailbox,
    starred,
    archived,
    avatar: buildAvatarURL(r.profilePicture, apiBase),
    senderID: r.senderID,
    messageStatus: r.messageStatus,
  };
}

// ---------------------------------------------------------------------------
// Reply Template Helper
// This function builds the pre-filled body that appears when an admin clicks
// "Reply". Modify this if you want to change the formatting, add a greeting,
// or remove the original quoted message. Keep the trailing original content
// clearly separated for user context.
// ---------------------------------------------------------------------------
function buildReplyBody(email: Email, adminName: string) {
  const timestamp = new Date(email.time).toLocaleString();
  const header = `On ${timestamp}, ${email.from} wrote:`;
  // Normalize any accidental double newlines before #ID to a single newline
  const original = email.body.replace(/\n\n(#\d+)/g, '\n$1');
  // Requested final format:
  // ---
  // If you have more questions, kindly send us a new contact form and we hope that you are satisfied with our service.
  //
  // Regards,
  // {Admin Name}
  // SelfieGram Support Staff
  // ---
  // On TIMESTAMP, Name <email> wrote:
  // original message
  return [
    '', // leading blank line for typing space if desired
    '---',
    'If you have more questions, kindly send us a new contact form and we hope that you are satisfied with our service.',
    '',
    'Regards,',
    adminName,
    'SelfieGram Support Staff',
    '---',
    `${header}`,
    original
  ].join('\n');
}

/* -------------- Component -------------- */
export default function AdminMessageContent(): JSX.Element {
  const [adminName, setAdminName] = useState<string>('Support Staff');
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const pushFlash = useCallback((type: 'success' | 'error', message: string, ttl = 3200) => {
    setFlash({ type, message });
    if (ttl > 0) {
      window.setTimeout(() => setFlash(f => (f?.message === message ? null : f)), ttl);
    }
  }, []);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        // Try common name fields; fallback to username or 'Admin'
        const name = [u.fname, u.lname].filter(Boolean).join(' ').trim() || u.username || 'Admin';
        setAdminName(name);
      }
    } catch {}
  }, []);
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null); // stays null on load until user clicks
  const [searchQuery, setSearchQuery] = useState('');
  const [q, setQ] = useState(''); // immediate input for debounce
  const [selectedMailbox, setSelectedMailbox] = useState<'inbox' | 'sent' | 'trash' | 'starred'>('inbox');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const initialFetchDoneRef = useRef(false); // guard against StrictMode double invocation
  const dataSnapshotRef = useRef<string | null>(null); // cache of last dataset signature

  const API_URL = (import.meta as any).env?.VITE_API_URL || '';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchMessages = useCallback(async () => {
    // If token/API URL not ready yet (e.g., first render before login state re-hydrates), just skip silently.
    if (!API_URL || !token) {
      if (DEBUG_MESSAGES) console.debug('[Messages] Skip fetch: missing', { API_URL: !!API_URL, token: !!token });
      return;
    }
    try {
      const start = performance.now();
      setLoading(true);
      setError(null);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      if (DEBUG_MESSAGES) console.debug('[Messages] Fetch start', { url: `${API_URL}/api/messages?per_page=100` });
      const res = await fetchWithAuth(`${API_URL}/api/messages?per_page=100`, {
        signal: controller.signal,
      });
      if (DEBUG_MESSAGES) console.debug('[Messages] Fetch response', { status: res.status, ok: res.ok });
      if (!res.ok) {
        let bodyText = '';
        try { bodyText = await res.text(); } catch {}
        console.warn('Messages fetch failed', { status: res.status, statusText: res.statusText, body: bodyText });
        let parsed: any = null;
        try { parsed = bodyText ? JSON.parse(bodyText) : null; } catch {}
        const msg = parsed?.message || parsed?.error || bodyText || `Request failed (${res.status})`;
        throw new Error(msg);
      }
      const json = await res.json();
      const data: RawMessage[] = Array.isArray(json) ? json : (json.data || []);
      if (DEBUG_MESSAGES) console.debug('[Messages] Raw data length', data.length, { sample: data[0] });
      const mapped = data.map(r => mapRawToEmail(r, API_URL)).sort((a,b)=> +new Date(b.time) - +new Date(a.time));
      const snapshotKey = mapped.length + ':' + mapped.slice(0,5).map(m=>m.id).join(',');
      if (dataSnapshotRef.current === snapshotKey) {
        if (DEBUG_MESSAGES) console.debug('[Messages] No data change; skip state update');
      } else {
        dataSnapshotRef.current = snapshotKey;
        setEmails(mapped);
        setLastFetched(new Date());
      }
      setError(null); // ensure previous error cleared if this succeeds
      if (DEBUG_MESSAGES) console.debug('[Messages] Mapped emails length', mapped.length, { first: mapped[0] });
      if (DEBUG_MESSAGES) console.debug('[Messages] Fetch duration ms', Math.round(performance.now() - start));
    } catch (e: any) {
      if (e?.name === 'AbortError') return; // ignore abort
      if (DEBUG_MESSAGES) console.debug('[Messages] Fetch error', e);
      setError(e?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  // Initial load with StrictMode guard
  useEffect(() => {
    if (!token) return;
    if (initialFetchDoneRef.current) {
      if (DEBUG_MESSAGES) console.debug('[Messages] Skip duplicate initial fetch');
      return;
    }
    initialFetchDoneRef.current = true;
    fetchMessages();
  }, [fetchMessages, token]);

  // Real-time subscription for new messages via private admin channel (auth required)
  useEffect(() => {
    const channelName = 'private-admin.messages';
    const channel = pusher.subscribe(channelName);
    const handler = (data: any) => {
      if (!data || !data.messageID) return;
      if (DEBUG_MESSAGES) console.debug('[Messages] Pusher event received', data);
      const raw: RawMessage = {
        messageID: data.messageID,
        senderID: 0,
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        message: data.message,
        inquiryOptions: data.inquiryOptions,
        messageStatus: data.messageStatus,
        createdAt: data.createdAt,
        profilePicture: data.profilePicture || null,
      };
      setEmails(prev => {
        if (prev.some(e => e.id === String(raw.messageID))) return prev;
        const mapped = mapRawToEmail(raw, API_URL);
        if (DEBUG_MESSAGES) console.debug('[Messages] Adding new message from Pusher', mapped);
        return [mapped, ...prev].sort((a,b)=> +new Date(b.time) - +new Date(a.time));
      });
    };
    channel.bind('admin.message.created', handler);
    return () => {
      if (DEBUG_MESSAGES) console.debug('[Messages] Unsubscribe pusher channel');
      channel.unbind('admin.message.created', handler);
      pusher.unsubscribe(channelName);
    };
  }, [API_URL]);

  // compose state
  const [composeOpen, setComposeOpen] = useState(false); // reply or broadcast
  const [composeMinimized, setComposeMinimized] = useState(false);
  const [composeDraft, setComposeDraft] = useState({ to: '', subject: '', body: '' });
  const [broadcastMode, setBroadcastMode] = useState(false); // true when creating a system broadcast / direct manual message
  const [customerList, setCustomerList] = useState<{ userID:number; name:string; email:string }[]>([]);
  const [recipient, setRecipient] = useState<'ALL' | number>('ALL');
  const [replyTargetUserID, setReplyTargetUserID] = useState<number | null>(null);
  const [replyTargetMessageID, setReplyTargetMessageID] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  /* Debounce search */
  useEffect(() => {
    const id = window.setTimeout(() => setSearchQuery(q.trim()), 250);
    return () => clearTimeout(id);
  }, [q]);

  /* Ensure selected email remains valid */
  useEffect(() => {
    // If the currently selected email was removed, clear selection (do not auto select a new one)
    if (selectedEmailId && !emails.some(e => e.id === selectedEmailId)) {
      setSelectedEmailId(null);
    }
  }, [emails, selectedEmailId]);

  // Removed mark-as-read logic per new requirement

  const selectedEmail = useMemo(() => emails.find(e => e.id === selectedEmailId) ?? null, [emails, selectedEmailId]);

  const filteredEmails = useMemo(() => {
    const ql = searchQuery.toLowerCase();
    return emails
      .filter(e => {
        if (selectedMailbox === 'trash') return e.archived;
        if (selectedMailbox === 'starred') return e.starred && !e.archived;
        if (selectedMailbox === 'sent') return e.mailbox === 'sent' && !e.archived;
        if (selectedMailbox === 'inbox') return e.mailbox === 'inbox' && !e.archived;
        return false;
      })
      .filter(e => !ql || e.subject.toLowerCase().includes(ql) || e.body.toLowerCase().includes(ql) || e.from.toLowerCase().includes(ql))
      .sort((a, b) => +new Date(b.time) - +new Date(a.time));
  }, [emails, searchQuery, selectedMailbox]);

  const inboxPendingCount = useMemo(() => emails.filter(e => e.mailbox==='inbox' && !e.archived && (e.messageStatus ?? 0) === 0).length, [emails]);
  const sentCount = useMemo(() => emails.filter(e => e.mailbox==='sent' && !e.archived).length, [emails]);
  const trashCount = useMemo(() => emails.filter(e => e.archived).length, [emails]);
  const starredCount = useMemo(() => emails.filter(e => e.starred && !e.archived).length, [emails]);

  useEffect(() => {
    const inView = (e: Email) => {
      switch (selectedMailbox) {
        case 'starred': return e.starred && !e.archived;
        case 'trash': return e.archived;
        case 'sent': return e.mailbox === 'sent' && !e.archived;
        case 'inbox': return e.mailbox === 'inbox' && !e.archived;
        default: return false;
      }
    };
    const current = emails.find(e => e.id === selectedEmailId && inView(e));
    if (!current) {
      const first = emails.find(inView) || null;
      setSelectedEmailId(first ? first.id : null);
    }
  }, [selectedMailbox, emails, selectedEmailId]);

  /* Compose helpers */
  const toggleCompose = useCallback((opts?: { to?: string; subject?: string; body?: string }) => {
    if (!composeOpen) {
      setComposeDraft({ to: opts?.to ?? '', subject: opts?.subject ?? '', body: opts?.body ?? '' });
      setComposeMinimized(false);
      setComposeOpen(true);
      return;
    }
    if (composeOpen && !composeMinimized && !opts) { // close
      setComposeOpen(false);
      return;
    }
    if (composeOpen && composeMinimized) { // restore
      setComposeMinimized(false);
      if (opts) setComposeDraft(s => ({ ...s, ...opts }));
      return;
    }
    if (opts) { // already open, fill
      setComposeDraft(s => ({ ...s, ...opts }));
      setComposeMinimized(false);
    }
  }, [composeOpen, composeMinimized]);

  const closeCompose = useCallback(() => {
    setComposeDraft({ to: '', subject: '', body: '' });
    setComposeOpen(false);
    setComposeMinimized(false);
    setBroadcastMode(false);
    setRecipient('ALL');
  }, []);

  // Fetch customers only when composing a broadcast/direct (manual compose)
  useEffect(() => {
    if (!broadcastMode) return;
    if (!API_URL || !token) return;
    fetch(`${API_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Accept':'application/json' }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const customers = data
            .filter((u:any) => (u.userType || u.usertype) === 'Customer')
            .map((u:any) => ({
              userID: u.userID,
              name: u.name || [u.fname, u.lname].filter(Boolean).join(' ').trim() || u.username || `User #${u.userID}`,
              email: u.email
            }));
          setCustomerList(customers);
        }
      }).catch(err => console.error('Fetch customers failed', err));
  }, [broadcastMode, API_URL, token]);

  const sendCompose = useCallback(() => {
    // Helper to trigger a browser (push-like) notification via the Notification API
    const fireBrowserNotification = (title: string, body: string) => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      try {
        if (Notification.permission === 'granted') {
          new Notification(title, { body });
        } else if (Notification.permission === 'default') {
          Notification.requestPermission().then(p => {
            if (p === 'granted') {
              new Notification(title, { body });
            }
          }).catch(()=>{});
        }
      } catch { /* ignore */ }
    };
    // If broadcast mode: send system notification (ALL) or direct manual message.
    if (broadcastMode) {
      if (!composeDraft.subject.trim()) { pushFlash('error','Subject is required.'); return; }
      if (!composeDraft.body.trim()) { pushFlash('error','Message body is required.'); return; }
      if (!API_URL || !token) { pushFlash('error','Missing API URL or authentication.'); return; }
      setSending(true);
      const isAll = recipient === 'ALL';
      const endpoint = isAll ? `${API_URL}/api/admin/notifications/broadcast` : `${API_URL}/api/admin/support-replies`;
      const payload = isAll
        ? { title: composeDraft.subject.trim(), message: composeDraft.body }
        : { userID: recipient, subject: composeDraft.subject.trim(), body: composeDraft.body };
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type':'application/json', 'Accept':'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      }).then(async res => {
        if (!res.ok) { const txt = await res.text(); throw new Error(txt || `Failed (${res.status})`); }
        pushFlash('success', isAll ? 'Broadcast sent to all customers.' : 'Message sent to selected customer.');
        fireBrowserNotification(
          isAll ? 'Broadcast Sent' : 'Message Sent',
          isAll ? 'Your system broadcast was delivered to all customers.' : 'Direct support message delivered to selected customer.'
        );
        // record sent copy locally (purely client-side for UI consistency)
        setEmails(prev => [{
          id: `sent-${Date.now()}-${Math.random()}`,
          from: `${adminName} <support@selfiegram.local>`,
          to: [isAll ? 'ALL USERS' : 'user'],
          subject: composeDraft.subject.trim(),
          body: composeDraft.body,
          time: new Date().toISOString(),
          mailbox: 'sent',
          starred: false,
          archived: false,
          avatar: null,
          messageStatus: 1,
        }, ...prev]);
        closeCompose();
      }).catch(err => {
        console.error('Broadcast error', err);
        pushFlash('error', 'Failed to send message: ' + (err.message || 'Unknown error'));
      }).finally(()=> setSending(false));
      return;
    }
    if (!replyTargetUserID || !replyTargetMessageID) {
      pushFlash('error', 'No target message. Select a message then click Reply.');
      return;
    }
    const cw = composeDraft;
    if (!cw.subject.trim()) {
      pushFlash('error', 'Subject is required.');
      return;
    }
    if (!cw.body.trim()) {
      pushFlash('error', 'Message body is required.');
      return;
    }
    if (!API_URL || !token) {
      pushFlash('error', 'Missing API URL or authentication.');
      return;
    }
    setSending(true);
    fetch(`${API_URL}/api/admin/support-replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        userID: replyTargetUserID,
        subject: cw.subject.trim(),
        body: cw.body,
      })
    }).then(async res => {
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Failed (${res.status})`);
      }
      // Mark original message as accommodated (messageStatus=1) and move to 'sent'
      if (replyTargetMessageID) {
        fetch(`${API_URL}/api/messages/${replyTargetMessageID}/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ messageStatus: 1 })
        }).catch(()=>{});
        setEmails(prev => prev.map(e => e.id === replyTargetMessageID ? { ...e, messageStatus: 1, mailbox: 'sent' } : e));
        if (selectedEmailId === replyTargetMessageID) setSelectedEmailId(null);
      }
  pushFlash('success', 'Reply has been successfully sent.');
    fireBrowserNotification('Reply Sent', 'Your support reply was delivered successfully.');
      // Clear draft and selection to avoid showing stale opened message
      setComposeDraft({ to: '', subject: '', body: '' });
      setReplyTargetUserID(null);
      setReplyTargetMessageID(null);
      setSelectedEmailId(null);
      closeCompose();
    }).catch(err => {
      console.error('Support reply error', err);
      pushFlash('error', 'Failed to send reply: ' + (err.message || 'Unknown error'));
    }).finally(() => setSending(false));
  }, [API_URL, token, replyTargetUserID, replyTargetMessageID, composeDraft, closeCompose, selectedEmailId]);

  const updateMessageFlags = useCallback(async (id: string, flags: Partial<{ starred: boolean; archived: boolean }>) => {
    if (!API_URL || !token) return;
    const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` };
    try {
      if (flags.starred !== undefined) {
        await fetch(`${API_URL}/api/messages/${id}/starred`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ starred: flags.starred ? 1 : 0 })
        });
      }
      if (flags.archived !== undefined) {
        await fetch(`${API_URL}/api/messages/${id}/archived`, {
          method: 'POST',
          headers,
          body: JSON.stringify({ archived: flags.archived ? 1 : 0 })
        });
      }
    } catch (err) {
      console.warn('Failed updating message flags', err);
    }
  }, [API_URL, token]);

  const deleteMessage = useCallback((id: string) => {
    if (DEBUG_MESSAGES) console.debug('[Messages] Request move to trash', { id });
    // open confirm dialog instead of native confirm
    setConfirmDialog({
      open: true,
      title: 'Move to Trash',
      message: 'This message will be moved to Trash. You can restore it later from the Trash tab.',
      confirmLabel: 'Move to Trash',
      variant: 'trash',
      onConfirm: () => {
        setEmails(prev => prev.map(e => e.id === id ? { ...e, archived: true, mailbox: 'trash' } : e));
        updateMessageFlags(id, { archived: true });
        setSelectedEmailId(prev => prev === id ? null : prev);
        pushFlash('success','Moved to Trash');
      }
    });
  }, [updateMessageFlags, pushFlash]);

  const restoreMessage = useCallback((id: string) => {
    if (DEBUG_MESSAGES) console.debug('[Messages] Restore message', { id });
    setEmails(prev => prev.map(e => {
      if (e.id !== id) return e;
      const mailbox = e.messageStatus === 1 ? 'sent' : 'inbox';
      return { ...e, archived: false, mailbox };
    }));
    updateMessageFlags(id, { archived: false });
    pushFlash('success','Message restored.');
  }, [pushFlash, updateMessageFlags]);

  const permanentlyDelete = useCallback((id?: string) => {
    const bulk = selectedMailbox === 'trash';
    const archivedCount = emails.filter(e => e.archived).length;
    if (DEBUG_MESSAGES) console.debug('[Messages] Permanent delete dialog', { bulk, archivedCount, id });
    setConfirmDialog({
      open: true,
      title: bulk ? 'Empty Trash' : 'Delete Message',
      message: bulk ? `This will permanently delete ${archivedCount} archived message${archivedCount!==1?'s':''}. This cannot be undone.` : 'This will permanently delete the selected message. This cannot be undone.',
      confirmLabel: bulk ? 'Empty Trash' : 'Delete',
      variant: 'danger',
      onConfirm: () => {
        if (API_URL && token) {
          if (bulk) {
            fetch(`${API_URL}/api/messages/trash/empty`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }).catch(()=>{});
          } else if (id) {
            fetch(`${API_URL}/api/messages/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }).catch(()=>{});
          }
        }
        setEmails(prev => bulk ? prev.filter(e => !e.archived) : prev.filter(e => e.id !== id));
        setSelectedEmailId(null);
        pushFlash('success', bulk ? 'Trash emptied.' : 'Message deleted.');
      }
    });
  }, [pushFlash, API_URL, token, selectedMailbox, emails]);

  const toggleStar = useCallback((id: string) => {
    if (DEBUG_MESSAGES) console.debug('[Messages] Toggle star', { id });
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
    const current = emails.find(e => e.id === id);
    const newVal = !(current?.starred);
    updateMessageFlags(id, { starred: newVal });
  }, [emails, updateMessageFlags]);

  const replyTo = useCallback((email: Email) => {
    if (DEBUG_MESSAGES) console.debug('[Messages] Reply to', { id: email.id, senderID: email.senderID });
    const to = extractAddress(email.from);
    const body = buildReplyBody(email, adminName);
    toggleCompose({ to, subject: `Re: ${email.subject}`, body });
    setReplyTargetUserID(email.senderID ?? null);
    setReplyTargetMessageID(email.id);
  }, [toggleCompose, adminName]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (ev.key === 'c') { // Manual compose broadcast (re-added)
        ev.preventDefault();
        setBroadcastMode(true);
        toggleCompose({ to: '', subject: '', body: '' });
      }
      else if (ev.key === 'j') {
        ev.preventDefault();
        const idx = filteredEmails.findIndex(e => e.id === selectedEmailId);
        const next = filteredEmails[Math.min(filteredEmails.length - 1, Math.max(0, idx + 1))];
        if (next) setSelectedEmailId(next.id);
      } else if (ev.key === 'k') {
        ev.preventDefault();
        const idx = filteredEmails.findIndex(e => e.id === selectedEmailId);
        const prev = filteredEmails[Math.max(0, idx - 1)];
        if (prev) setSelectedEmailId(prev.id);
      } else if (ev.key === 'r') {
        if (selectedMailbox !== 'inbox') return; // reply only in inbox
        ev.preventDefault();
        if (selectedEmail) replyTo(selectedEmail);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filteredEmails, selectedEmailId, selectedEmail, replyTo, toggleCompose]);

  // Draft feature removed

  // ----------------- Confirm Dialog State -----------------
  const [confirmDialog, setConfirmDialog] = useState<{open:boolean; title:string; message:string; confirmLabel:string; onConfirm:()=>void; variant?:'danger'|'trash'}>({
    open:false,
    title:'',
    message:'',
    confirmLabel:'Confirm',
    onConfirm:()=>{},
    variant:'danger'
  });

  return (
    <div className="h-screen bg-white text-[#212121] flex">
      {/* Side Mailbox Panel */}
  <aside className="w-56 border-r border-slate-100 bg-white px-4 py-6 flex flex-col gap-4">
        <div className="text-lg font-semibold">Messages</div>
        <nav className="flex flex-col gap-2 text-sm">
          <button
            onClick={()=>setSelectedMailbox('inbox')}
            aria-pressed={selectedMailbox==='inbox'}
            className={`flex items-center justify-between px-3 py-2 rounded-md border transition ${selectedMailbox==='inbox' ? 'bg-slate-50 border-slate-200 font-medium' : 'border-transparent hover:bg-slate-50'}`}
          >
            <span className="flex items-center gap-2"><InboxIcon className="w-4 h-4"/>Inbox</span>
            {inboxPendingCount>0 && <span className="text-[10px] bg-[#111] text-white px-2 py-0.5 rounded-full">{inboxPendingCount}</span>}
          </button>
          <button
            onClick={()=>setSelectedMailbox('sent')}
            aria-pressed={selectedMailbox==='sent'}
            className={`flex items-center justify-between px-3 py-2 rounded-md border transition ${selectedMailbox==='sent' ? 'bg-slate-50 border-slate-200 font-medium' : 'border-transparent hover:bg-slate-50'}`}
          >
            <span className="flex items-center gap-2"><SendIcon className="w-4 h-4"/>Sent</span>
            {sentCount>0 && <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{sentCount}</span>}
          </button>
          <button
            onClick={()=>setSelectedMailbox('starred')}
            aria-pressed={selectedMailbox==='starred'}
            className={`flex items-center justify-between px-3 py-2 rounded-md border transition ${selectedMailbox==='starred' ? 'bg-slate-50 border-slate-200 font-medium' : 'border-transparent hover:bg-slate-50'}`}
          >
            <span className="flex items-center gap-2"><StarIcon className="w-4 h-4"/>Starred</span>
            {starredCount>0 && <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{starredCount}</span>}
          </button>
          <button
            onClick={()=>setSelectedMailbox('trash')}
            aria-pressed={selectedMailbox==='trash'}
            className={`flex items-center justify-between px-3 py-2 rounded-md border transition ${selectedMailbox==='trash' ? 'bg-slate-50 border-slate-200 font-medium' : 'border-transparent hover:bg-slate-50'}`}
          >
            <span className="flex items-center gap-2"><TrashIcon className="w-4 h-4"/>Trash</span>
            {trashCount>0 && <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">{trashCount}</span>}
          </button>
        </nav>
      </aside>
      {/* List Column */}
      <main className="flex-1 min-w-0 border-r border-slate-100 bg-white">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-3 capitalize">
              {selectedMailbox}
              {loading && <span className="text-xs font-normal text-slate-400 animate-pulse">Loading...</span>}
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchMessages()}
                className="flex items-center gap-1 px-3 py-2 rounded-md border border-slate-200 text-xs hover:bg-slate-50"
                aria-label="Refresh"
                disabled={loading}
              >
                <RefreshIcon className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              {lastFetched && (
                <span className="text-[10px] text-slate-400">{lastFetched.toLocaleTimeString()}</span>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <div className="relative w-full">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search"
                className="block w-full pl-10 pr-3 py-2 rounded-full border border-slate-100 text-sm"
                aria-label="Search messages"
              />
            </div>
            {/* Status tabs removed in favor of mailbox navigation */}
          </div>

          <div className="mt-4 h-[calc(100vh-220px)] overflow-auto relative">
            {error && (
              <div className="p-3 mb-2 rounded bg-red-50 text-red-600 text-xs flex items-center gap-2"><AlertIcon className="w-4 h-4" /> {error}</div>
            )}
            {(!loading && filteredEmails.length === 0 && !error) && (
              <div className="p-6 text-sm text-slate-500">No messages</div>
            )}
            {filteredEmails.map(e => (
              <button
                key={e.id}
                onClick={() => { setSelectedEmailId(e.id); }}
                className={`w-full text-left px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${selectedEmailId === e.id ? 'bg-slate-50' : ''}`}
                aria-pressed={selectedEmailId === e.id}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f3f3f3] flex items-center justify-center text-sm font-semibold text-[#212121] overflow-hidden">
                    {e.avatar ? (
                      <img src={e.avatar} alt={e.from} className="w-full h-full object-cover" />
                    ) : (
                      e.from.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="truncate font-medium text-[#212121] flex items-center gap-2">{e.from.split('<')[0].trim()}</div>
                      <div className="text-xs text-slate-500">{timeShort(e.time)}</div>
                    </div>
                    <div className="text-sm text-slate-700 truncate">{e.subject}</div>
                    <div className="text-xs text-slate-500 truncate">{e.body.replace(/\n/g, ' ').slice(0, 80)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      {e.starred && <StarIcon className="w-3 h-3" />}
                    </div>
                  </div>
                  {selectedMailbox === 'inbox' && (
                    <div className="ml-auto pl-2 flex items-start">
                      <button
                        onClick={(ev) => { ev.stopPropagation(); toggleStar(e.id); }}
                        aria-label={e.starred ? 'Unstar message' : 'Star message'}
                        className={`p-1 rounded transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 ${e.starred ? 'text-amber-400' : 'text-slate-400'}`}
                      >
                        <StarIcon className={`w-4 h-4 ${e.starred ? 'fill-amber-400' : 'fill-transparent'}`} />
                      </button>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Viewer */}
      <aside className="w-[60%] min-w-[420px] bg-white">
        <div className="px-2 py-1">
          <div className="flex items-center justify-between">
            <div className="flex w-full items-center justify-between border-b border-slate-200 pb-2">
              <div className="text-sm text-slate-400 capitalize">{selectedMailbox}</div>
              <div className="flex items-center gap-1">
                {selectedEmail && selectedMailbox === 'inbox' && (
                  <button
                    onClick={() => replyTo(selectedEmail)}
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                    aria-label="Reply"
                  >
                    <ReplyIcon className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Reply</span>
                  </button>
                )}
                {selectedEmail && selectedMailbox === 'inbox' && (
                  <button
                    onClick={() => toggleStar(selectedEmail.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${selectedEmail.starred ? 'text-amber-500 hover:bg-amber-50' : 'hover:bg-slate-100'}`}
                    aria-label={selectedEmail.starred ? 'Unstar' : 'Star'}
                  >
                    <StarIcon className={`w-4 h-4 ${selectedEmail.starred ? 'fill-amber-400 text-amber-500' : ''}`} />
                    <span className="hidden sm:inline text-sm">{selectedEmail.starred ? 'Unstar' : 'Star'}</span>
                  </button>
                )}
                {selectedMailbox === 'sent' && selectedEmail && (
                  <>
                    <button
                      onClick={() => deleteMessage(selectedEmail.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                      aria-label="Move to Trash"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Trash</span>
                    </button>
                    <button
                      onClick={() => toggleStar(selectedEmail.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${selectedEmail?.starred ? 'text-yellow-500 hover:bg-yellow-50' : 'hover:bg-slate-100'}`}
                      aria-label={selectedEmail?.starred ? 'Unstar' : 'Star'}
                    >
                      <StarIcon className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">{selectedEmail?.starred ? 'Unstar' : 'Star'}</span>
                    </button>
                  </>
                )}
                {selectedMailbox === 'trash' && (
                  <>
                    <button
                      onClick={() => selectedEmail && restoreMessage(selectedEmail.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                      aria-label="Restore"
                    >
                      <ReplyIcon className="w-4 h-4 rotate-180" />
                      <span className="hidden sm:inline text-sm">Restore</span>
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-2" />
                    <button
                      onClick={() => permanentlyDelete()}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                      aria-label="Empty Trash"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Empty Trash</span>
                    </button>
                  </>
                )}
                {selectedMailbox === 'starred' && selectedEmail && (
                  <>
                    <button
                      onClick={() => deleteMessage(selectedEmail.id)}
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                      aria-label="Move to Trash"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Trash</span>
                    </button>
                    <button
                      onClick={() => toggleStar(selectedEmail.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${selectedEmail?.starred ? 'text-yellow-500 hover:bg-yellow-50' : 'hover:bg-slate-100'}`}
                      aria-label={selectedEmail?.starred ? 'Unstar' : 'Star'}
                    >
                      <StarIcon className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">{selectedEmail?.starred ? 'Unstar' : 'Star'}</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white border border-slate-100 rounded p-6 min-h-[60vh]">
            {selectedEmail ? (
              <>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{selectedEmail.subject}</h3>
                    <div className="text-xs inline-block rounded bg-slate-100 px-2 py-1 text-slate-600">
                      {selectedEmail.body.includes('\n#') ? selectedEmail.body.split('\n').pop() : ''}
                    </div>
                    <div className="text-sm text-slate-500">
                      From: <span className="font-medium text-[#212121]">{selectedEmail.from}</span>
                    </div>
                    <div className="text-xs text-slate-400">Received: {new Date(selectedEmail.time).toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-6 prose prose-slate">
                  <pre className="whitespace-pre-wrap font-sans text-[#212121] leading-relaxed">{selectedEmail.body}</pre>
                </div>
              </>
            ) : (
              <div className="text-slate-500">...</div>
            )}
          </div>
        </div>
      </aside>

      {/* Compose / Reply Modal */}
      <div className="fixed right-6 bottom-6 z-50">
        <AnimatePresence>
          {composeOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.12 }}
              className="w-[520px] bg-white border border-slate-100 rounded-xl shadow-lg overflow-hidden flex flex-col"
              role="dialog"
              aria-label={broadcastMode ? 'Broadcast or Direct Message' : 'Reply'}
            >
              <div className="px-4 py-3 bg-[#f8f8f8] flex items-center justify-between gap-2">
                <div className="font-medium">{broadcastMode ? 'System / Broadcast Message' : 'Reply'}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setComposeMinimized(s => !s)}
                    className="p-1 rounded hover:bg-slate-100"
                    aria-label="Minimize"
                  >
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                    </svg>
                  </button>
                  <button onClick={closeCompose} className="p-1 rounded hover:bg-slate-100" aria-label="Close">
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {composeMinimized ? (
                <div className="px-4 py-2 text-sm text-slate-500 cursor-pointer" onClick={() => setComposeMinimized(false)}>
                  {composeDraft.subject || (broadcastMode ? 'Broadcast' : 'Reply')} — <span className="text-slate-400">{composeDraft.to}</span>
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-3 min-h-[260px]">
                  {!broadcastMode && (
                    <input
                      value={composeDraft.to}
                      onChange={e => setComposeDraft(s => ({ ...s, to: e.target.value }))}
                      placeholder="To"
                      className="w-full border border-slate-100 rounded px-3 py-2 text-sm outline-none"
                      aria-label="To"
                      disabled
                    />
                  )}
                  {broadcastMode && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">Recipient</label>
                      <select
                        value={recipient === 'ALL' ? 'ALL' : String(recipient)}
                        onChange={e => {
                          const v = e.target.value;
                          if (v === 'ALL') setRecipient('ALL'); else setRecipient(Number(v));
                        }}
                        className="w-full border border-slate-100 rounded px-3 py-2 text-sm outline-none bg-white"
                      >
                        <option value="ALL">ALL USERS</option>
                        {customerList.map(c => (
                          <option key={c.userID} value={c.userID}>{c.name} - {c.email}</option>
                        ))}
                      </select>
                      <span className="text-[11px] text-slate-500">
                        {recipient === 'ALL' ? 'Label will be System (broadcast to all customers).' : 'Direct support message to selected customer.'}
                      </span>
                    </div>
                  )}
                  <input
                    value={composeDraft.subject}
                    onChange={e => setComposeDraft(s => ({ ...s, subject: e.target.value }))}
                    placeholder="Subject"
                    className="w-full border border-slate-100 rounded px-3 py-2 text-sm outline-none"
                    aria-label="Subject"
                  />
                  <textarea
                    value={composeDraft.body}
                    onChange={e => setComposeDraft(s => ({ ...s, body: e.target.value }))}
                    placeholder={broadcastMode ? 'Announcement message...' : 'Reply message...'}
                    className="w-full min-h-[140px] border border-slate-100 rounded px-3 py-2 text-sm outline-none resize-none"
                    aria-label="Message body"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={sendCompose}
                      className="px-4 py-2 rounded-md bg-[#212121] text-white disabled:opacity-50 flex items-center gap-2"
                      disabled={sending}
                      aria-label={broadcastMode ? 'Send broadcast or direct message' : 'Send reply'}
                    >
                      {sending && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {sending ? (broadcastMode ? (recipient==='ALL' ? 'Broadcasting...' : 'Sending...') : 'Sending...') : (broadcastMode ? (recipient==='ALL' ? 'Broadcast' : 'Send Direct') : 'Send')}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.12 }}
              onClick={() => { setBroadcastMode(true); toggleCompose({ to: '', subject: '', body: '' }); }}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#212121] text-white shadow-lg"
              aria-label="Compose broadcast or direct message"
            >
              <PlusIcon className="w-4 h-4" />
              Compose
            </motion.button>
          )}
        </AnimatePresence>
      </div>
        {/* Inline flash message (replaces toast) */}
        {flash && (
          <div
            className={`fixed bottom-6 right-6 px-4 py-2 rounded-md shadow text-sm font-medium z-[999] transition-opacity duration-300
            ${flash.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
          >
            <div className="flex items-center gap-3">
              <span>{flash.message}</span>
              <button
                onClick={() => setFlash(null)}
                className="text-white/80 hover:text-white text-xs"
                aria-label="Dismiss notification"
              >
                ×
              </button>
            </div>
          </div>
        )}
      {/* Confirmation Dialog */}
      {confirmDialog.open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={() => setConfirmDialog(c => ({ ...c, open:false }))} />
          <div className="relative w-full max-w-sm mx-auto bg-white rounded-lg shadow-lg border border-slate-100 p-5 animate-[fadeIn_.15s_ease]">
            <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
              {confirmDialog.variant === 'danger' && <TrashIcon className="w-4 h-4 text-red-600" />}
              {confirmDialog.variant === 'trash' && <TrashIcon className="w-4 h-4 text-slate-600" />}
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-slate-600 whitespace-pre-line mb-4">{confirmDialog.message}</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDialog(c => ({ ...c, open:false }))}
                className="px-3 py-2 rounded-md text-sm border border-slate-200 hover:bg-slate-50"
              >Cancel</button>
              <button
                onClick={() => { const fn = confirmDialog.onConfirm; setConfirmDialog(c => ({ ...c, open:false })); fn(); }}
                className={`px-3 py-2 rounded-md text-sm text-white ${confirmDialog.variant==='danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-slate-700 hover:bg-slate-800'}`}
              >{confirmDialog.confirmLabel}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
