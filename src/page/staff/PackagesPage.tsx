import StaffLayout from "../../components/StaffLayout.tsx";
import { Outlet } from "react-router-dom";

const PackagesPage = () => (
  <StaffLayout>
    <Outlet />
  </StaffLayout>
);

export default PackagesPage;
