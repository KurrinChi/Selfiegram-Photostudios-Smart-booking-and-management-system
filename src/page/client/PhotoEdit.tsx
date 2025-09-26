// page/client/PhotoEdit.tsx
import ClientLayout from "../../components/ClientLayout";
import { Outlet } from "react-router-dom";

const PhotoEdit = () => {
  return (
    <ClientLayout>
      <Outlet />
    </ClientLayout>
  );
};

export default PhotoEdit;
