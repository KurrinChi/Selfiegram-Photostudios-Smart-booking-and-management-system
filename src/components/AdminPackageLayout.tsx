// src/components/admin/AdminPackageLayout.tsx
//import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminPackageContent from "./AdminPackageContent";
import AddPackage from "./Packages/add.tsx";
import EditPackage from "./Packages/edit.tsx";

const AdminPackageLayout = () => {
  return (
    <Routes>
      <Route index element={<AdminPackageContent />} />
      <Route path="add" element={<AddPackage />} />
      <Route path="edit/:id" element={<EditPackage />} />
    </Routes>
  );
};

export default AdminPackageLayout;
