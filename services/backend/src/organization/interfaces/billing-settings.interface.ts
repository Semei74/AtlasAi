export interface BillingSettings {
  readonly enabledProviders: readonly string[];
  readonly defaultCurrency: string;
  readonly billingEmail: string | null;
  readonly invoicePrefix: string | null;
  readonly taxId: string | null;
  readonly paymentTermsDays: number;
  readonly autoInvoicing: boolean;
  readonly currency: Record<string, never>;
}
