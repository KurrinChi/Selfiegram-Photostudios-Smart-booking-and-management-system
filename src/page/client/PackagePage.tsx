// page/client/PackagePage.tsx
import ClientLayout from "../../components/ClientLayout";
import { Outlet } from "react-router-dom";

const ClientPackagePage = () => {
  return (
    <ClientLayout>
      <Outlet />
    </ClientLayout>
  );
};

export default ClientPackagePage;
