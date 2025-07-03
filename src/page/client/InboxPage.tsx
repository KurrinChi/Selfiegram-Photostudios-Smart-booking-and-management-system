// page/client/HomePage.tsx
import ClientLayout from "../../components/ClientLayout.tsx";
import ClientInboxPageContent from "../../components/ClientInboxPageContent.tsx";

const ClientHomePage = () => {
  return (
    <ClientLayout>
      <ClientInboxPageContent />
    </ClientLayout>
  );
};

export default ClientHomePage;
