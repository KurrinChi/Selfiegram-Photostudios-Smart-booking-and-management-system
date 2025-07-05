// page/client/HomePage.tsx
import ClientLayout from "../../components/ClientLayout.tsx";
import ClientFavoritePageContent from "../../components/ClientFavoritePageContent.tsx";

const ClientHomePage = () => {
  return (
    <ClientLayout>
      <ClientFavoritePageContent />
    </ClientLayout>
  );
};

export default ClientHomePage;
