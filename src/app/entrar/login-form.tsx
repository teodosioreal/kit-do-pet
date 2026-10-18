"use client";
import { useActionState } from "react";
import { sendMagicLink, type LoginState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(sendMagicLink, { status: "idle" });

  if (state.status === "sent") {
    return (
      <div className="card text-center">
        <div className="text-4xl">📬</div>
        <h2 className="mt-2 text-xl font-bold">Confira seu e-mail</h2>
        <p className="mt-2 text-gray-600">
          Se este e-mail tiver uma compra, você vai receber um link para entrar. Ele vale por 1 hora.
          Olhe também a caixa de spam e a aba Promoções.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="card flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <div>
        <label htmlFor="email" className="label">E-mail usado na compra</label>
        <input id="email" name="email" type="email" inputMode="email" autoComplete="email" required className="input" placeholder="voce@email.com" />
      </div>
      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}
      <button className="btn-primary" disabled={pending}>{pending ? "Enviando..." : "Receber link de acesso"}</button>
    </form>
  );
}
