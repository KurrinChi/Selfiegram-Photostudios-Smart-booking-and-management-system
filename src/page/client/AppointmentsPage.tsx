// page/client/HomePage.tsx
import ClientLayout from "../../components/ClientLayout.tsx";
import ClientAppointmentsPageContent from "../../components/ClientappointmentspageContent.tsx";

const ClientHomePage = () => {
  return (
    <ClientLayout>
      <ClientAppointmentsPageContent />
    </ClientLayout>
  );
};

export default ClientHomePage;
