import { z } from "zod";

export const ocrSchema = z
  .object({
    country_code: z.string().optional(),
    date_of_birth: z.string().optional(),
    date_of_expiry: z.string().optional(),
    date_of_issue: z.string().optional(),
    address: z.string().optional(),
    doc_type: z.string().optional(),
    gender: z.string().optional(),
    given_name: z.string().optional(),
    issuing_country: z.string().optional(),
    last_name: z.string().optional(),
    nationality: z.string().optional(),
    passport_number: z.string().optional(),
    passport_type: z.string().optional(),
    place_of_birth: z.string().optional(),
    place_of_issue: z.string().optional(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    passport_no: z.string().optional(),
  })
  .loose();

export const uploadedDocumentImageSchema = z
  .object({
    is_valid: z.boolean().optional(),
    doc_identifier: z.string(),
    file_thumbnail: z.string(),
    file: z.string(),
    mime_type: z.string(),
    file_name: z.string(),
    confidence: z.number(),
    ocr: ocrSchema.optional(),
    file_type: z.string().optional(),
    original_file_name: z.string(),
  })
  .loose();

export const uploadedDocumentFilesSchema = z.array(uploadedDocumentImageSchema);

export const insuranceCoverageSchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
});

export const insuranceDescSchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
});

export const insuranceDetailsSchema = z.object({
  visaero_insurance_fees: z.string().optional(),
  visaero_service_fees: z.string().optional(),
  insurance_type: z.string().optional(),
  insurance_type_id: z.string().optional(),
  insurance_title: z.string().optional(),
  insurance_coverage: z.array(insuranceCoverageSchema).optional(),
  insurance_desc: z.array(insuranceDescSchema).optional(),
});

export const createApplicationPayloadSchema = z.object({
  documentsArray: uploadedDocumentFilesSchema,
  nationality: z.string(),
  origin: z.string(),
  travelling_to: z.string(),
  travelling_to_country: z.string(),
  travelling_to_identity: z.string(),
  journey_start_date: z.string(),
  journey_end_date: z.string(),
  user_type: z.string(),
  application_created_by_user: z.string().nullable(),
  visa_id: z.string(),
  visa_code: z.string(),
  duration_type: z.string(),
  visa_category: z.string(),
  visa_fees: z.any(), // Replace with VisaFees schema if defined elsewhere
  visa_entry_type: z.string(),
  visa_processing_type: z.string(),
  visa_type_display_name: z.string(),
  is_visaero_insurance_bundled: z.boolean(),
  insurance_details: insuranceDetailsSchema.optional(),
  base_currency_symbol: z.string(),
  is_with_insurance: z.string(),
  total_days: z.string(),
  visa_type: z.string(),
  currency: z.string(),
  platform: z.string(),
  raff_applicants: z.array(z.string()).optional(),
  application_type: z.string().optional(),
  evm_request_id: z.string().optional(),
});

export type CreateApplicationPayload = z.infer<
  typeof createApplicationPayloadSchema
>;

export const searchRaffApplicationPayloadSchema = z.object({
  search_text: z.string(),
});
