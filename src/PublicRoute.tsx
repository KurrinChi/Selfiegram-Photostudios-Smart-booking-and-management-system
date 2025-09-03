import { Navigate } from "react-router-dom";

interface PublicRouteProps {
  children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");
  let userType = localStorage.getItem("userType") || "";
  userType = userType.replace(/"/g, "").trim();

  if (token) {
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

export default PublicRoute;
