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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";


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

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

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

const handleExport = async () => {
  if (filtered.length === 0) {
    toast.warn(`No ${activeRole.toLowerCase()} data available to export.`);
    return;
  }

  setIsGeneratingReport(true);
  
  setTimeout(async () => {
    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // Monochrome color palette
      const primaryBlack: [number, number, number] = [33, 33, 33];
      const darkGray: [number, number, number] = [102, 102, 102];
      const mediumGray: [number, number, number] = [153, 153, 153];
      const lightGray: [number, number, number] = [245, 245, 245];
      const borderGray: [number, number, number] = [208, 208, 208];
      const white: [number, number, number] = [255, 255, 255];

      let yPosition = 18;
      const leftMargin = 20;
      const rightMargin = 190;
      const pageWidth = 210;
      const pageHeight = 297;

      // Helper function to load SVG as Image
      const loadSvgAsImage = (svgPath: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext("2d");
            
            if (ctx) {
              ctx.drawImage(img, 0, 0, 200, 200);
              const dataUrl = canvas.toDataURL("image/png");
              resolve(dataUrl);
            } else {
              reject(new Error("Could not get canvas context"));
            }
          };
          
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = svgPath;
        });
      };

      // ===== COMPACT HEADER SECTION =====
      pdf.setFillColor(...primaryBlack);
      pdf.rect(0, 0, pageWidth, 2, "F");

      yPosition = 12;

      // Load and add logo
      try {
        const logoDataUrl = await loadSvgAsImage("/slfg.svg");
        pdf.addImage(logoDataUrl, "PNG", leftMargin, yPosition, 18, 18);
      } catch (error) {
        console.error("Failed to load logo:", error);
        pdf.setDrawColor(...borderGray);
        pdf.setLineWidth(0.3);
        pdf.rect(leftMargin, yPosition, 18, 18);
        
        pdf.setTextColor(...mediumGray);
        pdf.setFontSize(6);
        pdf.text("LOGO", leftMargin + 6, yPosition + 10);
      }

      const textStartX = leftMargin + 22;

      pdf.setTextColor(...primaryBlack);
      pdf.setFontSize(18);
      pdf.text("SELFIGRAM PHOTOSTUDIOS", textStartX, yPosition + 6);

      pdf.setFontSize(8);
      pdf.setTextColor(...darkGray);
      pdf.text(
        "3rd Floor Kim Kar Building F Estrella St., Malolos, Philippines",
        textStartX,
        yPosition + 11
      );

      pdf.setFontSize(7);
      pdf.setTextColor(...mediumGray);
      pdf.text(
        "0968 885 6035  •  selfiegrammalolos@gmail.com",
        textStartX,
        yPosition + 15
      );

      yPosition += 22;

      pdf.setDrawColor(...primaryBlack);
      pdf.setLineWidth(0.8);
      pdf.line(leftMargin, yPosition, rightMargin, yPosition);

      yPosition += 10;

      // ===== REPORT HEADER =====
      pdf.setTextColor(...primaryBlack);
      pdf.setFontSize(16);
      pdf.text(`${activeRole.toUpperCase()} REPORT`, leftMargin, yPosition);

      const reportId = `RPT-${format(new Date(), "yyyyMMdd")}`;
      const idWidth = pdf.getTextWidth(reportId) + 8;
      pdf.setFillColor(...primaryBlack);
      pdf.rect(rightMargin - idWidth, yPosition - 5, idWidth, 7, "F");
      pdf.setTextColor(...white);
      pdf.setFontSize(7);
      pdf.text(reportId, rightMargin - idWidth + 4, yPosition - 1);

      yPosition += 7;

      pdf.setFontSize(8);
      pdf.setTextColor(...darkGray);
      const generatedLabel = "Generated:";
      const generatedLabelWidth = pdf.getTextWidth(generatedLabel);
      pdf.text(generatedLabel, leftMargin, yPosition);

      pdf.setTextColor(...primaryBlack);
      pdf.text(
        format(new Date(), "MMM dd, yyyy • h:mm a"),
        leftMargin + generatedLabelWidth + 2,
        yPosition
      );

      yPosition += 4;

      pdf.setTextColor(...darkGray);
      const recordsLabel = "Total Records:";
      const recordsLabelWidth = pdf.getTextWidth(recordsLabel);
      pdf.text(recordsLabel, leftMargin, yPosition);

      pdf.setTextColor(...primaryBlack);
      pdf.text(
        filtered.length.toString(),
        leftMargin + recordsLabelWidth + 2,
        yPosition
      );

      yPosition += 12;

      // ===== USER RECORDS SECTION =====
      pdf.setFillColor(...primaryBlack);
      pdf.rect(leftMargin - 4, yPosition - 3, 2, 5, "F");

      pdf.setTextColor(...primaryBlack);
      pdf.setFontSize(10);
      pdf.text(`${activeRole.toUpperCase()} RECORDS`, leftMargin + 2, yPosition);

      pdf.setDrawColor(...lightGray);
      pdf.setLineWidth(0.4);
      const titleWidth = pdf.getTextWidth(`${activeRole.toUpperCase()} RECORDS`);
      pdf.line(leftMargin + titleWidth + 5, yPosition - 1, rightMargin, yPosition - 1);

      yPosition += 7;

      // Table data
      const userData = filtered.map((u, i) => [
        (i + 1).toString(),
        u.name,
        u.email,
        u.role,
        u.contact || "N/A",
        u.address || "N/A",
      ]);

      // Enhanced table layout
      autoTable(pdf, {
        startY: yPosition,
        head: [["#", "Name", "Email", "Role", "Contact", "Address"]],
        body: userData,
        margin: { left: leftMargin, right: leftMargin },
        styles: {
          fontSize: 8,
          cellPadding: { top: 3.5, right: 3, bottom: 3.5, left: 3 },
          lineColor: borderGray,
          lineWidth: 0.2,
          valign: "middle",
        },
        headStyles: {
          fillColor: primaryBlack,
          textColor: white,
          fontSize: 8,
          fontStyle: "bold",
          halign: "center",
          cellPadding: { top: 4.5, right: 3, bottom: 4.5, left: 3 },
        },
        bodyStyles: {
          textColor: primaryBlack,
          fillColor: white,
          fontSize: 7.5,
        },
        columnStyles: {
          0: { 
            cellWidth: 10, 
            halign: "center",
            textColor: darkGray 
          },
          1: { 
            cellWidth: 35, 
            halign: "left",
            fontStyle: "bold",
            textColor: primaryBlack 
          },
          2: { 
            cellWidth: 45, 
            halign: "left",
            textColor: darkGray 
          },
          3: { 
            cellWidth: 20, 
            halign: "center",
            textColor: primaryBlack 
          },
          4: { 
            cellWidth: 28, 
            halign: "center",
            textColor: darkGray 
          },
          5: { 
            cellWidth: 32, 
            halign: "left",
            textColor: darkGray 
          },
        },
        alternateRowStyles: {
          fillColor: [252, 252, 252],
        },
      });

      yPosition = (pdf as any).lastAutoTable.finalY + 10;

      // ===== SUMMARY SECTION =====
      const checkPageBreak = () => {
        if (yPosition + 30 > pageHeight - 25) {
          pdf.addPage();
          yPosition = 18;
          return true;
        }
        return false;
      };

      checkPageBreak();

      pdf.setFillColor(...primaryBlack);
      pdf.rect(leftMargin - 4, yPosition - 3, 2, 5, "F");

      pdf.setTextColor(...primaryBlack);
      pdf.setFontSize(10);
      pdf.text("SUMMARY", leftMargin + 2, yPosition);

      pdf.setDrawColor(...lightGray);
      pdf.setLineWidth(0.4);
      pdf.line(leftMargin + 24, yPosition - 1, rightMargin, yPosition - 1);

      yPosition += 8;

      // Summary insights
      const insights = [
        `Total ${activeRole.toLowerCase()} accounts: ${filtered.length}`,
        `Report generated on: ${format(new Date(), "MMMM dd, yyyy")}`,
        `Database snapshot includes all active and inactive accounts`,
      ];

      pdf.setFontSize(8);
      pdf.setTextColor(...darkGray);

      insights.forEach((line) => {
        pdf.setFillColor(...primaryBlack);
        pdf.circle(leftMargin + 1.5, yPosition - 1.2, 0.7, "F");

        pdf.text(line, leftMargin + 5, yPosition);
        yPosition += 5;
      });

      // ===== FOOTER =====
      const footerY = pageHeight - 15;

      pdf.setDrawColor(...borderGray);
      pdf.setLineWidth(0.3);
      pdf.line(leftMargin, footerY - 7, rightMargin, footerY - 7);

      pdf.setTextColor(...mediumGray);
      pdf.setFontSize(6.5);
      pdf.text(
        "This report was automatically generated by Selfigram Photostudios Admin System",
        leftMargin,
        footerY - 3
      );

      pdf.setFontSize(6.5);
      pdf.text("© 2025 Selfigram Photostudios", leftMargin, footerY + 1);

      pdf.text("•", leftMargin + 46, footerY + 1);

      pdf.text("All Rights Reserved", leftMargin + 49, footerY + 1);

      pdf.text("•", leftMargin + 78, footerY + 1);

      pdf.setTextColor(...darkGray);
      const reportIdFull = `ID: RPT-${format(new Date(), "yyyyMMdd-HHmmss")}`;
      pdf.text(
        reportIdFull,
        rightMargin - pdf.getTextWidth(reportIdFull),
        footerY + 1
      );

      // Save file
      const timestamp = format(new Date(), "yyyyMMdd-HHmmss");
      pdf.save(`Selfigram-${activeRole}-Users-${timestamp}.pdf`);

      toast.success(`${activeRole} report exported successfully!`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate report.");
    } finally {
      setIsGeneratingReport(false);
    }
  }, 1000);
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

      {/* Export + Pagination Row */}
      <div className="flex justify-end items-center gap-4 px-4 py-4 border-t border-gray-200">
        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
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
        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={isGeneratingReport}
          className={`px-5 py-2 rounded-md text-xs font-semibold transition focus:outline-none flex items-center gap-2 ${isGeneratingReport
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-black text-white hover:bg-gray-800 hover:scale-[1.02]"
            }`}
        >
          {isGeneratingReport && (
            <svg
              className="animate-spin h-3 w-3 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          )}
          {isGeneratingReport ? "Generating PDF..." : "Export Data"}
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
