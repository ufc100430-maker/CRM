/**
 * Zod-схеми для валідації API запитів.
 */
import { z } from 'zod';

export const TelegramAuthRequestSchema = z.object({
  initData: z.string().min(10),
});

export const CreateStoreSchema = z.object({
  name: z.string().min(2).max(100),
  address: z.string().min(5).max(200),
  phone: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  geofenceM: z.number().int().positive().default(200),
  workStart: z.string().regex(/^\d{2}:\d{2}$/).default('09:00'),
  workEnd: z.string().regex(/^\d{2}:\d{2}$/).default('21:00'),
  directorId: z.string().cuid().optional(),
});

export const CreateUserSchema = z.object({
  telegramUsername: z.string().regex(/^@?[a-zA-Z0-9_]{5,32}$/).transform((v) => v.replace(/^@/, '')),
  fullName: z.string().min(2).max(100),
  phone: z.string().optional(),
  role: z.enum(['SELLER', 'DIRECTOR', 'OWNER', 'ADMIN', 'REGIONAL_MANAGER', 'ACCOUNTANT', 'SERVICE_ENGINEER']),
  storeId: z.string().cuid().optional(),
});

export const CreateProductSchema = z.object({
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  color: z.string().optional(),
  memory: z.string().optional(),
  sku: z.string().optional(),
  basePrice: z.number().positive(),
  minPrice: z.number().positive(),
  category: z.enum([
    'SMARTPHONE',
    'TABLET',
    'CASE',
    'GLASS',
    'CHARGER',
    'HEADPHONES',
    'POWER_BANK',
    'CABLE',
    'OTHER',
  ]),
  hasImei: z.boolean().default(false),
});

export const CreateSaleSchema = z.object({
  storeId: z.string().cuid(),
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'MIXED', 'CREDIT', 'BANK_TRANSFER']),
  paymentDetails: z.record(z.string(), z.number()).optional(),
  warrantyMonths: z.number().int().optional(),
  comment: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().cuid(),
        stockItemId: z.string().cuid().optional(),
        quantity: z.number().int().positive().default(1),
        unitPrice: z.number().positive(),
        discount: z.number().nonnegative().default(0),
      }),
    )
    .min(1),
});

export type CreateStoreInput = z.infer<typeof CreateStoreSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type CreateSaleInput = z.infer<typeof CreateSaleSchema>;
