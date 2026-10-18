import type { Metadata } from "next";
import { LegalPage } from "../legal-page";

export const metadata: Metadata = { title: "Política de privacidade" };

// Modelo inicial. Revise com um profissional e preencha os dados do controlador.
export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidade" updated="18/10/2026">
      <p>
        Esta política explica como o Kit do Pet trata seus dados pessoais, conforme a Lei Geral de Proteção de Dados
        (Lei nº 13.709/2018 — LGPD).
      </p>
      <h2>1. Quem somos</h2>
      <p>
        O Kit do Pet é responsável (controlador) pelos dados tratados neste site. Contato do encarregado de dados:
        <strong> [preencher e-mail de contato]</strong>.
      </p>
      <h2>2. Quais dados coletamos</h2>
      <ul>
        <li>Dados da compra, recebidos da plataforma de pagamento: nome, e-mail, telefone e itens comprados. Não recebemos dados de cartão.</li>
        <li>Dados de cadastro: nome e WhatsApp.</li>
        <li>Dados do pet que você informar: nome, foto, espécie, raça, sexo, cor, nascimento, características, observações, vacinas e vermífugos, nome e WhatsApp do tutor.</li>
        <li>Na página pública do pet: se quem encontrou o pet autorizar, a localização aproximada, enviada apenas para o tutor. Guardamos um código irreversível (hash) do endereço IP para limitar envios abusivos.</li>
      </ul>
      <h2>3. Para que usamos</h2>
      <ul>
        <li>Liberar o acesso e entregar o que você comprou (execução de contrato).</li>
        <li>Gerar os documentos personalizados e a página pública do pet.</li>
        <li>Enviar mensagens no WhatsApp e e-mails de acesso, documentos, avisos de pet encontrado e lembretes contratados (com o seu consentimento, que pode ser retirado a qualquer momento em &quot;Conta&quot;).</li>
        <li>Cumprir obrigações legais e prevenir fraudes.</li>
      </ul>
      <h2>4. O que fica público</h2>
      <p>
        Apenas os dados que você escolher em &quot;O que aparece na página pública&quot; ficam visíveis para quem acessar o
        endereço do QR code. O nome do pet sempre aparece. Você pode alterar essas escolhas quando quiser.
      </p>
      <h2>5. Com quem compartilhamos</h2>
      <p>
        Com fornecedores que nos ajudam a operar o serviço: hospedagem (Hostinger), banco de dados e arquivos (Supabase),
        envio de e-mail (Resend), envio de WhatsApp e a plataforma de pagamento (Kiwify). Não vendemos seus dados.
      </p>
      <h2>6. Por quanto tempo guardamos</h2>
      <p>
        Enquanto sua conta existir ou pelo tempo exigido por lei (por exemplo, registros de compra). Ao pedir a
        exclusão, apagamos os dados que não precisamos manter por obrigação legal.
      </p>
      <h2>7. Seus direitos</h2>
      <p>
        Você pode pedir confirmação, acesso, correção, portabilidade, anonimização ou exclusão dos seus dados e retirar
        o consentimento, pelo contato acima.
      </p>
      <h2>8. Segurança</h2>
      <p>
        Usamos conexão criptografada, controle de acesso por usuário no banco de dados e armazenamento privado das fotos.
      </p>
    </LegalPage>
  );
}
