// AdminEmailApp.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type JSX,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail as MailIcon,
  Send as SendIcon,
  FileText as FileTextIcon,
  Trash2 as TrashIcon,
  Inbox as InboxIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Reply as ReplyIcon,
  X as XIcon,
  Plus as PlusIcon,
  Settings as SettingsIcon,
  Layers as FoldersIcon,
  ArrowPath as ArrowLeft,
} from "lucide-react";
import { ArrowPath } from "lucide-react";

/**
 * AdminEmailApp.tsx
 * - Layout references provided image (left vertical icon bar, middle list, right viewer)
 * - Removed "archive" feature entirely
 * - Removed CC and attachments from compose
 * - Compose is Gmail-style bottom-right popover (toggle, minimize, close)
 * - Action buttons: Reply, Reply All (if desired), Delete (moves to Trash), Star
 *
 * Requirements: React + TypeScript, TailwindCSS, framer-motion, lucide-react
 */

/* ----------------------------- Types ---------------------------------- */

type MailboxId = "inbox" | "sent" | "drafts" | "trash";

export type Email = {
  id: string;
  from: string;
  to: string[]; // keep as array internally, compose uses comma-separated string
  subject: string;
  body: string;
  time: string; // ISO
  mailbox: MailboxId;
  unread?: boolean;
  starred?: boolean;
};

type Mailbox = { id: MailboxId; name: string; icon: React.ComponentType<any> };

/* --------------------------- Utilities -------------------------------- */

