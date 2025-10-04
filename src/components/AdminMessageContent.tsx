// Simplified Admin Inbox (inbox only) now fetching from Laravel messages table
import { useCallback, useEffect, useMemo, useState, useRef, type JSX } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 as TrashIcon, Search as SearchIcon, Star as StarIcon, Reply as ReplyIcon, X as XIcon, Plus as PlusIcon, RefreshCcw as RefreshIcon, AlertTriangle as AlertIcon } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import pusher from '../utils/pusher';

export type Email = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  time: string; // ISO timestamp
  mailbox: string; // only 'inbox' used here
  // unread removed; rely on messageStatus state from backend
  starred?: boolean;
  avatar?: string | null; // profile picture absolute/relative URL
  senderID?: number; // original userID (for reply target)
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
  return {
    id: String(r.messageID),
    from: `${r.senderName || 'User'} <${r.senderEmail || 'unknown@example.com'}>` ,
    to: ['support@selfiegram.local'],
    subject: inquiryToSubject(r),
    body: r.message + `\n\n#${r.messageID}`,
    time: r.createdAt || new Date().toISOString(),
    mailbox: 'inbox',
    starred: false,
    avatar: buildAvatarURL(r.profilePicture, apiBase),
    senderID: r.senderID,
    messageStatus: r.messageStatus,
  };
}

