import { webhookHandler } from "@/lib/payments/webhook-handler";

export const maxDuration = 60;
export const POST = webhookHandler("cakto");
