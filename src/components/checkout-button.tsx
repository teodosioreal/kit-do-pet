"use client";
import { trackInitiateCheckout } from "@/components/meta-pixel";

type Props = { href: string; children: React.ReactNode; className?: string; value?: number };

/** Botão de compra: dispara InitiateCheckout e leva os parâmetros UTM da página para o checkout. */
export function CheckoutButton({ href, children, className = "btn-primary", value }: Props) {
  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    trackInitiateCheckout(value);
    try {
      const target = new URL(href);
      new URLSearchParams(window.location.search).forEach((v, k) => {
        if (/^(utm_|src|sck|fbclid)/.test(k) && !target.searchParams.has(k)) target.searchParams.set(k, v);
      });
      e.currentTarget.href = target.toString();
    } catch {
      // href inválido: segue o link original
    }
  }
  return (
    <a href={href || "#"} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
