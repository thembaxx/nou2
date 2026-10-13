export type Vehicle = {
  id: string;
  name: string;
  make: string;
  year: number;
  price: number;
  km: number;
  fuel: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  images: string[];
  location: string;
  sellerType: "PRIVATE" | "DEALER";
  sellerName: string;
  description: string;
  status: string;
  example: boolean;
};
