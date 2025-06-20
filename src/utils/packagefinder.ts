// utils/packageFinder.ts
type Package = { title: string; [key: string]: any };

export const mockPackages: Package[] = [
  /* your full array here */
];

export const findPackageByTitle = (title: string) => {
  return mockPackages.find(
    (p) => p.title.toLowerCase() === decodeURIComponent(title).toLowerCase()
  );
};
