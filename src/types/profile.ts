import { z } from "zod";

// Essential Profile Data
export const essentialProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().min(2),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  phone_number: z.string().optional(),
  preferred_language: z.string().default("en"),
  timezone: z.string().default("UTC"),
});

// Health-Related Data (Special Category)
export const healthDataSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  date_of_birth: z.string().datetime().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  medical_conditions: z.union([z.string(), z.array(z.string())]).optional(),
  allergies: z.union([z.string(), z.array(z.string())]).optional(),
  medications: z.union([z.string(), z.array(z.string())]).optional(),
  fitness_goals: z.array(z.string()).optional(),
  activity_level: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "VERY_ACTIVE", "EXTRA_ACTIVE"]).optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  encrypted: z.boolean().default(true),
});

// Consent Records
export const consentPurpose = z.enum([
  "ESSENTIAL_DATA_PROCESSING",
  "HEALTH_DATA_PROCESSING",
  "MARKETING_COMMUNICATIONS",
  "THIRD_PARTY_SHARING",
  "ANALYTICS",
  "PERSONALIZATION",
]);

export const consentRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  purpose: consentPurpose,
  granted: z.boolean(),
  timestamp: z.string().datetime(),
  ip_address: z.string(),
  user_agent: z.string(),
  valid_until: z.string().datetime().optional(),
  revoked_at: z.string().datetime().optional(),
  version: z.string(),
});

// Data Processing Logs
export const dataAccessType = z.enum([
  "READ",
  "WRITE",
  "UPDATE",
  "DELETE",
  "EXPORT",
  "SHARE",
]);

export const processingLogSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  access_type: dataAccessType,
  data_category: z.enum(["ESSENTIAL", "HEALTH", "CONSENT"]),
  purpose: z.string(),
  processor: z.string(),
  success: z.boolean(),
  details: z.string().optional(),
  ip_address: z.string(),
});

// Privacy Settings
export const privacySettingsSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  data_retention_period: z.number().default(730), // days
  marketing_preferences: z.object({
    email: z.boolean().default(false),
    push: z.boolean().default(false),
    in_app: z.boolean().default(true),
  }),
  data_sharing_preferences: z.object({
    share_health_data: z.boolean().default(false),
    share_activity_data: z.boolean().default(true),
    share_achievements: z.boolean().default(true),
  }),
  two_factor_auth_enabled: z.boolean().default(false),
  updated_at: z.string().datetime(),
});

// Export Types
export type EssentialProfile = z.infer<typeof essentialProfileSchema>;
export type HealthData = z.infer<typeof healthDataSchema>;
export type ConsentRecord = z.infer<typeof consentRecordSchema>;
export type ProcessingLog = z.infer<typeof processingLogSchema>;
export type PrivacySettings = z.infer<typeof privacySettingsSchema>;
export type ConsentPurpose = z.infer<typeof consentPurpose>;
export type DataAccessType = z.infer<typeof dataAccessType>;

// Helper type for encrypted health data
export interface EncryptedHealthData extends Omit<HealthData, 'medical_conditions' | 'allergies' | 'medications'> {
  medical_conditions?: string;
  allergies?: string;
  medications?: string;
}

// Helper type for decrypted health data
export interface DecryptedHealthData extends Omit<HealthData, 'medical_conditions' | 'allergies' | 'medications'> {
  medical_conditions?: string[];
  allergies?: string[];
  medications?: string[];
}
