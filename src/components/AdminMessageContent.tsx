// Simplified Admin Inbox (inbox only) now fetching from Laravel messages table
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  type JSX,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2 as TrashIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Reply as ReplyIcon,
  X as XIcon,
  RefreshCcw as RefreshIcon,
  AlertTriangle as AlertIcon,
  Inbox as InboxIcon,
  Send as SendIcon,
  Plus as PlusIcon,
} from "lucide-react";
import pusher from "../utils/pusher";
import { fetchWithAuth } from "../utils/fetchWithAuth";

const DEBUG_MESSAGES = true;

export type Email = {
  id: string;
  from: string;
  to: string[];
  subject: string;
  body: string;
  time: string;
  mailbox: string;
  starred: boolean;
  archived: boolean;
  avatar?: string | null;
  senderID?: number;
  messageStatus?: number;
  replies?: {
    notificationID: number;
    title: string;
    message: string;
    time: string;
  }[];
};

const timeShort = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0)
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const extractAddress = (raw: string) => {
  const m = raw.match(/<([^>]+)>/);
  return m ? m[1] : raw.trim();
};

interface RawMessage {
  messageID: number;
  senderID: number;
  senderName: string;
  senderEmail: string;
  message: string;
  inquiryOptions: string;
  messageStatus: number;
  createdAt?: string;
  profilePicture?: string | null;
  starred?: number;
  archived?: number;
}

// Outbound support reply (notification) joined with original target message structure from /api/messages/outbound
interface OutboundJoinedRecord {
  type: string; // 'support_reply'
  notificationID: number;
  userID: number;
  title: string;
  label: string; // 'Support'
  message: string;
  time: string;
  starred: number;
  targetMessageID: number | null;
  targetMessage: null | {
    messageID: number;
    senderID: number;
    senderName: string;
    senderEmail: string;
    inquiryOptions: string;
    message: string;
    messageStatus: number;
    archived: number;
    starred: number;
    createdAt: string;
  };
}

const INQUIRY_LABELS: Record<string, string> = {
  other: "General",
  pricing: "Pricing & Packages",
  promotions: "Promotions / Discounts",
  account: "Account / Technical Support",
  payment: "Payment & Billing",
};

const inquiryToSubject = (raw: RawMessage) =>
  INQUIRY_LABELS[raw.inquiryOptions] || "General";

