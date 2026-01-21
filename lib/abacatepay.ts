import { env } from "@/lib/env";

const ABACATEPAY_BASE_URL = env.ABACATEPAY_BASE_URL ?? "https://api.abacatepay.com/v1";

type AbacatePayResponse<T> = {
  data: T;
  error: string | null;
};

type AbacatePayCustomer = {
  id: string;
  metadata: {
    name: string;
    cellphone: string;
    email: string;
    taxId: string;
  };
};

export type AbacatePayCustomerInput = {
  name: string;
  cellphone: string;
  email: string;
  taxId: string;
};

type AbacatePayBillingProduct = {
  externalId: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
};

export type AbacatePayBillingStatus =
  | "PENDING"
  | "EXPIRED"
  | "CANCELLED"
  | "PAID"
  | "REFUNDED";

export type AbacatePayBillingInput = {
  frequency: "ONE_TIME" | "MULTIPLE_PAYMENTS";
  methods: Array<"PIX" | "CARD">;
  products: AbacatePayBillingProduct[];
  returnUrl: string;
  completionUrl: string;
  customerId?: string;
  customer?: AbacatePayCustomerInput;
  allowCoupons?: boolean;
  coupons?: string[];
  externalId?: string;
  metadata?: Record<string, string>;
};

type AbacatePayBilling = {
  id: string;
  url: string;
  status?: AbacatePayBillingStatus;
};

async function abacatepayRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${ABACATEPAY_BASE_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.ABACATEPAY_API_KEY}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  let payload: AbacatePayResponse<T> | null = null;
  if (text) {
    try {
      payload = JSON.parse(text) as AbacatePayResponse<T>;
    } catch {
      if (!response.ok) {
        throw new Error(`AbacatePay request failed (${response.status})`);
      }
      throw new Error("AbacatePay returned invalid JSON");
    }
  }

  if (!response.ok) {
    const message =
      (payload && "error" in payload && payload.error) ||
      `AbacatePay request failed (${response.status})`;
    throw new Error(message || "AbacatePay request failed");
  }

  if (!payload) {
    throw new Error("AbacatePay response missing body");
  }

  return payload.data;
}

function normalizeEmail(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}

function normalizePhone(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

function normalizeTaxId(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

export async function createAbacatePayCustomer(
  input: AbacatePayCustomerInput
): Promise<string> {
  const data = await abacatepayRequest<AbacatePayCustomer>("/customer/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data.id;
}

export async function listAbacatePayCustomers(): Promise<AbacatePayCustomer[]> {
  return abacatepayRequest<AbacatePayCustomer[]>("/customer/list", {
    method: "GET",
  });
}

export async function findAbacatePayCustomerId(input: {
  email: string;
  cellphone: string;
  taxId: string;
}): Promise<string | undefined> {
  const customers = await listAbacatePayCustomers();
  const email = normalizeEmail(input.email);
  const phone = normalizePhone(input.cellphone);
  const taxId = normalizeTaxId(input.taxId);

  const match = customers.find((customer) => {
    const metadata = customer.metadata;
    return (
      normalizeEmail(metadata.email) === email ||
      normalizePhone(metadata.cellphone) === phone ||
      normalizeTaxId(metadata.taxId) === taxId
    );
  });

  return match?.id;
}

export async function ensureAbacatePayCustomerId(input: {
  existingId?: string | null;
  customer: AbacatePayCustomerInput;
}): Promise<{ id: string; created: boolean }> {
  if (input.existingId) {
    return { id: input.existingId, created: false };
  }

  const foundId = await findAbacatePayCustomerId({
    email: input.customer.email,
    cellphone: input.customer.cellphone,
    taxId: input.customer.taxId,
  });

  if (foundId) {
    return { id: foundId, created: false };
  }

  const createdId = await createAbacatePayCustomer(input.customer);
  return { id: createdId, created: true };
}

export async function createAbacatePayBilling(
  input: AbacatePayBillingInput
): Promise<AbacatePayBilling> {
  return abacatepayRequest<AbacatePayBilling>("/billing/create", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function mapAbacatePayStatusToAssinatura(status?: AbacatePayBillingStatus) {
  switch (status) {
    case "PENDING":
      return "PENDENTE" as const;
    case "PAID":
      return "ATIVA" as const;
    case "CANCELLED":
      return "CANCELADA" as const;
    case "EXPIRED":
      return "ATRASADA" as const;
    default:
      return undefined;
  }
}
