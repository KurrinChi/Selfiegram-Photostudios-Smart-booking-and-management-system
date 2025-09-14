export type SelectedAddon = {
  id: string;
  label: string;
  price: number;   // unit price
  value: number;   // quantity or 1/0 toggle
   type: "spinner" | "checkbox" | "dropdown";
  option?: string;     // for dropdown
};