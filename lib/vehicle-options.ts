export const BODY_TYPES = [
  "Hatchback",
  "Sedan",
  "SUV",
  "Bakkie",
  "Coupe",
  "Convertible",
  "Wagon",
  "MPV",
  "Van",
  "Other",
] as const;
export const FUEL_TYPES = [
  "Petrol",
  "Diesel",
  "Hybrid",
  "Plug-in Hybrid",
  "Electric",
  "Hydrogen",
  "Other",
] as const;
export const TRANSMISSIONS = ["Automatic", "Manual", "Other"] as const;
export const MAKES = [
  "Audi",
  "BAIC",
  "Bentley",
  "BMW",
  "BYD",
  "Chery",
  "Citroën",
  "Ferrari",
  "Fiat",
  "Ford",
  "GAC",
  "GWM",
  "Haval",
  "Honda",
  "Hyundai",
  "Isuzu",
  "JAC",
  "Jaecoo",
  "Jeep",
  "Jetour",
  "Kia",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Mahindra",
  "Mazda",
  "Mercedes-Benz",
  "MG",
  "MINI",
  "Mitsubishi",
  "Nissan",
  "Omoda",
  "Opel",
  "Peugeot",
  "Porsche",
  "Renault",
  "Rolls-Royce",
  "Subaru",
  "Suzuki",
  "Toyota",
  "Volkswagen",
  "Volvo",
] as const;
export function energyUnit(fuelType: string) {
  return fuelType === "Electric"
    ? "kWh"
    : fuelType === "Hydrogen"
      ? "kg"
      : fuelType === "Other"
        ? "unit"
        : "L";
}
export function planningConsumption(vehicle?: { fuelType: string; fuel: number }) {
  return vehicle?.fuelType === "Plug-in Hybrid" ? 7 : vehicle?.fuel || 7;
}
export function planningEnergyPrice(fuelType?: string) {
  return fuelType === "Electric"
    ? 4
    : fuelType === "Hydrogen"
      ? 120
      : fuelType === "Diesel"
        ? 23
        : 24;
}
