import React, { useMemo, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faSearch } from "@fortawesome/free-solid-svg-icons";
import { Archive, RefreshCw } from "lucide-react";
import UserDetailPanel from "./UserDetailPanel";
import AssignRoleModal from "./ModalAssignRoleDialog.tsx";
import { fetchWithAuth } from "../utils/fetchWithAuth";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CenteredLoader from "./CenteredLoader";

interface Appointment {
  id: string;
  customerName: string;
  package: string;
  bookingDate: string;
  transactionDate: string;
  time: string;
  subtotal: number;
  balance: number;
  price: number;
  status: "Pending" | "Done" | "Cancelled";
  rating: number;
  feedback: string;
}

interface User {
  archive: number | string;
  id: string;
  profilePicture: string;
  name: string;
  email: string;
  username: string;
  age: number;
  birthday: string;
  address: string;
  contact: string;
  role: "Customer" | "Staff";
}

const roles = ["Customer", "Staff"] as const;
const API_URL = import.meta.env.VITE_API_URL;

const AdminUsersContent: React.FC = () => {
  const [activeRole, setActiveRole] = useState<(typeof roles)[number]>("Customer");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<User | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState<User | null>(null);
  const pageSize = 10;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false); // loading state for users

  // Fetch users on component mount
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(`${API_URL}/api/admin/users`);
        const rawData = await response.json();

        const mappedUsers: User[] = rawData.map((user: any) => ({
          id: user.userID.toString(),
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.userType,
          address: user.address,
          contact: user.contactNo,
          birthday: user.birthday,
          age: user.age,
          profilePicture: user.profilePicture,
          archive: Number(user.archive),
        }));

        setUsers(mappedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast.error("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    let byRole: User[] = [];

    if (activeRole === "Staff") {
      byRole = users.filter((u) => u.role === "Staff");
    } else {
      byRole = users.filter((u) => u.role === activeRole);
    }

    if (!query) return byRole;

    return byRole.filter(
      (u) =>
        u.id.includes(query) ||
        u.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [activeRole, query, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const [userAppointments, setUserAppointments] = useState<Record<string, Appointment[]>>({});
  const [appointmentLoading, setAppointmentLoading] = useState(false); // loading for appointments

  useEffect(() => {
    if (!selected) return;

    const fetchAppointments = async () => {
      setAppointmentLoading(true);
      try {
        const res = await fetchWithAuth(`${API_URL}/api/user-appointments/${selected.id}`);
        const data = await res.json();
        setUserAppointments((prev) => ({ ...prev, [selected.id]: data }));
      } catch (error) {
        console.error("Failed to fetch appointments:", error);
        toast.error("Failed to fetch appointments");
      } finally {
        setAppointmentLoading(false);
      }
    };

    fetchAppointments();
  }, [selected]);

  const confirmArchiveAction = async () => {
    if (!confirmArchive) return;

    try {
      const res = await fetchWithAuth(`${API_URL}/api/admin/users/${confirmArchive.id}/archive`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
        setUsers((prev) =>
          prev.map((usr) =>
            usr.id === confirmArchive.id ? { ...usr, archive: data.archive } : usr
          )
        );
      } else {
        toast.error("Failed to update archive status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating archive status");
    } finally {
      setConfirmArchive(null);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [activeRole, query]);

  useEffect(() => {
    return () => {
      setSelected(null);
    };
  }, []);

  return (
    <div className="relative flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-semibold pl-12 sm:pl-0">User Management</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-2 min-w-0">
        <div className="relative flex-shrink-0 flex gap-4 text-center px-2 text-sm font-medium overflow-visible">
          {roles.map((r) => (
            <button
              key={r}
              onClick={() => setActiveRole(r)}
              className={`pb-2 transition-colors ${activeRole === r
                ? "text-black underline underline-offset-4 decoration-2 decoration-black"
                : "text-gray-500 hover:text-black"
                }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            className="px-3 py-1.5 text-xs bg-gray-300 rounded-md hover:bg-gray-600 hover:text-white transition-colors"
            onClick={() => setShowAssignModal(true)}
          >
            + Add Staff
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
      <div className="relative overflow-x-auto overflow-y-auto h-[calc(90vh-160px)] rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm text-gray-500">
            <CenteredLoader message="Loading users..." />
          </div>
        ) : (
          <table className="min-w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email Address</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium text-right"></th>
              </tr>
            </thead>
            <tbody>
              {current.map((u) => (
                <tr key={u.id} className="border-t hover:bg-gray-100 transition">
                  <td className="px-4 py-3 whitespace-nowrap">{u.id}</td>
                  <td className="px-4 py-3">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">{u.role}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      className="px-2 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                      onClick={() => setSelected(u)}
                    >
                      <FontAwesomeIcon icon={faEye} /> View
                    </button>
                    <button
                      className={`px-2 py-1 text-xs rounded-md transition ${u.archive === 0
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-red-500 text-white hover:bg-red-600"
                        }`}
                      onClick={() => setConfirmArchive(u)}
                    >
                      {u.archive === 0 ? "Unarchive" : "Archive"}
                    </button>
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
        )}
      </div>

      {confirmArchive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center space-y-4">
            <div
              className={`mx-auto w-12 h-12 flex items-center justify-center rounded-full ${confirmArchive.archive === 1 ? "bg-red-100" : "bg-green-100"
                }`}
            >
              {confirmArchive.archive === 1 ? (
                <Archive className="text-red-600" />
              ) : (
                <RefreshCw className="text-green-600" />
              )}
            </div>
            <h2 className="text-lg font-semibold">
              {confirmArchive.archive === 1 ? "Archive User" : "Unarchive User"}
            </h2>
            <p className="text-sm text-gray-600">
              {confirmArchive.archive === 1
                ? "Are you sure you want to archive"
                : "Are you sure you want to unarchive"}{" "}
              <span className="font-semibold">{confirmArchive.name}</span>?
            </p>
            <div className="flex justify-between gap-4 pt-4">
              <button
                onClick={() => setConfirmArchive(null)}
                className="w-full py-2 border rounded-md text-sm hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmArchiveAction}
                className={`w-full py-2 text-white text-sm rounded-md ${confirmArchive.archive === 1
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
                  }`}
              >
                {confirmArchive.archive === 1 ? "Archive" : "Unarchive"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination fixed at bottom */}
      <div className="flex justify-end items-center gap-2 px-4 py-3">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
        >
          &lt;
        </button>
        <div className="text-xs text-gray-600">
          {page} / {totalPages}
        </div>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 transition disabled:opacity-50"
        >
          &gt;
        </button>
      </div>

      {selected && (
        <UserDetailPanel
          key={selected.id}
          isOpen={true}
          user={{
            profilePicture: selected.profilePicture,
            name: selected.name,
            username: selected.username,
            age: selected.age,
            birthday: selected.birthday,
            address: selected.address,
            email: selected.email,
            contact: selected.contact,
            appointments: userAppointments[selected.id] || [],
          }}
          onClose={() => setSelected(null)}
          loading={appointmentLoading}
        />
      )}

      {showAssignModal && (
        <AssignRoleModal isOpen={true} onClose={() => setShowAssignModal(false)} />
      )}
    </div>
  );
};

export default AdminUsersContent;
