import { z } from "zod";

export const countryRegionSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  iso2: z.string(),
  iso3: z.string(),
  image: z.string().url().optional(),
  is_region: z.boolean().optional(),
});

export const getEsimOffersPayloadSchema = z.object({
  selected_country_region: countryRegionSchema,
  nationality: countryRegionSchema,
});

export const userPersonalDetailSchema = z.object({
  first_name: z.string().min(3),
  last_name: z.string().min(3),
  email: z.string().email(),
  phone_number: z
    .string()
    .min(8)
    .max(15)
    .regex(/^\+?[0-9]{8,15}$/),
  address: z.string().min(5),
});

// export const fileSchema =
//   typeof File === "undefined"
//     ? z.unknown()
//     : z.custom<File>((value): value is File => value instanceof File, {
//         message: "Please upload a valid file",
//       });

export const createApplicationSchema = z.object({
  packages: z.array(z.unknown()).min(1),
  nationality: z.string(),
  nationality_data: countryRegionSchema,
  destination_data: countryRegionSchema,
  nationality_name: z.string(),
  destination_name: z.string(),
  journey_start_date: z.string(),
  journey_end_date: z.string(),
  destination: z.string(),
  is_destination_a_region: z.boolean(),
  is_kyc_required: z.boolean().optional(),
  passport: z.file().optional(),
  ...userPersonalDetailSchema.shape,
});

export const searchRaffApplicationPayloadSchema = z.object({
  search_text: z.string(),
});
