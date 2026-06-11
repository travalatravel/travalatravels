import { z } from "zod";

export const WALLET_BACKUP_VERSION = 1;

export const WALLET_CURRENCIES = ["BTC", "ETH", "USDC", "USDT", "SOL", "LTC"] as const;

export const walletBackupEntrySchema = z.object({
  currency: z.enum(WALLET_CURRENCIES),
  label: z.string().min(2),
  address: z.string().min(10),
  network: z.string().min(2),
  isActive: z.boolean().default(true),
});

export const walletBackupFileSchema = z.object({
  version: z.literal(WALLET_BACKUP_VERSION),
  exportedAt: z.string().optional(),
  wallets: z.array(walletBackupEntrySchema).min(1),
});

export type WalletBackupEntry = z.infer<typeof walletBackupEntrySchema>;
export type WalletBackupFile = z.infer<typeof walletBackupFileSchema>;

export function walletBackupFilename() {
  const stamp = new Date().toISOString().slice(0, 10);
  return `travala-wallets-${stamp}.json`;
}
