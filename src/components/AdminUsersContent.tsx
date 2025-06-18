// components/UserManagement.tsx
import React, { useMemo, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faSearch } from "@fortawesome/free-solid-svg-icons";
import { AnimatePresence, motion } from "framer-motion";
import UserDetailPanel from "./UserDetailPanel";

// Types & Mock Data
interface Appointment {
  id: string;
  package: string;
  date: string;
  time: string;
  status: "Pending" | "Done";
  rating: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: "Customer" | "Staff" | "Admin";
}

const roles = ["Customer", "Staff", "Admin"] as const;

const mockUsers: User[] = Array.from({ length: 55 }, (_, i) => ({
  id: `202412${i.toString().padStart(3, "0")}`,
  name: "Ian Conception",
  email: "ian_concep27@gmail.com",
  role: "Customer",
}));

const mockAppointments: Appointment[] = [
  {
    id: "APT-001",
    package: "Graduation Package",
    date: "2024-06-01",
    time: "10:00 AM",
    status: "Done",
    rating: 5,
  },
  {
    id: "APT-002",
    package: "Prenup Package",
    date: "2024-06-10",
    time: "3:00 PM",
    status: "Pending",
    rating: 0,
  },
  {
    id: "APT-003",
    package: "Wedding Package",
    date: "2024-06-15",
    time: "1:00 PM",
    status: "Done",
    rating: 4,
  },
];

// Main Component
const AdminUsersContent: React.FC = () => {
  const [activeRole, setActiveRole] = useState<(typeof roles)[number]>("Customer");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<User | null>(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const byRole = mockUsers.filter((u) => u.role === activeRole);
    if (!query) return byRole;
    return byRole.filter(
      (u) =>
        u.id.includes(query) ||
        u.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [activeRole, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  return (
    <div className="relative flex flex-col gap-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">User Management</h1>
        <button className="px-4 py-2 bg-black text-white text-xs rounded-md hover:opacity-80 transition">
          Export Data
        </button>
      </div>

      {/* Tabs + Controls in a single row */}
      <div className="flex flex-wrap items-center justify-between gap-4 min-w-0">
        {/* Tabs */}
        <div className="relative flex-shrink-0 flex gap-8 text-sm font-medium border-b border-gray-300 overflow-visible">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRole(r)}
              className={`pb-2 transition-colors ${
                activeRole === r ? "text-black" : "text-gray-500 hover:text-black"
              }`}
            >
              {r}
            </button>
          ))}
          <motion.div
            layoutId="tab-indicator"
            className="absolute bottom-0 h-0.5 bg-black rounded-full"
            initial={false}
            animate={{
              width: "33.333%",
              x: `${roles.indexOf(activeRole) * 100}%`,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ left: 0 }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button className="px-3 py-1.5 text-xs bg-gray-300 rounded-md hover:bg-gray-600  hover:text-white transition-colors">
            + Assign Role
          </button>
          <div className="relative w-64">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full pl-8 pr-3 py-2 text-xs border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="relative overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">ID</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email Address</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium text-right">View</th>
            </tr>
          </thead>
          <tbody>
            {current.map((u) => (
              <tr
                key={u.id}
                className="border-t hover:bg-gray-100 transition cursor-pointer"
                onClick={() => setSelected(u)}
              >
                <td className="px-4 py-3 whitespace-nowrap">{u.id}</td>
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.email}</td>
                <td className="px-4 py-3">{u.role}</td>
                <td className="px-4 py-3 text-right">
                  <FontAwesomeIcon icon={faChevronRight} />
                </td>
              </tr>
            ))}
            {current.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-end gap-2 text-xs">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-2 py-1 border rounded disabled:opacity-30"
        >
          Prev
        </button>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-2 py-1 rounded ${
              page === i + 1 ? "bg-black text-white" : "border"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-2 py-1 border rounded disabled:opacity-30"
        >
          Next
        </button>
      </div>

      {/* Details Panel */}
      <AnimatePresence>
        {selected && (
          <UserDetailPanel
            key={selected.id}
            isOpen={true}
            user={{
              name: selected.name,
              username: selected.name.toLowerCase().replace(/\s+/g, "_"),
              age: 25,
              birthday: "1999-01-01",
              address: "123 Main St, City",
              email: selected.email,
              contact: "09123456789",
              appointments: mockAppointments,
            }}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsersContent;
