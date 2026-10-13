import { z } from "zod";
const photo = z
  .string()
  .max(260000)
  .refine((value) => {
    if (/^\/api\/photos\/[a-z0-9]+$/.test(value)) return true;
    if (/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(value)) return true;
    try {
      return new URL(value).protocol === "https:";
    } catch {
      return false;
    }
  }, "Use an HTTPS image URL or a compressed JPEG, PNG or WebP photo");
export const listingSchema = z.object({
  name: z.string().trim().min(3).max(100),
  make: z.string().trim().min(2).max(50),
  year: z
    .number()
    .int()
    .min(1950)
    .max(new Date().getFullYear() + 1),
  price: z.number().int().min(1000).max(10000000),
  km: z.number().int().min(0).max(2000000),
  fuel: z.number().min(0).max(40),
  fuelType: z.enum(["Petrol", "Diesel", "Hybrid", "Electric"]),
  transmission: z.enum(["Automatic", "Manual"]),
  bodyType: z.enum(["Sedan", "Hatchback", "SUV", "Bakkie", "Coupe", "Other"]),
  images: z
    .array(photo)
    .min(1)
    .max(6)
    .refine((photos) => photos.join("").length < 1000000, "Photos must total less than 1 MB"),
  location: z.string().trim().min(2).max(100),
  sellerType: z.enum(["PRIVATE", "DEALER"]),
  sellerName: z.string().trim().min(2).max(100),
  description: z.string().trim().min(30).max(5000),
  status: z.enum(["DRAFT", "PUBLISHED", "SOLD", "ARCHIVED"]),
});
export const enquirySchema = z.object({
  message: z.string().trim().min(10).max(2000),
  consent: z.literal(true),
});