function buildAvatarURL(
  raw: string | null | undefined,
  apiBase: string
): string | null {
  if (!raw) return null;
  if (/^(https?:)?\/\//i.test(raw) || raw.startsWith("data:")) return raw;
  const cleaned = raw.replace(/^storage\//, "").replace(/^\/+/, "");
  return apiBase ? `${apiBase}/storage/${cleaned}` : `/storage/${cleaned}`;
}

function mapRawToEmail(r: RawMessage, apiBase: string): Email {
  const archived = (r.archived ?? 0) === 1;
  const starred = (r.starred ?? 0) === 1;
  let mailbox: string;
  if (archived) mailbox = "trash";
  else mailbox = "inbox"; // keep replied messages in inbox; Sent tab derives them via messageStatus
  return {
    id: String(r.messageID),
    from: `${r.senderName || "User"} <${
      r.senderEmail || "unknown@example.com"
    }>`,
    to: ["support@selfiegram.local"],
    subject: inquiryToSubject(r),
    body: r.message + `\n#${r.messageID}`,
    time: r.createdAt || new Date().toISOString(),
    mailbox,
    starred,
    archived,
    avatar: buildAvatarURL(r.profilePicture, apiBase),
    senderID: r.senderID,
    messageStatus: r.messageStatus,
    replies: undefined,
  };
}

function mapOutboundToEmail(r: OutboundJoinedRecord): Email {
  // For direct support replies we treat them as true outbound items distinct from original user message.
  const related = r.targetMessage;
  const toEmail = related?.senderEmail || 'user@example.com';
  const toName = related?.senderName || 'User';
  const hashRef = related ? `\n#${related.messageID}` : '';
  return {
    id: `notif-${r.notificationID}`,
    from: `Support Staff <support@selfiegram.local>` ,
    to: [ `${toName} <${toEmail}>` ],
    subject: r.title || 'Support Reply',
    body: r.message + hashRef,
    time: r.time,
    mailbox: 'sent',
    starred: r.starred === 1,
    archived: false,
    avatar: null,
    senderID: related?.senderID ?? r.userID,
    messageStatus: 1,
    replies: undefined,
  };
}

function buildReplyBody(email: Email, adminName: string) {
  const timestamp = new Date(email.time).toLocaleString();
  const header = `On ${timestamp}, ${email.from} wrote:`;
  const original = email.body.replace(/\n\n(#\d+)/g, "\n$1");
  return [
    "",
    "---",
    "If you have more questions, kindly send us a new contact form and we hope that you are satisfied with our service.",
    "",
    "Regards,",
    adminName,
    "SelfieGram Support Staff",
    "---",
    `${header}`,
    original,
  ].join("\n");
}

function extractHashIds(text: string | null | undefined): string[] {
  if (!text) return [];
  const out: string[] = [];
  const re = /#(\d{1,10})/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push(m[1]);
  }
  return out;
}

export default function AdminMessageContent(): JSX.Element {
  const [adminName, setAdminName] = useState<string>("Support Staff");
  const [flash, setFlash] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const pushFlash = useCallback(
    (type: "success" | "error", message: string, ttl = 3200) => {
      setFlash({ type, message });
      if (ttl > 0) {
        window.setTimeout(
          () => setFlash((f) => (f?.message === message ? null : f)),
          ttl
        );
      }
    },
    []
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (raw) {
        const u = JSON.parse(raw);
        const name =
          [u.fname, u.lname].filter(Boolean).join(" ").trim() ||
          u.username ||
          "Admin";
        setAdminName(name);
      }
    } catch {}
  }, []);

  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [q, setQ] = useState("");
  const [selectedMailbox, setSelectedMailbox] = useState<
    "inbox" | "sent" | "trash" | "starred"
  >("inbox");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // removed lastFetched (unused)
  const abortRef = useRef<AbortController | null>(null);
  const initialFetchDoneRef = useRef(false);
  const dataSnapshotRef = useRef<string | null>(null);

  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMinimized, setComposeMinimized] = useState(false);
  const [composeDraft, setComposeDraft] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [broadcastMode, setBroadcastMode] = useState(false);
  const [customerList, setCustomerList] = useState<
    { userID: number; name: string; email: string }[]
  >([]);
  const [recipient, setRecipient] = useState<"ALL" | number>("ALL");
  const [replyTargetUserID, setReplyTargetUserID] = useState<number | null>(
    null
  );
  const [replyTargetMessageID, setReplyTargetMessageID] = useState<
    string | null
  >(null);
  const [sending, setSending] = useState(false);
  const loadingRepliesRef = useRef<Set<string>>(new Set());

  // ✅ FIXED: ADD MISSING STATES FOR SEARCHABLE DROPDOWN
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientDropdownOpen, setRecipientDropdownOpen] = useState(false);
  const recipientInputRef = useRef<HTMLInputElement>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    onConfirm: () => void;
    variant?: "danger" | "trash";
  }>({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    onConfirm: () => {},
    variant: "danger",
  });

  const API_URL = (import.meta as any).env?.VITE_API_URL || "";
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // ✅ FIXED: ADD FILTERED CUSTOMERS MEMO
  const filteredCustomers = useMemo(() => {
    if (!recipientSearch.trim()) return customerList;

    const query = recipientSearch.toLowerCase();
    return customerList.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query)
    );
  }, [customerList, recipientSearch]);

  const fetchMessages = useCallback(async () => {
    if (!API_URL || !token) {
      if (DEBUG_MESSAGES)
        console.debug("[Messages] Skip fetch: missing", {
          API_URL: !!API_URL,
          token: !!token,
        });
      return;
    }
    try {
  // removed start timing variable (unused after merge logic)
      setLoading(true);
      setError(null);
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Fetch inbound messages and outbound replies concurrently
      const [messagesRes, outboundRes] = await Promise.all([
        fetchWithAuth(`${API_URL}/api/messages?per_page=100`, { signal: controller.signal }),
        fetchWithAuth(`${API_URL}/api/messages/outbound?per_page=200`, { signal: controller.signal }).catch((e) => {
          if (DEBUG_MESSAGES) console.warn('[Outbound] fetch failed', e);
          return null; // don't fail whole fetch if outbound fails
        }),
      ]);

      if (!messagesRes.ok) {
        let bodyText = "";
        try { bodyText = await messagesRes.text(); } catch {}
        let parsed: any = null;
        try { parsed = bodyText ? JSON.parse(bodyText) : null; } catch {}
        const msg = parsed?.message || parsed?.error || bodyText || `Request failed (${messagesRes.status})`;
        throw new Error(msg);
      }

      const jsonMessages = await messagesRes.json();
      const baseData: RawMessage[] = Array.isArray(jsonMessages) ? jsonMessages : jsonMessages.data || [];

      let outboundData: OutboundJoinedRecord[] = [];
      if (outboundRes && outboundRes.ok) {
        try {
          const outboundJson = await outboundRes.json();
            const arr = Array.isArray(outboundJson) ? outboundJson : outboundJson.data || [];
            outboundData = arr.filter((r: any) => r && r.label === 'Support');
        } catch (e) {
          if (DEBUG_MESSAGES) console.warn('[Outbound] parse failed', e);
        }
      }

      const mappedInbound = baseData.map((r) => mapRawToEmail(r, API_URL));
      const mappedOutbound = outboundData.map(mapOutboundToEmail);

      // Merge ensuring no duplicate IDs
      const mergedMap = new Map<string, Email>();
      [...mappedInbound, ...mappedOutbound].forEach((m) => {
        if (!mergedMap.has(m.id)) mergedMap.set(m.id, m);
      });
      const merged = Array.from(mergedMap.values()).sort((a, b) => +new Date(b.time) - +new Date(a.time));

      const snapshotKey =
        merged.length +
        ":" +
        merged
          .slice(0, 5)
          .map((m) => m.id)
          .join(",");

      if (dataSnapshotRef.current === snapshotKey) {
        if (DEBUG_MESSAGES)
          console.debug("[Messages] No data change; skip state update");
      } else {
        dataSnapshotRef.current = snapshotKey;
        setEmails(merged);
  // lastFetched removed
      }
      setError(null);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      if (DEBUG_MESSAGES) console.debug("[Messages] Fetch error", e);
      setError(e?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  }, [API_URL, token]);

  useEffect(() => {
    if (!token) return;
    if (initialFetchDoneRef.current) return;
    initialFetchDoneRef.current = true;
    fetchMessages();
  }, [fetchMessages, token]);

    useEffect(() => {
    const channelName = "private-admin.messages";
    const channel = pusher.subscribe(channelName);
      const handler = (data: any) => {
      if (!data || !data.messageID) return;

      // NEW: derive sender ID properly (stop forcing 0)
      const realSenderID =
        data.senderID ??
        data.userID ??
        data.customerID ??
        data.fromUserID ??
        null;

      const raw: RawMessage = {
        messageID: data.messageID,
        senderID: realSenderID, // was 0
        senderName: data.senderName,
        senderEmail: data.senderEmail,
        message: data.message,
        inquiryOptions: data.inquiryOptions,
        messageStatus: data.messageStatus,
        createdAt: data.createdAt,
        profilePicture: data.profilePicture || null,
        starred: data.starred,
        archived: data.archived,
      };

      // Recovery: if senderID still null, try a delayed shallow fetch to hydrate it
      if (raw.senderID == null && API_URL) {
        setTimeout(() => {
          const recoveryHeaders: Record<string, string> = { Accept: "application/json" };
            if (token) recoveryHeaders.Authorization = `Bearer ${token}`;
          fetch(`${API_URL}/api/messages?recent=1`, { headers: recoveryHeaders })
            .then((r) => (r.ok ? r.json() : null))
            .then((json) => {
              if (!json) return;
              const list: any[] = Array.isArray(json) ? json : json.data || [];
              const match = list.find((m) => String(m.messageID) === String(data.messageID));
              if (match && match.senderID != null) {
                setEmails((prev) => prev.map((e) => e.id === String(data.messageID) ? { ...e, senderID: match.senderID, avatar: buildAvatarURL(match.profilePicture, API_URL) } : e));
              }
            })
            .catch(() => {});
        }, 600);
      }

      setEmails((prev) => {
        if (prev.some((e) => e.id === String(raw.messageID))) return prev;
        const mapped = mapRawToEmail(raw, API_URL);
        return [mapped, ...prev].sort(
          (a, b) => +new Date(b.time) - +new Date(a.time)
        );
      });
    };
    channel.bind("admin.message.created", handler);

    // Outbound support replies (sent notifications) real-time
    const outboundHandler = (data: any) => {
      if (!data || !data.notification) return;
      const n = data.notification;
      if (n.label !== 'Support') return;
      const targetMessageID = data.targetMessageID ? String(data.targetMessageID) : null;
      setEmails(prev => {
        const id = `notif-${n.notificationID}`;
        if (prev.some(e => e.id === id)) return prev;
        const email: Email = {
          id,
          from: 'Support Staff <support@selfiegram.local>',
          to: ['user'],
          subject: n.title || 'Support Reply',
          body: n.message,
          time: n.time,
          mailbox: 'sent',
          starred: n.starred === 1,
          archived: false,
          avatar: null,
          senderID: undefined,
          messageStatus: 1,
          replies: undefined,
        };
        let updated = prev.map(e => (targetMessageID && e.id === targetMessageID) ? { ...e, messageStatus: 1 } : e);
        updated = [email, ...updated];
        return updated.sort((a,b)=>+new Date(b.time)-+new Date(a.time));
      });
    };
    channel.bind('support.reply.created', outboundHandler);
    return () => {
      channel.unbind("admin.message.created", handler);
      channel.unbind('support.reply.created', outboundHandler);
      pusher.unsubscribe(channelName);
    };
  }, [API_URL]);

  useEffect(() => {
    const id = window.setTimeout(() => setSearchQuery(q.trim()), 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    if (selectedEmailId && !emails.some((e) => e.id === selectedEmailId)) {
      setSelectedEmailId(null);
    }
  }, [emails, selectedEmailId]);

  // ✅ FIXED: ADD CLICK-OUTSIDE HANDLER
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        recipientInputRef.current &&
        !recipientInputRef.current.parentElement?.contains(event.target as Node)
      ) {
        setRecipientDropdownOpen(false);
      }
    };

    if (recipientDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [recipientDropdownOpen]);

  const selectedEmail = useMemo(
    () => emails.find((e) => e.id === selectedEmailId) ?? null,
    [emails, selectedEmailId]
  );

  const filteredEmails = useMemo(() => {
    const ql = searchQuery.toLowerCase();
    return emails
      .filter((e) => {
        if (selectedMailbox === "trash") return e.archived;
        if (selectedMailbox === "starred") return e.starred && !e.archived;
        if (selectedMailbox === "sent") {
          // Only show true outbound notifications / synthetic sent entries
          return !e.archived && e.mailbox === 'sent';
        }
        if (selectedMailbox === "inbox")
          return e.mailbox === 'inbox' && !e.archived && (e.messageStatus ?? 0) === 0; // only unreplied
        return false;
      })
      .filter(
        (e) =>
          !ql ||
          e.subject.toLowerCase().includes(ql) ||
          e.body.toLowerCase().includes(ql) ||
          e.from.toLowerCase().includes(ql)
      )
      .sort((a, b) => +new Date(b.time) - +new Date(a.time));
  }, [emails, searchQuery, selectedMailbox]);

  const inboxPendingCount = useMemo(
    () =>
      emails.filter(
        (e) =>
          e.mailbox === "inbox" && !e.archived && (e.messageStatus ?? 0) === 0
      ).length,
    [emails]
  );

  const sentCount = useMemo(
    () => emails.filter((e) => !e.archived && e.mailbox === 'sent').length,
    [emails]
  );

  const trashCount = useMemo(
    () => emails.filter((e) => e.archived).length,
    [emails]
  );

  const starredCount = useMemo(
    () => emails.filter((e) => e.starred && !e.archived).length,
    [emails]
  );

  useEffect(() => {
    if (!broadcastMode) return;
    if (!API_URL || !token) return;
    fetch(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const customers = data
            .filter((u: any) => (u.userType || u.usertype) === "Customer")
            .map((u: any) => ({
              userID: u.userID,
              name:
                u.name ||
                [u.fname, u.lname].filter(Boolean).join(" ").trim() ||
                u.username ||
                `User #${u.userID}`,
              email: u.email,
            }));
          setCustomerList(customers);
        }
      })
      .catch((err) => console.error("Fetch customers failed", err));
  }, [broadcastMode, API_URL, token]);

  const toggleCompose = useCallback(
    (opts?: { to?: string; subject?: string; body?: string }) => {
      if (!composeOpen) {
        setComposeDraft({
          to: opts?.to ?? "",
          subject: opts?.subject ?? "",
          body: opts?.body ?? "",
        });
        setComposeMinimized(false);
        setComposeOpen(true);
        return;
      }
      if (composeOpen && !composeMinimized && !opts) {
        setComposeOpen(false);
        return;
      }
      if (composeOpen && composeMinimized) {
        setComposeMinimized(false);
        if (opts) setComposeDraft((s) => ({ ...s, ...opts }));
        return;
      }
      if (opts) {
        setComposeDraft((s) => ({ ...s, ...opts }));
        setComposeMinimized(false);
      }
    },
    [composeOpen, composeMinimized]
  );

  // ✅ FIXED: UPDATE closeCompose TO RESET NEW STATES
  const closeCompose = useCallback(() => {
    setComposeDraft({ to: "", subject: "", body: "" });
    setComposeOpen(false);
    setComposeMinimized(false);
    setBroadcastMode(false);
    setRecipient("ALL");
    setRecipientSearch("");
    setRecipientDropdownOpen(false);
  }, []);

  const sendCompose = useCallback(() => {
    const fireBrowserNotification = (title: string, body: string) => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      try {
        if (Notification.permission === "granted") {
          new Notification(title, { body });
        } else if (Notification.permission === "default") {
          Notification.requestPermission()
            .then((p) => {
              if (p === "granted") {
                new Notification(title, { body });
              }
            })
            .catch(() => {});
        }
      } catch {}
    };

    if (broadcastMode) {
      if (!composeDraft.subject.trim()) {
        pushFlash("error", "Subject is required.");
        return;
      }
      if (!composeDraft.body.trim()) {
        pushFlash("error", "Message body is required.");
        return;
      }
      if (!API_URL || !token) {
        pushFlash("error", "Missing API URL or authentication.");
        return;
      }
      setSending(true);
      const isAll = recipient === "ALL";
      const endpoint = isAll
        ? `${API_URL}/api/admin/notifications/broadcast`
        : `${API_URL}/api/admin/support-replies`;
      const payload = isAll
        ? { title: composeDraft.subject.trim(), message: composeDraft.body }
        : {
            userID: recipient,
            subject: composeDraft.subject.trim(),
            body: composeDraft.body,
          };
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })
        .then(async (res) => {
          if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || `Failed (${res.status})`);
          }
          pushFlash(
            "success",
            isAll
              ? "Broadcast sent to all customers."
              : "Message sent to selected customer."
          );
          fireBrowserNotification(
            isAll ? "Broadcast Sent" : "Message Sent",
            isAll
              ? "Your system broadcast was delivered to all customers."
              : "Direct support message delivered to selected customer."
          );
          // Removed optimistic insertion for direct messages to prevent duplicate "Sent" entries.
          // Real-time Pusher event (support.reply.created) will add the sent item.
          closeCompose();
        })
        .catch((err) => {
          console.error("Broadcast error", err);
          pushFlash(
            "error",
            "Failed to send message: " + (err.message || "Unknown error")
          );
        })
        .finally(() => setSending(false));
      return;
    }

    if (replyTargetUserID == null || replyTargetMessageID == null) {
      if (DEBUG_MESSAGES) {
        console.debug("[Reply] Blocked send due to missing targets", {
          replyTargetUserID,
          replyTargetMessageID,
        });
      }
      pushFlash(
        "error",
        "No target message. Select a message then click Reply."
      );
      return;
    }
    const cw = composeDraft;
    if (!cw.subject.trim()) {
      pushFlash("error", "Subject is required.");
      return;
    }
    if (!cw.body.trim()) {
      pushFlash("error", "Message body is required.");
      return;
    }
    if (!API_URL || !token) {
      pushFlash("error", "Missing API URL or authentication.");
      return;
    }
    setSending(true);
    fetch(`${API_URL}/api/admin/support-replies`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userID: replyTargetUserID,
        subject: cw.subject.trim(),
        body: cw.body,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Failed (${res.status})`);
        }
        if (replyTargetMessageID) {
          fetch(`${API_URL}/api/messages/${replyTargetMessageID}/status`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ messageStatus: 1 }),
          }).catch(() => {});
          setEmails((prev) =>
            prev.map((e) =>
              e.id === replyTargetMessageID
                ? { ...e, messageStatus: 1 }
                : e
            )
          );
          if (selectedEmailId === replyTargetMessageID)
            setSelectedEmailId(null);
        }
        pushFlash("success", "Reply has been successfully sent.");
        fireBrowserNotification(
          "Reply Sent",
          "Your support reply was delivered successfully."
        );
        setComposeDraft({ to: "", subject: "", body: "" });
        setReplyTargetUserID(null);
        setReplyTargetMessageID(null);
        setSelectedEmailId(null);
        closeCompose();
      })
      .catch((err) => {
        console.error("Support reply error", err);
        pushFlash(
          "error",
          "Failed to send reply: " + (err.message || "Unknown error")
        );
      })
      .finally(() => setSending(false));
  }, [
    API_URL,
    token,
    replyTargetUserID,
    replyTargetMessageID,
    composeDraft,
    closeCompose,
    selectedEmailId,
    broadcastMode,
    recipient,
    adminName,
    pushFlash,
  ]);

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
      } catch (err) {
        console.warn("Failed updating message flags", err);
      }
    },
    [API_URL, token]
  );

  const deleteMessage = useCallback(
    (id: string) => {
      setConfirmDialog({
        open: true,
        title: "Move to Trash",
        message:
          "This message will be moved to Trash. You can restore it later from the Trash tab.",
        confirmLabel: "Move to Trash",
        variant: "trash",
        onConfirm: () => {
          setEmails((prev) =>
            prev.map((e) =>
              e.id === id ? { ...e, archived: true, mailbox: "trash" } : e
            )
          );
          updateMessageFlags(id, { archived: true });
          setSelectedEmailId((prev) => (prev === id ? null : prev));
          pushFlash("success", "Moved to Trash");
        },
      });
    },
    [updateMessageFlags, pushFlash]
  );

  const restoreMessage = useCallback(
    (id: string) => {
      setEmails((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          return { ...e, archived: false, mailbox: "inbox" };
        })
      );
      updateMessageFlags(id, { archived: false });
      pushFlash("success", "Message restored.");
    },
    [pushFlash, updateMessageFlags]
  );

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
              fetch(`${API_URL}/api/messages/trash/empty`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => {});
            } else if (id) {
              fetch(`${API_URL}/api/messages/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }).catch(() => {});
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

  const toggleStar = useCallback(
    (id: string) => {
      setEmails((prev) =>
        prev.map((e) => (e.id === id ? { ...e, starred: !e.starred } : e))
      );
      const current = emails.find((e) => e.id === id);
      const newVal = !current?.starred;
      updateMessageFlags(id, { starred: newVal });
    },
    [emails, updateMessageFlags]
  );

  const replyTo = useCallback(
    (email: Email) => {
      const to = extractAddress(email.from);
      const body = buildReplyBody(email, adminName);
      // Ensure we are in reply mode (not broadcast)
      setBroadcastMode(false);
      toggleCompose({ to, subject: `Re: ${email.subject}`, body });
      setReplyTargetUserID(email.senderID ?? null);
      setReplyTargetMessageID(email.id);
    },
    [toggleCompose, adminName]
  );

  const loadReplies = useCallback(
    async (email: Email) => {
      if (!API_URL || !token) return;
      if (!email.senderID) return;
      if (loadingRepliesRef.current.has(email.id)) return;
      if (email.mailbox !== "sent" || email.replies !== undefined) return;
      loadingRepliesRef.current.add(email.id);
      try {
        const res = await fetch(
          `${API_URL}/api/notifications/${email.senderID}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        if (!res.ok) return;
        const rows = await res.json();
        if (!Array.isArray(rows)) return;
        const targetId = String(email.id);
        const matches = rows
          .filter((n: any) => n && n.label === "Support")
          .filter((n: any) => {
            const ids = extractHashIds(String(n.message || ""));
            return ids.includes(targetId);
          })
          .map((n: any) => ({
            notificationID: n.notificationID,
            title: n.title,
            message: n.message,
            time: n.time,
          }));
        setEmails((prev) =>
          prev.map((e) => (e.id === email.id ? { ...e, replies: matches } : e))
        );
      } catch (err) {
      } finally {
        loadingRepliesRef.current.delete(email.id);
      }
    },
    [API_URL, token, setEmails]
  );

  useEffect(() => {
    if (selectedMailbox === "sent" && selectedEmail) {
      loadReplies(selectedEmail);
    }
  }, [selectedMailbox, selectedEmail, loadReplies]);

  useEffect(() => {
    const handler = (ev: KeyboardEvent) => {
      const tag = (ev.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (ev.key === "c") {
        ev.preventDefault();
        setBroadcastMode(true);
        toggleCompose({ to: "", subject: "", body: "" });
      } else if (ev.key === "j") {
        ev.preventDefault();
        const idx = filteredEmails.findIndex((e) => e.id === selectedEmailId);
        const next =
          filteredEmails[
            Math.min(filteredEmails.length - 1, Math.max(0, idx + 1))
          ];
        if (next) setSelectedEmailId(next.id);
      } else if (ev.key === "k") {
        ev.preventDefault();
        const idx = filteredEmails.findIndex((e) => e.id === selectedEmailId);
        const prev = filteredEmails[Math.max(0, idx - 1)];
        if (prev) setSelectedEmailId(prev.id);
      } else if (ev.key === "r") {
        if (selectedMailbox !== "inbox") return;
        ev.preventDefault();
        if (selectedEmail) replyTo(selectedEmail);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    filteredEmails,
    selectedEmailId,
    selectedEmail,
    replyTo,
    toggleCompose,
    selectedMailbox,
  ]);

  return (
    <div className="h-screen bg-white text-[#212121] flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <aside className="hidden md:flex md:w-56 border-r border-slate-100 bg-white px-4 py-6 flex-col gap-4">
        <div className="text-lg font-semibold">Messages</div>
        <nav className="flex flex-col gap-2 text-sm">
          <button
            onClick={() => setSelectedMailbox("inbox")}
            aria-pressed={selectedMailbox === "inbox"}
            className={`flex items-center justify-between px-3 py-2 rounded-md border transition ${
              selectedMailbox === "inbox"
                ? "bg-slate-50 border-slate-200 font-medium"
                : "border-transparent hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <InboxIcon className="w-4 h-4" />
              Inbox
            </span>
            {inboxPendingCount > 0 && (
              <span className="text-[10px] bg-[#212121] text-white px-2 py-0.5 rounded-full">
                {inboxPendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedMailbox("sent")}
            aria-pressed={selectedMailbox === "sent"}
            className={`flex items-center justify-between px-3 py-2 rounded-md border transition ${
              selectedMailbox === "sent"
                ? "bg-slate-50 border-slate-200 font-medium"
                : "border-transparent hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <SendIcon className="w-4 h-4" />
              Sent
            </span>
            {sentCount > 0 && (
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {sentCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedMailbox("starred")}
            aria-pressed={selectedMailbox === "starred"}
            className={`flex items-center justify-between px-3 py-2 rounded-md border transition ${
              selectedMailbox === "starred"
                ? "bg-slate-50 border-slate-200 font-medium"
                : "border-transparent hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <StarIcon className="w-4 h-4" />
              Starred
            </span>
            {starredCount > 0 && (
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {starredCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setSelectedMailbox("trash")}
            aria-pressed={selectedMailbox === "trash"}
            className={`flex items-center justify-between px-3 py-2 rounded-md border transition ${
              selectedMailbox === "trash"
                ? "bg-slate-50 border-slate-200 font-medium"
                : "border-transparent hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-2">
              <TrashIcon className="w-4 h-4" />
              Trash
            </span>
            {trashCount > 0 && (
              <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                {trashCount}
              </span>
            )}
          </button>
        </nav>
      </aside>

      {/* Mobile Bottom Navigation - Only show on mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
        <nav className="flex items-center justify-around px-2 py-2">
          <button
            onClick={() => setSelectedMailbox("inbox")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
              selectedMailbox === "inbox"
                ? "bg-[#212121] text-white"
                : "text-slate-600"
            }`}
          >
            <InboxIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Inbox</span>
          </button>
          <button
            onClick={() => setSelectedMailbox("sent")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
              selectedMailbox === "sent"
                ? "bg-[#212121] text-white"
                : "text-slate-600"
            }`}
          >
            <SendIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Sent</span>
          </button>
          <button
            onClick={() => setSelectedMailbox("starred")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
              selectedMailbox === "starred"
                ? "bg-[#212121] text-white"
                : "text-slate-600"
            }`}
          >
            <StarIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Starred</span>
          </button>
          <button
            onClick={() => setSelectedMailbox("trash")}
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition ${
              selectedMailbox === "trash"
                ? "bg-[#212121] text-white"
                : "text-slate-600"
            }`}
          >
            <TrashIcon className="w-5 h-5" />
            <span className="text-[10px] font-medium">Trash</span>
          </button>
        </nav>
      </div>

      {/* List Column - Hide when message selected on mobile */}
      <main
        className={`${
          selectedEmail ? "hidden md:flex" : "flex"
        } flex-1 min-w-0 border-r border-slate-100 bg-white flex-col overflow-hidden`}
      >
        <div className="px-4 md:px-6 py-4 md:py-6 flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold capitalize">
              {selectedMailbox}
            </h2>
            <button
              onClick={() => fetchMessages()}
              className="flex items-center gap-1 px-2 md:px-3 py-1.5 md:py-2 rounded-md border border-slate-200 text-xs hover:bg-slate-50"
              disabled={loading}
            >
              <RefreshIcon
                className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>

          <div className="relative w-full mb-4">
            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search messages..."
              className="block w-full pl-10 pr-3 py-2 rounded-full border border-slate-100 text-sm outline-none focus:border-[#212121]"
            />
          </div>

          <div className="flex-1 overflow-auto pb-20 md:pb-4">
            {error && (
              <div className="p-3 mb-2 rounded bg-red-50 text-red-600 text-xs flex items-center gap-2">
                <AlertIcon className="w-4 h-4" /> {error}
              </div>
            )}
            {!loading && filteredEmails.length === 0 && !error && (
              <div className="p-6 text-sm text-slate-500 text-center">
                No messages
              </div>
            )}
            {filteredEmails.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedEmailId(e.id)}
                className={`w-full text-left px-3 md:px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition ${
                  selectedEmailId === e.id ? "bg-slate-50" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#f3f3f3] flex items-center justify-center text-sm font-semibold overflow-hidden flex-shrink-0">
                    {e.avatar ? (
                      <img
                        src={e.avatar}
                        alt={e.from}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      e.from.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate font-medium text-[#212121] text-sm">
                        {e.from.split("<")[0].trim()}
                      </div>
                      <div className="text-xs text-slate-500 flex-shrink-0">
                        {timeShort(e.time)}
                      </div>
                    </div>
                    <div className="text-sm text-slate-700 truncate">
                      {e.subject}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {e.body.replace(/\n/g, " ").slice(0, 60)}
                    </div>
                  </div>
                  {(selectedMailbox === "inbox" ||
                    selectedMailbox === "sent") && (
                    <button
                      onClick={(ev) => {
                        ev.stopPropagation();
                        toggleStar(e.id);
                      }}
                      className={`p-1.5 rounded hover:bg-slate-100 flex-shrink-0 ${
                        e.starred ? "text-amber-400" : "text-slate-400"
                      }`}
                    >
                      <StarIcon
                        className={`w-4 h-4 ${
                          e.starred ? "fill-amber-400" : "fill-transparent"
                        }`}
                      />
                    </button>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Viewer - Full screen on mobile when message selected */}

      <aside
        className={`${
          selectedEmail ? "flex" : "hidden md:flex"
        } flex-2 p-4 bg-white flex-col overflow-auto pb-20 md:pb-4 w-60%`}
      >
        {selectedEmail ? (
          <div className="flex flex-col h-full">
            {/* Mobile back button */}
            <button
              onClick={() => setSelectedEmailId(null)}
              className="md:hidden flex items-center gap-2 px-3 py-2 mb-3 ml-18 text-sm text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>

            <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-full bg-[#f3f3f3] flex items-center justify-center text-base font-semibold overflow-hidden flex-shrink-0">
                  {selectedEmail.avatar ? (
                    <img
                      src={selectedEmail.avatar}
                      alt={selectedEmail.from}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    selectedEmail.from.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-base truncate">
                    {selectedEmail.from.split("<")[0].trim()}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    {extractAddress(selectedEmail.from)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {new Date(selectedEmail.time).toLocaleString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => toggleStar(selectedEmail.id)}
                  className={`p-2 rounded hover:bg-slate-100 ${
                    selectedEmail.starred ? "text-amber-400" : "text-slate-400"
                  }`}
                >
                  <StarIcon
                    className={`w-4 h-4 ${
                      selectedEmail.starred
                        ? "fill-amber-400"
                        : "fill-transparent"
                    }`}
                  />
                </button>
                <button
                  onClick={() => deleteMessage(selectedEmail.id)}
                  className="p-2 rounded hover:bg-slate-100 text-slate-600"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto py-4">
              <h3 className="text-lg font-semibold mb-3">
                {selectedEmail.subject}
              </h3>
              <div className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                {selectedEmail.body}
              </div>

              {selectedEmail.replies && selectedEmail.replies.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <h4 className="text-sm font-semibold mb-3">
                    Replies ({selectedEmail.replies.length})
                  </h4>
                  {selectedEmail.replies.map((r) => (
                    <div
                      key={r.notificationID}
                      className="mb-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div className="text-xs font-semibold mb-1">
                        {r.title}
                      </div>
                      <div className="text-xs text-slate-600 whitespace-pre-wrap">
                        {r.message}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-2">
                        {new Date(r.time).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedMailbox === "inbox" && (
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={() => replyTo(selectedEmail)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-[#212121] text-white text-sm hover:bg-[#333]"
                >
                  <ReplyIcon className="w-4 h-4" />
                  Reply
                </button>
              </div>
            )}

            {selectedMailbox === "trash" && (
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => restoreMessage(selectedEmail.id)}
                  className="flex-1 px-4 py-2.5 rounded-md border border-slate-200 text-sm hover:bg-slate-50"
                >
                  Restore
                </button>
                <button
                  onClick={() => permanentlyDelete(selectedEmail.id)}
                  className="flex-1 px-4 py-2.5 rounded-md bg-[#212121] text-white text-sm hover:bg-[#333]"
                >
                  Delete Forever
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Select a message to view
          </div>
        )}
      </aside>

      {/* Compose Modal with Fixed Recipient Selector */}
      <div className="fixed right-2 md:right-6 bottom-20 md:bottom-6 z-50 w-auto max-w-[calc(100vw-1rem)] sm:max-w-[520px]">
        <AnimatePresence>
          {composeOpen ? (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.12 }}
              /* Changed overflow-hidden -> overflow-visible so dropdown isn't clipped */
              className="w-[calc(100vw-1rem)] sm:w-[520px] bg-white border border-slate-100 rounded-xl shadow-lg overflow-visible flex flex-col max-h-[80vh]"
              role="dialog"
              aria-label={
                broadcastMode ? "Broadcast or Direct Message" : "Reply"
              }
            >
              <div className="px-4 py-3 bg-[#f8f8f8] flex items-center justify-between gap-2">
                <div className="font-medium">
                  {broadcastMode ? "System / Broadcast Message" : "Reply"}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setComposeMinimized((s) => !s)}
                    className="p-1 rounded hover:bg-slate-100"
                    aria-label="Minimize"
                  >
                    <svg
                      className="w-4 h-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={closeCompose}
                    className="p-1 rounded hover:bg-slate-100"
                    aria-label="Close"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {composeMinimized ? (
                <div
                  className="px-4 py-2 text-sm text-slate-500 cursor-pointer"
                  onClick={() => setComposeMinimized(false)}
                >
                  {composeDraft.subject ||
                    (broadcastMode ? "Broadcast" : "Reply")}{" "}
                  — <span className="text-slate-400">{composeDraft.to}</span>
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-3 min-h-[260px]">
                  {!broadcastMode && (
                    <input
                      value={composeDraft.to}
                      onChange={(e) =>
                        setComposeDraft((s) => ({ ...s, to: e.target.value }))
                      }
                      placeholder="To"
                      className="w-full border border-slate-100 rounded px-3 py-2 text-sm outline-none"
                      aria-label="To"
                      disabled
                    />
                  )}

                  {/* ✅ PREMIUM SEARCHABLE RECIPIENT SELECTOR */}
                  {broadcastMode && (
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-slate-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        Recipient
                      </label>

                      <div className="relative group">
                        <div className="relative">
                          <SearchIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />

                          <input
                            ref={recipientInputRef}
                            type="text"
                            value={
                              recipient !== "ALL" && !recipientSearch
                                ? customerList.find(
                                    (c) => c.userID === recipient
                                  )?.name || ""
                                : recipientSearch
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              setRecipientSearch(value);
                              if (value && recipient !== "ALL") {
                                setRecipient("ALL"); // Reset selection when typing
                              }
                              setRecipientDropdownOpen(true);
                            }}
                            onFocus={() => setRecipientDropdownOpen(true)}
                            placeholder="Search by name or email..."
                            className="w-full border-2 border-slate-200 rounded-xl pl-10 pr-24 py-3 text-sm 
             outline-none bg-white hover:border-slate-300 
             focus:border-blue-500 focus:ring-4 focus:ring-blue-50
             transition-all duration-200 placeholder:text-slate-400
             shadow-sm"
                          />

                          {/* Selection Pills - Show when NOT searching */}
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            {recipient !== "ALL" && !recipientSearch && (
                              <div
                                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 
                      border border-blue-200 rounded-lg px-3 py-1.5 max-w-[200px]"
                              >
                                <div
                                  className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 
                        flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                                >
                                  {customerList
                                    .find((c) => c.userID === recipient)
                                    ?.name.charAt(0)
                                    .toUpperCase()}
                                </div>
                                <span className="text-xs font-medium text-blue-700 truncate">
                                  {
                                    customerList.find(
                                      (c) => c.userID === recipient
                                    )?.name
                                  }
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setRecipient("ALL");
                                    setRecipientSearch("");
                                  }}
                                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded p-0.5 transition"
                                  type="button"
                                >
                                  <XIcon size={14} />
                                </button>
                              </div>
                            )}

                            {recipient === "ALL" && !recipientSearch && (
                              <div
                                className="flex items-center gap-1.5 bg-gradient-to-r from-green-50 to-emerald-50 
                      border border-green-200 rounded-lg px-3 py-1.5"
                              >
                                <svg
                                  className="w-4 h-4 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                                <span className="text-xs font-semibold text-green-700">
                                  All Users
                                </span>
                              </div>
                            )}

                            {recipientSearch && (
                              <button
                                onClick={() => {
                                  setRecipientSearch("");
                                  setRecipientDropdownOpen(true);
                                }}
                                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition"
                                type="button"
                              >
                                <XIcon size={16} />
                              </button>
                            )}
                          </div>
                        </div>

                        {recipientDropdownOpen && (
                          <div
                            className="absolute z-[70] w-full mt-2 bg-white border-2 border-slate-200 
                                          rounded-xl shadow-2xl flex flex-col max-h-[430px]"
                          >
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2 border-b border-slate-200">
                              <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                Quick Select
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setRecipient("ALL");
                                setRecipientSearch("");
                                setRecipientDropdownOpen(false);
                              }}
                              className={`w-full px-4 py-3 text-left transition-all duration-150 flex items-center gap-3 border-b-2 border-slate-100
                                          ${
                                            recipient === "ALL"
                                              ? "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500"
                                              : ""
                                          }`}
                            >
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm
                                              transition-all duration-200
                                              ${
                                                recipient === "ALL"
                                                  ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                                  : "bg-gradient-to-br from-slate-400 to-slate-500"
                                              }`}
                              >
                                <svg
                                  className="w-6 h-6 text-white"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div
                                  className={`font-bold text-sm transition-colors
                                                ${
                                                  recipient === "ALL"
                                                    ? "text-green-700"
                                                    : "text-slate-800"
                                                }`}
                                >
                                  Broadcast to All Customers
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                  {customerList.length} active recipients
                                </div>
                              </div>
                              {recipient === "ALL" && (
                                <div className="flex-shrink-0">
                                  <svg
                                    className="w-6 h-6 text-green-600"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </button>

                            {filteredCustomers.length > 0 && (
                              <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                                  Individual Recipients ({filteredCustomers.length})
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  Total Loaded: {customerList.length}
                                </div>
                              </div>
                            )}

                            <div
                              className="overflow-y-auto max-h-60"
                              style={{
                                scrollbarWidth: "thin",
                                scrollbarColor: "#cbd5e1 #f1f5f9",
                              }}
                              role="listbox"
                              aria-label="Select recipient"
                              onWheel={(e) => e.stopPropagation()}
                            >
                              {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer, index) => (
                                  <button
                                    key={customer.userID}
                                    type="button"
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      console.log(
                                        "Selected:",
                                        customer.userID,
                                        customer.name
                                      );
                                      setRecipient(customer.userID);
                                      setRecipientSearch("");
                                      setRecipientDropdownOpen(false);
                                    }}
                                    className={`w-full px-4 py-3 text-left transition-all duration-150 flex items-center gap-3
                                                ${
                                                  index !==
                                                  filteredCustomers.length - 1
                                                    ? "border-b border-slate-100"
                                                    : ""
                                                }
                                                ${
                                                  recipient === customer.userID
                                                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-gray-400"
                                                    : ""
                                                }`}
                                  >
                                    <div className="relative">
                                      <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center
                                                      text-white text-sm font-bold flex-shrink-0 shadow-sm
                                                      transition-all duration-200
                                                      ${
                                                        recipient ===
                                                        customer.userID
                                                          ? "bg-gradient-to-br from-gray-400 to-gray-700"
                                                          : "bg-gradient-to-br from-gray-700 to-gray-400"
                                                      }`}
                                      >
                                        {customer.name.charAt(0).toUpperCase()}
                                      </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div
                                        className={`font-semibold text-sm truncate transition-colors
                                                      ${
                                                        recipient ===
                                                        customer.userID
                                                          ? "text-blue-700"
                                                          : "text-slate-800"
                                                      }`}
                                      >
                                        {customer.name}
                                      </div>
                                      <div className="text-xs text-slate-500 truncate mt-0.5">
                                        {customer.email}
                                      </div>
                                    </div>

                                    {recipient === customer.userID && (
                                      <div className="flex-shrink-0">
                                        <svg
                                          className="w-5 h-5 text-blue-600"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      </div>
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-10 text-center">
                                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                                    <SearchIcon className="w-8 h-8 text-slate-300" />
                                  </div>
                                  <div className="text-sm font-semibold text-slate-700 mb-1">
                                    No customers found
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    {recipientSearch
                                      ? `Try different search terms for "${recipientSearch}"`
                                      : "Start typing to search by name or email"}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2 border-t border-slate-200">
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                <span>Type to filter • Select one recipient or broadcast to all</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all duration-200
                                      ${
                                        recipient === "ALL"
                                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                                          : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                                      }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm
                                        ${
                                          recipient === "ALL"
                                            ? "bg-gradient-to-br from-green-500 to-emerald-600"
                                            : "bg-gradient-to-br from-blue-500 to-indigo-600"
                                        }`}
                        >
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            {recipient === "ALL" ? (
                              <>
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                              </>
                            ) : (
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            )}
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-xs font-bold mb-0.5 ${
                              recipient === "ALL"
                                ? "text-green-700"
                                : "text-blue-700"
                            }`}
                          >
                            {recipient === "ALL"
                              ? "System Broadcast"
                              : "Direct Message"}
                          </div>
                          <div className="text-[11px] text-slate-600 leading-relaxed">
                            {recipient === "ALL" ? (
                              <>
                                Notification will be sent to{" "}
                                <span className="font-semibold">
                                  {customerList.length} customers
                                </span>
                              </>
                            ) : (
                              <>
                                Sending private message to{" "}
                                <span className="font-semibold">
                                  {
                                    customerList.find(
                                      (c) => c.userID === recipient
                                    )?.name
                                  }
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <input
                    value={composeDraft.subject}
                    onChange={(e) =>
                      setComposeDraft((s) => ({
                        ...s,
                        subject: e.target.value,
                      }))
                    }
                    placeholder="Subject"
                    className="w-full border border-slate-100 rounded px-3 py-2 text-sm outline-none"
                    aria-label="Subject"
                  />
                  <textarea
                    value={composeDraft.body}
                    onChange={(e) =>
                      setComposeDraft((s) => ({ ...s, body: e.target.value }))
                    }
                    placeholder={
                      broadcastMode
                        ? "Announcement message..."
                        : "Reply message..."
                    }
                    className="w-full min-h-[140px] border border-slate-100 rounded px-3 py-2 text-sm outline-none resize-none"
                    aria-label="Message body"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={sendCompose}
                      className="px-4 py-2 rounded-md bg-[#212121] text-white disabled:opacity-50 flex items-center gap-2"
                      disabled={sending}
                      aria-label={
                        broadcastMode
                          ? "Send broadcast or direct message"
                          : "Send reply"
                      }
                    >
                      {sending && (
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {sending
                        ? broadcastMode
                          ? recipient === "ALL"
                            ? "Broadcasting..."
                            : "Sending..."
                          : "Sending..."
                        : broadcastMode
                        ? recipient === "ALL"
                          ? "Broadcast"
                          : "Send Direct"
                        : "Send"}
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
              onClick={() => {
                setBroadcastMode(true);
                toggleCompose({ to: "", subject: "", body: "" });
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-[#212121] text-white shadow-lg"
              aria-label="Compose broadcast or direct message"
            >
              <PlusIcon className="w-4 h-4" />
              Compose
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {flash && (
        <div
          className={`fixed bottom-6 right-6 px-4 py-2 rounded-md shadow text-sm font-medium z-[999] transition-opacity duration-300
            ${
              flash.type === "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }`}
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

      {confirmDialog.open && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"
            onClick={() => setConfirmDialog((c) => ({ ...c, open: false }))}
          />
          <div className="relative w-full max-w-sm mx-auto bg-white rounded-lg shadow-lg border border-slate-100 p-5 animate-[fadeIn_.15s_ease]">
            <h3 className="text-base font-semibold mb-2 flex items-center gap-2">
              {confirmDialog.variant === "danger" && (
                <TrashIcon className="w-4 h-4 text-red-600" />
              )}
              {confirmDialog.variant === "trash" && (
                <TrashIcon className="w-4 h-4 text-slate-600" />
              )}
              {confirmDialog.title}
            </h3>
            <p className="text-sm text-slate-600 whitespace-pre-line mb-4">
              {confirmDialog.message}
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDialog((c) => ({ ...c, open: false }))}
                className="px-3 py-2 rounded-md text-sm border border-slate-200 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const fn = confirmDialog.onConfirm;
                  setConfirmDialog((c) => ({ ...c, open: false }));
                  fn();
                }}
                className={`px-3 py-2 rounded-md text-sm text-white ${
                  confirmDialog.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-slate-700 hover:bg-slate-800"
                }`}
              >
                {confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
