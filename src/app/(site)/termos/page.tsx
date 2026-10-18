import type { Metadata } from "next";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Termos de uso" };

// Modelo inicial. Revise com um profissional.
export default function TermsPage() {
  return (
    <LegalPage title="Termos de uso" updated="18/10/2026">
      <h2>1. O serviço</h2>
      <p>
        O Kit do Pet oferece documentos personalizados do seu pet em PDF (RG do pet, certidão de nascimento e carteira
        de vacinação) e uma página pública de identificação por QR code, além dos itens adicionais comprados.
      </p>
      <h2>2. Sem valor oficial</h2>
      <p>
        Os documentos são <strong>personalizados, recreativos e sem valor oficial</strong>. Não substituem registros,
        atestados, carteiras de vacinação emitidas por médicos-veterinários nem qualquer documento exigido por órgãos
        públicos.
      </p>
      <h2>3. Identificação por QR code</h2>
      <p>
        A página do pet é uma forma de identificação: quem escaneia o QR code vê os dados que você escolheu e pode
        entrar em contato. O serviço <strong>não localiza o pet</strong> e não garante que ele seja encontrado.
      </p>
      <h2>4. Sua conta</h2>
      <ul>
        <li>O acesso é pessoal e feito por link enviado ao seu e-mail.</li>
        <li>O número de pets depende do que foi comprado.</li>
        <li>Você é responsável pelas informações e fotos que cadastrar.</li>
      </ul>
      <h2>5. Lembretes no WhatsApp</h2>
      <p>
        Quando contratados, são enviados por 12 meses a partir da compra, com base nas datas que você cadastrar. Podem
        ocorrer falhas de entrega por motivos externos (por exemplo, número inválido ou instabilidade do WhatsApp). Os
        lembretes não substituem a orientação do seu veterinário.
      </p>
      <h2>6. Reembolso</h2>
      <p>
        Você pode pedir reembolso no prazo legal pela plataforma de pagamento. Com o reembolso ou contestação, o acesso
        aos itens daquele pedido é encerrado.
      </p>
      <h2>7. Uso adequado</h2>
      <p>
        É proibido usar o serviço para fins ilegais, para se passar por documentos oficiais ou para enviar mensagens
        abusivas pela página pública.
      </p>
      <h2>8. Contato</h2>
      <p>Dúvidas: <strong>[preencher e-mail de contato]</strong>.</p>
    </LegalPage>
  );
}
