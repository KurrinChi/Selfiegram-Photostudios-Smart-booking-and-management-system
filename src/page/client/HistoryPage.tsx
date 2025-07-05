// page/client/HomePage.tsx
import ClientLayout from "../../components/ClientLayout.tsx";
import ClientHistoryPageContent from "../../components/ClientHistoryPageContent.tsx";

const ClientHomePage = () => {
  return (
    <ClientLayout>
      <ClientHistoryPageContent />
    </ClientLayout>
  );
};

export default ClientHomePage;
