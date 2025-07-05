import { Outlet } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout.tsx";

const AdminPackagesPage = () => {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
};

export default AdminPackagesPage;
