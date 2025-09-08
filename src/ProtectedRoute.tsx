import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  let userType = localStorage.getItem("userType") || "";
  userType = userType.replace(/"/g, "").trim();
  console.log("token:", token, "userType:", userType, "allowedRoles:", allowedRoles);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  // checker of role for redirect
  if (allowedRoles && !allowedRoles.includes(userType || "")) {
    // redirect based on userType
    switch (userType) {
      case "Admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "Staff":
        return <Navigate to="/staff/dashboard" replace />;
      case "Customer":
        return <Navigate to="/client/home" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