/* -------------- Component -------------- */
export default function AdminMessageContent(): JSX.Element {
  const TOAST_ID = 'adminMessages';
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null); // stays null on load until user clicks
  const [searchQuery, setSearchQuery] = useState('');
  const [q, setQ] = useState(''); // immediate input for debounce
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const API_URL = (import.meta as any).env?.VITE_API_URL || '';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchMessages = useCallback(async () => {
    if (!API_URL || !token) {
      setError('Missing API URL or auth token.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await fetch(`${API_URL}/api/messages?per_page=100`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        signal: controller.signal,
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.message || `Request failed (${res.status})`);
      }
      const json = await res.json();
      const data: RawMessage[] = Array.isArray(json) ? json : (json.data || []);
  const mapped = data.map(r => mapRawToEmail(r, API_URL)).sort((a,b)=> +new Date(b.time) - +new Date(a.time));
      setEmails(mapped);
      setLastFetched(new Date());
    } catch (e: any) {
      if (e?.name === 'AbortError') return; // ignore abort
      setError(e?.message || 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [API_URL, token, selectedEmailId]);

  // initial load
  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // Real-time subscription for new messages via private admin channel (auth required)
  useEffect(() => {
    const channelName = 'private-admin.messages';
    const channel = pusher.subscribe(channelName);
    const handler = (data: any) => {
      if (!data || !data.messageID) return;
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
        return [mapped, ...prev].sort((a,b)=> +new Date(b.time) - +new Date(a.time));
      });
    };
    channel.bind('admin.message.created', handler);
    return () => {
      channel.unbind('admin.message.created', handler);
      pusher.unsubscribe(channelName);
    };
  }, [API_URL]);

  // compose state
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMinimized, setComposeMinimized] = useState(false);
  const [composeDraft, setComposeDraft] = useState({ to: '', subject: '', body: '' });
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
      .filter(e => e.mailbox === 'inbox')
      .filter(e => e.messageStatus === 0) // show only un-accommodated messages
      .filter(e => !ql || e.subject.toLowerCase().includes(ql) || e.body.toLowerCase().includes(ql) || e.from.toLowerCase().includes(ql))
      .sort((a, b) => +new Date(b.time) - +new Date(a.time));
  }, [emails, searchQuery]);

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
  }, []);

  const sendCompose = useCallback(() => {
    if (!replyTargetUserID || !replyTargetMessageID) {
      toast.error('No target message. Select a message then click Reply.', { containerId: TOAST_ID, autoClose: 3000 });
      return;
    }
    const cw = composeDraft;
    if (!cw.subject.trim()) {
      toast.error('Subject is required.', { containerId: TOAST_ID, autoClose: 2500 });
      return;
    }
    if (!cw.body.trim()) {
      toast.error('Message body is required.', { containerId: TOAST_ID, autoClose: 2500 });
      return;
    }
    if (!API_URL || !token) {
      toast.error('Missing API URL or authentication.', { containerId: TOAST_ID, autoClose: 3000 });
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
      // Mark original message as accommodated (messageStatus=1) and remove from list
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
        setEmails(prev => prev.filter(e => e.id !== replyTargetMessageID));
        if (selectedEmailId === replyTargetMessageID) {
          setSelectedEmailId(null); // leaves viewer empty after send
        }
      }
  toast.success('Reply has been successfully sent.', { containerId: TOAST_ID, autoClose: 2500, closeOnClick: true });
      // Clear draft and selection to avoid showing stale opened message
      setComposeDraft({ to: '', subject: '', body: '' });
      setReplyTargetUserID(null);
      setReplyTargetMessageID(null);
      setSelectedEmailId(null);
      closeCompose();
    }).catch(err => {
      console.error('Support reply error', err);
      toast.error('Failed to send reply: ' + (err.message || 'Unknown error'), { containerId: TOAST_ID, autoClose: 4000 });
    }).finally(() => setSending(false));
  }, [API_URL, token, replyTargetUserID, replyTargetMessageID, composeDraft, closeCompose, selectedEmailId]);

  const deleteMessage = useCallback((id: string) => {
    // Backend delete route not implemented; this is local removal only.
    const ok = window.confirm('Remove this message from view? (This does NOT delete from server)');
    if (!ok) return;
    setEmails(prev => prev.filter(e => e.id !== id));
    setSelectedEmailId(prev => prev === id ? null : prev);
  }, []);

  const toggleStar = useCallback((id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, starred: !e.starred } : e));
  }, []);

  const replyTo = useCallback((email: Email) => {
    const to = extractAddress(email.from);
    const body = `\n\n---\nOn ${new Date(email.time).toLocaleString()}, ${email.from} wrote:\n${email.body}`;
    toggleCompose({ to, subject: `Re: ${email.subject}`, body });
    setReplyTargetUserID(email.senderID ?? null);
    setReplyTargetMessageID(email.id);
  }, [toggleCompose]);

  /* Keyboard shortcuts */
  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (ev.key === 'c') { ev.preventDefault(); toggleCompose(); }
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
        ev.preventDefault();
        if (selectedEmail) replyTo(selectedEmail);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [filteredEmails, selectedEmailId, selectedEmail, replyTo, toggleCompose]);

  return (
    <div className="h-screen bg-white text-[#212121] flex">
      {/* Inbox Column */}
      <main className="flex-1 min-w-0 border-r border-slate-100 bg-white">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold flex items-center gap-3">
              Inbox
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
                      <div className="truncate font-medium text-[#212121]">{e.from.split('<')[0].trim()}</div>
                      <div className="text-xs text-slate-500">{timeShort(e.time)}</div>
                    </div>
                    <div className="text-sm text-slate-700 truncate">{e.subject}</div>
                    <div className="text-xs text-slate-500 truncate">{e.body.replace(/\n/g, ' ').slice(0, 80)}</div>
                    <div className="flex items-center gap-2 mt-2">
                      {e.starred && <StarIcon className="w-3 h-3" />}
                    </div>
                  </div>
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
              <div className="text-sm text-slate-400">Inbox</div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => selectedEmail && replyTo(selectedEmail)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                  aria-label="Reply"
                >
                  <ReplyIcon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Reply</span>
                </button>
                <div className="w-px h-6 bg-slate-200 mx-2" />
                <button
                  onClick={() => selectedEmail && deleteMessage(selectedEmail.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                  aria-label="Delete"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Delete</span>
                </button>
                <button
                  onClick={() => selectedEmail && toggleStar(selectedEmail.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${selectedEmail?.starred ? 'text-yellow-500 hover:bg-yellow-50' : 'hover:bg-slate-100'}`}
                  aria-label={selectedEmail?.starred ? 'Unstar' : 'Star'}
                >
                  <StarIcon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">{selectedEmail?.starred ? 'Unstar' : 'Star'}</span>
                </button>
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

      {/* Compose */}
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
              aria-label="Compose new message"
            >
              <div className="px-4 py-3 bg-[#f8f8f8] flex items-center justify-between gap-2">
                <div className="font-medium">New message</div>
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
                  {composeDraft.subject || 'New message'} — <span className="text-slate-400">{composeDraft.to}</span>
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-3 min-h-[240px]">
                  <input
                    value={composeDraft.to}
                    onChange={e => setComposeDraft(s => ({ ...s, to: e.target.value }))
                    }
                    placeholder="To"
                    className="w-full border border-slate-100 rounded px-3 py-2 text-sm outline-none"
                    aria-label="To"
                  />
                  <input
                    value={composeDraft.subject}
                    onChange={e => setComposeDraft(s => ({ ...s, subject: e.target.value }))
                    }
                    placeholder="Subject"
                    className="w-full border border-slate-100 rounded px-3 py-2 text-sm outline-none"
                    aria-label="Subject"
                  />
                  <textarea
                    value={composeDraft.body}
                    onChange={e => setComposeDraft(s => ({ ...s, body: e.target.value }))
                    }
                    placeholder="Message..."
                    className="w-full min-h-[120px] border border-slate-100 rounded px-3 py-2 text-sm outline-none resize-none"
                    aria-label="Message body"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={sendCompose}
                      className="px-4 py-2 rounded-md bg-[#212121] text-white disabled:opacity-50 flex items-center gap-2"
                      disabled={sending}
                      aria-label="Send message"
                    >
                      {sending && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {sending ? 'Sending...' : 'Send'}
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
              onClick={() => toggleCompose()}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#212121] text-white shadow-lg"
              aria-label="Compose"
            >
              <PlusIcon className="w-4 h-4" />
              Compose
            </motion.button>
          )}
        </AnimatePresence>
      </div>
        {/* Local ToastContainer (scoped) */}
        <ToastContainer
          containerId={TOAST_ID}
          position="bottom-right"
          autoClose={3000}
          newestOnTop
          closeOnClick
          pauseOnHover={false}
          pauseOnFocusLoss={false}
          draggable={false}
          theme="light"
          limit={3}
        />
    </div>
  );
}
