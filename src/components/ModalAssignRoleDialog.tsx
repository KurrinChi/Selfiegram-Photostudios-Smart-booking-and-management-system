import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, UserPlus, Trash2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: "Admin" | "Staff";
  active: boolean;
}

const mockUsers: User[] = [
  {
    id: "1",
    name: "Candice Wu",
    username: "candice",
    avatar: "https://i.pravatar.cc/150?img=1",
    role: "Admin",
    active: true,
  },
  {
    id: "2",
    name: "Demi Wilkinson",
    username: "demi",
    avatar: "https://i.pravatar.cc/150?img=2",
    role: "Staff",
    active: false,
  },
  {
    id: "3",
    name: "Drew Cano",
    username: "drew",
    avatar: "https://i.pravatar.cc/150?img=3",
    role: "Staff",
    active: true,
  },
  {
    id: "4",
    name: "Natali Crag",
    username: "natali",
    avatar: "https://i.pravatar.cc/150?img=4",
    role: "Staff",
    active: true,
  },
];

const AssignRoleModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [team, setTeam] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [suggested, setSuggested] = useState<User[]>([]);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<null | User>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTeam(mockUsers);
    }
  }, [isOpen]);

  useEffect(() => {
    const timeout = setTimeout(() => setToast(false), 3000);
    return () => clearTimeout(timeout);
  }, [toast]);

  const handleRoleChange = (
    userId: string,
    newRole: User["role"] | "Remove"
  ) => {
    if (newRole === "Remove") {
      const user = team.find((u) => u.id === userId);
      setShowRemoveConfirm(user || null);
      return;
    }
    setTeam((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const handleRemove = () => {
    if (!showRemoveConfirm) return;
    setTeam((prev) => prev.filter((u) => u.id !== showRemoveConfirm.id));
    setShowRemoveConfirm(null);
  };

  const handleAdd = () => {
    const user: User = {
      id: (Math.random() * 1000).toString(),
      name: search,
      username: search.toLowerCase().replace(/\s+/g, ""),
      avatar: `https://i.pravatar.cc/150?u=${search}`,
      role: "Staff",
      active: true,
    };
    setTeam((prev) => [...prev, user]);
    setSearch("");
  };

  const handleClose = () => {
    setToast(true);
    setTimeout(() => {
      onClose();
    }, 500); // give time for animation or toast to show
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="assign-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg w-full max-w-lg mx-4 p-6 shadow-lg relative"
          >
            <div className="text-center mb-4">
              <img src="/slfg.svg" alt="logo" className="mx-auto h-10" />
              <h2 className="text-xl font-semibold mt-2">Assign Role</h2>
              <p className="text-sm text-gray-500">
                Enhance your team by incorporating additional personnel,
                assigning them roles as staff or administrators for Selfiegram
                Photostudios.
              </p>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {team.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-3 rounded-md border ${
                    !user.active ? "opacity-50 bg-gray-100" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={user.active}
                      onChange={() =>
                        setTeam((prev) =>
                          prev.map((u) =>
                            u.id === user.id ? { ...u, active: !u.active } : u
                          )
                        )
                      }
                    />
                    <img
                      src={user.avatar}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-sm">{user.name}</p>
                      <p className="text-xs text-gray-400">@{user.username}</p>
                    </div>
                  </div>
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user.id, e.target.value as any)
                    }
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option>Admin</option>
                    <option>Staff</option>
                    <option value="Remove">Remove</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="text-xs text-gray-600 mb-1 block">
                Team member
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border px-3 py-2 rounded-md text-sm"
                  placeholder="Select Account"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  onClick={handleAdd}
                  className="px-3 py-2 bg-black text-white text-sm rounded-md hover:opacity-80 flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleClose}
                className="px-6 py-2 rounded-md bg-black text-white text-sm hover:opacity-80"
              >
                Close
              </button>
            </div>

            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow"
              >
                ✅ Team updated successfully!
              </motion.div>
            )}
          </motion.div>

          {/* Remove Confirmation Modal */}
          <AnimatePresence>
            {showRemoveConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex justify-center items-center"
              >
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.9 }}
                  className="bg-white rounded-md p-6 w-80 text-center"
                >
                  <Trash2 className="mx-auto text-red-500 w-8 h-8 mb-3" />
                  <p className="text-sm mb-4">
                    Are you sure you want to remove{" "}
                    <strong>{showRemoveConfirm.name}</strong>? This action is{" "}
                    <span className="text-red-500 font-semibold">
                      irreversible
                    </span>
                    .
                  </p>
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setShowRemoveConfirm(null)}
                      className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemove}
                      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AssignRoleModal;
