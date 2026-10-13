export type Vehicle = {
  id: string;
  condition: "NEW" | "USED";
  reference?: {
    url: string;
    checkedAt: string;
    range: string;
    seats: number;
    consumptionAvailable: boolean;
  };
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
