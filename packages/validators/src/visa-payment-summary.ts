import { z } from "zod";

export const groupMembershipSchema = z.object({
  applicant_id: z.string(),
  name: z.string().optional(),
  relation: z.string().optional(),
  head_of_family: z.string().optional(),
  HOF_id: z.string().optional(),
  no_of_applicants: z.number().optional(),
});

export const updateGroupMembershipSchema = z.object({
  application_id: z.string(),
  group_membership: z.array(groupMembershipSchema),
  workflow: z.string().optional(),
});