const makeId = (pref = "id") =>
  `${pref}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;

const timeShort = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0)
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

/* --------------------------- Initial data ------------------------------ */

const MAILBOXES: Mailbox[] = [
  { id: "inbox", name: "Inbox", icon: InboxIcon },
  { id: "sent", name: "Sent", icon: SendIcon },
  { id: "drafts", name: "Drafts", icon: FileTextIcon },
  { id: "trash", name: "Trash", icon: TrashIcon },
];

const nowIso = new Date().toISOString();
const INITIAL_EMAILS: Email[] = [
  {
    id: makeId("e"),
    from: "Hannah Morgan <hannah@example.com>",
    to: ["me@example.com"],
    subject: "Meeting scheduled",
    body: "Hi James, I just scheduled a meeting with the team to go over the design...",
    time: nowIso,
    mailbox: "inbox",
    unread: true,
    starred: false,
  },
  {
    id: makeId("e"),
    from: "Megan Clark <megan@example.com>",
    to: ["me@example.com"],
    subject: "Update on marketing campaign",
    body: "Hey Richard, here's an update on the marketing campaign my team is working on...",
    time: nowIso,
    mailbox: "inbox",
    unread: false,
    starred: false,
  },
  {
    id: makeId("e"),
    from: "Russ Miller <russ@example.com>",
    to: ["me@example.com"],
    subject: "We need some more swag",
    body: "Hey James, We're running out of company swag, you need to order more!",
    time: nowIso,
    mailbox: "inbox",
    unread: false,
    starred: true,
  },
];

/* ----------------------------- Component ------------------------------- */

export default function AdminEmailApp(): JSX.Element {
  const [emails, setEmails] = useState<Email[]>(() =>
    [...INITIAL_EMAILS].sort((a, b) => +new Date(b.time) - +new Date(a.time))
  );

  // UI state
  const [selectedMailbox, setSelectedMailbox] = useState<MailboxId>("inbox");
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(
    emails[0]?.id ?? null
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // search + filter in middle column
  const [searchQuery, setSearchQuery] = useState("");
  const [listTab, setListTab] = useState<"all" | "read" | "unread">("all");

  // compose (no cc, no attachments)
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMinimized, setComposeMinimized] = useState(false);
  const [composeDraft, setComposeDraft] = useState<{
    to: string;
    subject: string;
    body: string;
  }>({
    to: "",
    subject: "",
    body: "",
  });

  // derived
  const selectedEmail = useMemo(
    () => emails.find((e) => e.id === selectedEmailId) ?? null,
    [emails, selectedEmailId]
  );

  const filteredEmails = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return emails
      .filter((e) => e.mailbox === selectedMailbox)
      .filter((e) => {
        if (listTab === "unread") return !!e.unread;
        if (listTab === "read") return !e.unread;
        return true;
      })
      .filter((e) => {
        if (!q) return true;
        return (
          e.subject.toLowerCase().includes(q) ||
          e.body.toLowerCase().includes(q) ||
          e.from.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => +new Date(b.time) - +new Date(a.time));
  }, [emails, selectedMailbox, searchQuery, listTab]);

  // when mailbox changes, select first
  useEffect(() => {
    const list = emails.filter((e) => e.mailbox === selectedMailbox);
    setSelectedEmailId(list[0]?.id ?? null);
  }, [selectedMailbox, emails]);

  // mark selected as read
  useEffect(() => {
    if (!selectedEmailId) return;
    setEmails((prev) =>
      prev.map((p) => (p.id === selectedEmailId ? { ...p, unread: false } : p))
    );
  }, [selectedEmailId]);

  /* ---------------------------- compose logic -------------------------- */

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
      // If open and not minimized and pressing compose again -> close
      if (composeOpen && !composeMinimized && !opts) {
        setComposeOpen(false);
        return;
      }
      // If minimized -> restore
      if (composeOpen && composeMinimized) {
        setComposeMinimized(false);
        if (opts) setComposeDraft((s) => ({ ...s, ...opts }));
        return;
      }
      // If open + opts -> fill (reply)
      if (opts) {
        setComposeDraft((s) => ({ ...s, ...opts }));
        setComposeMinimized(false);
      }
    },
    [composeOpen, composeMinimized]
  );

  const closeCompose = useCallback(() => {
    setComposeDraft({ to: "", subject: "", body: "" });
    setComposeOpen(false);
    setComposeMinimized(false);
  }, []);

  const sendCompose = useCallback(() => {
    const cw = composeDraft;
    if (!cw.to.trim() && !cw.subject.trim() && !cw.body.trim()) return;
    const sent: Email = {
      id: makeId("e"),
      from: "me <me@example.com>",
      to: cw.to
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      subject: cw.subject || "(no subject)",
      body: cw.body,
      time: new Date().toISOString(),
      mailbox: "sent",
      unread: false,
      starred: false,
    };
    setEmails((prev) =>
      [sent, ...prev].sort((a, b) => +new Date(b.time) - +new Date(a.time))
    );

    // simulate delivered copy to inbox
    setTimeout(() => {
      const delivered: Email = {
        ...sent,
        id: makeId("e"),
        mailbox: "inbox",
        unread: true,
      };
      setEmails((prev) =>
        [delivered, ...prev].sort(
          (a, b) => +new Date(b.time) - +new Date(a.time)
        )
      );
    }, 800);

    closeCompose();
  }, [composeDraft, closeCompose]);

  const saveDraft = useCallback(() => {
    const cw = composeDraft;
    const draft: Email = {
      id: makeId("e"),
      from: "me <me@example.com>",
      to: cw.to
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      subject: cw.subject || "(no subject)",
      body: cw.body,
      time: new Date().toISOString(),
      mailbox: "drafts",
      unread: false,
      starred: false,
    };
    setEmails((prev) =>
      [draft, ...prev].sort((a, b) => +new Date(b.time) - +new Date(a.time))
    );
    closeCompose();
  }, [composeDraft, closeCompose]);

  /* --------------------------- email actions --------------------------- */

  const moveToTrash = useCallback((emailId: string) => {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === emailId ? { ...e, mailbox: "trash", unread: false } : e
      )
    );
    setSelectedEmailId(null);
  }, []);

  const restoreFromTrash = useCallback((emailId: string) => {
    setEmails((prev) =>
      prev.map((e) =>
        e.id === emailId ? { ...e, mailbox: "inbox", unread: true } : e
      )
    );
    setSelectedEmailId(null);
  }, []);

  const permanentlyDelete = useCallback((emailId: string) => {
    setEmails((prev) => prev.filter((e) => e.id !== emailId));
    setSelectedEmailId(null);
  }, []);

  const toggleStar = useCallback((emailId: string) => {
    setEmails((prev) =>
      prev.map((e) => (e.id === emailId ? { ...e, starred: !e.starred } : e))
    );
  }, []);

  const replyTo = useCallback(
    (email: Email) => {
      const body = `\n\n---\nOn ${new Date(email.time).toLocaleString()}, ${
        email.from
      } wrote:\n${email.body}`;
      toggleCompose({ to: email.from, subject: `Re: ${email.subject}`, body });
    },
    [toggleCompose]
  );

  const replyAll = useCallback(
    (email: Email) => {
      const recipients = [email.from, ...(email.to || [])].join(", ");
      const body = `\n\n---\nOn ${new Date(email.time).toLocaleString()}, ${
        email.from
      } wrote:\n${email.body}`;
      toggleCompose({ to: recipients, subject: `Re: ${email.subject}`, body });
    },
    [toggleCompose]
  );

  /* ------------------------------- render ------------------------------- */

  return (
    <div className="h-screen bg-white text-[#212121] flex">
      {/* Left vertical icon bar + labels (like reference) */}
      <aside className="flex flex-col">
        <div className="flex flex-row h-full">
          {/* Icons column */}
          <div className="w-16 bg-[#111] flex flex-col items-center py-4 gap-6">
            <div className="w-10 h-10 rounded-md bg-white flex items-center justify-center text-[#111] font-bold">
              d
            </div>
            <button className="p-2 rounded hover:bg-[#222] text-white">
              <MailIcon className="w-5 h-5" />
            </button>
            <button className="p-2 rounded hover:bg-[#222] text-white">
              <FoldersIcon className="w-5 h-5" />
            </button>
            <button className="p-2 rounded hover:bg-[#222] text-white">
              <SettingsIcon className="w-5 h-5" />
            </button>
            <div className="mt-auto p-2 text-white opacity-70">
              <XIcon className="w-5 h-5 rotate-90" />
            </div>
          </div>

          {/* Labels + mailbox list */}
          <div className="w-64 border-r border-slate-100 bg-white px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Email</div>
              <button
                className="p-1 rounded hover:bg-slate-50"
                title="New folder"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex flex-col gap-2">
              {MAILBOXES.map((mb) => {
                const count = emails.filter(
                  (e) => e.mailbox === mb.id && e.unread
                ).length;
                const Icon = mb.icon;
                return (
                  <button
                    key={mb.id}
                    onClick={() => setSelectedMailbox(mb.id)}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md text-sm text-left hover:bg-slate-50 ${
                      selectedMailbox === mb.id
                        ? "bg-slate-50 font-medium"
                        : "text-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span>{mb.name}</span>
                    </div>
                    {count > 0 && (
                      <span className="text-xs bg-[#212121] text-white px-2 py-0.5 rounded-full">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="mt-6">
              <div className="text-xs text-slate-500">Folders</div>
              <div className="mt-2 flex flex-col gap-2">
                <button className="text-sm text-slate-700 rounded px-2 py-1 text-left hover:bg-slate-50">
                  Add Folder
                </button>
                <button className="text-sm text-slate-700 rounded px-2 py-1 text-left hover:bg-slate-50">
                  Client
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Middle column: header, search, tabs, list */}
      <main className="flex-1 min-w-0 border-r border-slate-100 bg-white">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Inbox</h2>
            <button
              className="p-2 rounded-full bg-[#111] text-white"
              onClick={() => toggleCompose()}
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Search + add */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 relative">
              <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className="w-full pl-10 pr-3 py-2 rounded-full border border-slate-100 text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setListTab("all")}
                className={`px-3 py-1 rounded-full text-sm ${
                  listTab === "all"
                    ? "bg-[#111] text-white"
                    : "bg-slate-100 text-[#212121]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setListTab("read")}
                className={`px-3 py-1 rounded-full text-sm ${
                  listTab === "read"
                    ? "bg-[#111] text-white"
                    : "bg-slate-100 text-[#212121]"
                }`}
              >
                Read
              </button>
              <button
                onClick={() => setListTab("unread")}
                className={`px-3 py-1 rounded-full text-sm ${
                  listTab === "unread"
                    ? "bg-[#111] text-white"
                    : "bg-slate-100 text-[#212121]"
                }`}
              >
                Unread
              </button>
            </div>
          </div>

          {/* List */}
          <div className="mt-4 h-[calc(100vh-220px)] overflow-auto">
            {filteredEmails.length === 0 ? (
              <div className="p-6 text-sm text-slate-500">No messages</div>
            ) : (
              filteredEmails.map((e) => (
                <div
                  key={e.id}
                  onClick={() => setSelectedEmailId(e.id)}
                  className={`px-4 py-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${
                    selectedEmailId === e.id ? "bg-slate-50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f3f3f3] flex items-center justify-center text-sm font-semibold text-[#212121]">
                      {e.from.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <div
                          className={`truncate ${
                            e.unread
                              ? "font-semibold text-[#212121]"
                              : "font-medium text-[#333]"
                          }`}
                        >
                          {e.from.split("<")[0].trim()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {timeShort(e.time)}
                        </div>
                      </div>
                      <div className="text-sm text-slate-700 truncate">
                        {e.subject}
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {e.body.replace(/\n/g, " ").slice(0, 80)}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        {e.unread && (
                          <span className="w-2 h-2 bg-[#212121] rounded-full" />
                        )}
                        {e.starred && <StarIcon className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Right column: viewer */}
      <aside className="w-[60%] min-w-[420px] bg-white">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="ml-4 flex items-center gap-1 border-b border-slate-200 pb-2">
                {/* Reply */}
                <button
                  onClick={() => selectedEmail && replyTo(selectedEmail)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                >
                  <ReplyIcon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">Reply</span>
                </button>

                {/* Divider */}
                <div className="w-px h-6 bg-slate-200 mx-2" />

                {/* Trash actions */}
                {selectedEmail?.mailbox === "trash" ? (
                  <>
                    <button
                      onClick={() =>
                        selectedEmail && restoreFromTrash(selectedEmail.id)
                      }
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-slate-100 transition"
                    >
                      <ArrowPath className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">Restore</span>
                    </button>
                    <button
                      onClick={() =>
                        selectedEmail && permanentlyDelete(selectedEmail.id)
                      }
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                    >
                      <TrashIcon className="w-4 h-4" />
                      <span className="hidden sm:inline text-sm">
                        Delete forever
                      </span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() =>
                      selectedEmail && moveToTrash(selectedEmail.id)
                    }
                    className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-red-50 text-red-600 hover:text-red-700 transition"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span className="hidden sm:inline text-sm">Delete</span>
                  </button>
                )}

                {/* Star */}
                <button
                  onClick={() => selectedEmail && toggleStar(selectedEmail.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
                    selectedEmail?.starred
                      ? "text-yellow-500 hover:bg-yellow-50"
                      : "hover:bg-slate-100"
                  }`}
                >
                  <StarIcon className="w-4 h-4" />
                  <span className="hidden sm:inline text-sm">
                    {selectedEmail?.starred ? "Unstar" : "Star"}
                  </span>
                </button>
              </div>
            </div>

            <div className="text-sm text-slate-400">Yesterday</div>
          </div>

          {/* message viewer */}
          <div className="mt-6 bg-white border border-slate-100 rounded p-6 min-h-[60vh]">
            {selectedEmail ? (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {selectedEmail.subject}
                    </h3>
                    <div className="text-sm text-slate-500 mt-2">
                      From:{" "}
                      <span className="font-medium text-[#212121]">
                        {selectedEmail.from}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 prose prose-slate">
                  <pre className="whitespace-pre-wrap font-sans text-[#212121] leading-relaxed">
                    {selectedEmail.body}
                  </pre>
                </div>
              </>
            ) : (
              <div className="text-slate-500">Select an email to view</div>
            )}
          </div>
        </div>
      </aside>

      {/* Compose bottom-right (no cc, no attachments) */}
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
            >
              <div className="px-4 py-3 bg-[#f8f8f8] flex items-center justify-between gap-2">
                <div className="font-medium">New message</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setComposeMinimized((s) => !s)}
                    className="p-1 rounded hover:bg-slate-100"
                    aria-label="minimize"
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
                  {composeDraft.subject || "New message"} —{" "}
                  <span className="text-slate-400">{composeDraft.to}</span>
                </div>
              ) : (
                <div className="p-4 flex flex-col gap-3 min-h-[240px]">
                  <input
                    value={composeDraft.to}
                    onChange={(e) =>
                      setComposeDraft((s) => ({ ...s, to: e.target.value }))
                    }
                    placeholder="To"
                    className="w-full border border-slate-100 rounded px-3 py-2 text-sm outline-none"
                  />
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
                  />
                  <textarea
                    value={composeDraft.body}
                    onChange={(e) =>
                      setComposeDraft((s) => ({ ...s, body: e.target.value }))
                    }
                    placeholder="Message..."
                    className="w-full min-h-[120px] border border-slate-100 rounded px-3 py-2 text-sm outline-none resize-none"
                  />
                  <div className="flex items-center justify-between gap-3">
                    <div />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={saveDraft}
                        className="px-3 py-2 rounded-md border hover:bg-slate-100 text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={sendCompose}
                        className="px-4 py-2 rounded-md bg-[#212121] text-white"
                      >
                        Send
                      </button>
                    </div>
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
    </div>
  );
}
