import "server-only";
import { cakto } from "./cakto";
import { kiwify } from "./kiwify";
import type { PaymentProvider, ProviderName } from "./types";

export const PROVIDERS: Record<ProviderName, PaymentProvider> = { kiwify, cakto };
