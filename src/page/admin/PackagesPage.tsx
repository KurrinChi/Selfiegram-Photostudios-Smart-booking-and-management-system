// src/page/admin/PackagesPage.tsx
import React from "react";
// Make sure the path is correct and the file exists
import AdminLayout from "../../components/AdminLayout.tsx";
import AdminPackageLayout from "../../components/AdminPackageLayout";

const AdminPackagesPage = () => {
  return (
    <AdminLayout>
      <AdminPackageLayout />
    </AdminLayout>
  );
};

export default AdminPackagesPage;
