// pages/EditPackagePage.tsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

// Reuse AddPage structure
const EditPage = () => {
  const { id } = useParams();
  const [pkg, setPkg] = useState<any>(null);

  useEffect(() => {
    // Simulate fetch
    const fetched = mockPackages[parseInt(id ?? "0")]; // replace with real fetch
    setPkg(fetched);
  }, [id]);

  if (!pkg) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Edit Package: {pkg.title}</h2>
      {/* You can copy form from AddPage and prefill fields here */}
    </div>
  );
};

export default EditPage;
