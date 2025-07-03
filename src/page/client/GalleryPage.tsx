// page/client/HomePage.tsx
import ClientLayout from "../../components/ClientLayout.tsx";
import ClientGalleryPageContent from "../../components/ClientGalleryPageContent.tsx";

const ClientHomePage = () => {
  return (
    <ClientLayout>
      <ClientGalleryPageContent />
    </ClientLayout>
  );
};

export default ClientHomePage;
