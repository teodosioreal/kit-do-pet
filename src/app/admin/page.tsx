import type { Metadata } from "next";
import { getDayStats } from "@/lib/admin-stats";
import { addDaysISO, formatDateBR, todayISO } from "@/lib/dates";
import { formatBRL, PRODUCTS } from "@/lib/products";

export const metadata: Metadata = { title: "Admin" };

const pct = (n: number) => `${Math.round(n * 100)}%`;

export default async function AdminHome({ searchParams }: PageProps<"/admin">) {
  const { dia } = await searchParams;
  const day = typeof dia === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dia) ? dia : todayISO();
  const last7 = Array.from({ length: 7 }, (_, i) => addDaysISO(day, -i));
  const [today, ...history] = await Promise.all([getDayStats(day), ...last7.slice(1).map((d) => getDayStats(d))]);

  const cards: [string, string][] = [
    ["Vendas do kit", `${today.orders}${today.otherOrders ? ` (+${today.otherOrders} avulsas)` : ""}`],
    ["Valor cobrado", formatBRL(today.revenueCents)],
    ["Reembolsos/chargebacks", String(today.refunds)],
    ["Lembretes enviados", `${today.remindersSent}${today.remindersFailed ? ` (${today.remindersFailed} falharam)` : ""}`],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Números de {formatDateBR(day)}</h1>
        <form className="flex gap-2">
          <input type="date" name="dia" defaultValue={day} className="input py-2" />
          <button className="btn-secondary py-2">Ver</button>
        </form>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card">
            <p className="text-xs font-bold uppercase text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-extrabold">{value}</p>
          </div>
        ))}
      </div>
      <section className="card">
        <h2 className="font-bold">Order bumps (% das vendas do kit no dia)</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(Object.keys(today.bumpRate) as (keyof typeof today.bumpRate)[]).map((k) => (
            <div key={k}>
              <p className="text-sm text-gray-600">{PRODUCTS[k].name}</p>
              <p className="text-xl font-extrabold text-brand-600">{pct(today.bumpRate[k])}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="card overflow-x-auto">
        <h2 className="font-bold">Últimos dias</h2>
        <table className="mt-3 w-full text-left text-sm">
          <thead className="text-xs uppercase text-gray-500">
            <tr><th className="py-2">Dia</th><th>Kits</th><th>Avulsas</th><th>Valor</th><th>Lembretes</th><th>Mais pet</th><th>Adestr.</th><th>Petiscos</th><th>Reemb.</th></tr>
          </thead>
          <tbody>
            {[today, ...history].map((d) => (
              <tr key={d.day} className="border-t">
                <td className="py-2">{formatDateBR(d.day)}</td>
                <td>{d.orders}</td>
                <td>{d.otherOrders}</td>
                <td>{formatBRL(d.revenueCents)}</td>
                <td>{pct(d.bumpRate.reminders)}</td>
                <td>{pct(d.bumpRate.extra_pet)}</td>
                <td>{pct(d.bumpRate.guide_training)}</td>
                <td>{pct(d.bumpRate.guide_treats)}</td>
                <td>{d.refunds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
