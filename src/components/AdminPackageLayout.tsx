// src/components/admin/AdminPackageLayout.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminPackageContent from "./AdminPackageContent";
import AddPackage from "./Packages/add.tsx";
import EditPackage from "./Packages/edit.tsx";
import SelectPackage from "./Packages/select.tsx";

const AdminPackageLayout = () => {
  return (
    <Routes>
      <Route index element={<AdminPackageContent />} />
      <Route path="add" element={<AddPackage />} />
      <Route path="edit/:id" element={<EditPackage />} />
      <Route path="select/:id" element={<SelectPackage />} />
    </Routes>
  );
};

export default AdminPackageLayout;
