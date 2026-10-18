import { dogSitting } from "./art.mjs";

export const adestramentoCao = {
  file: "guia-adestramento-cao.pdf",
  title: "Adestramento básico para cães",
  kicker: "Guia bônus · Cães",
  subtitle: "Comandos essenciais, rotina e reforço positivo, explicados passo a passo para fazer em casa.",
  edition: "2026",
  coverArt: dogSitting(),
  closingArt: dogSitting({ bg: "#ffedd5", collar: "#14b8a6" }),
  theme: { main: "#f97316", dark: "#c2410c", soft: "#fff1e6", coverBg: "#fff7ed", blob1: "#fed7aa", blob2: "#bae6fd" },
  introTitle: "Antes de começar",
  intro: [
    {
      type: "p",
      text: "Adestrar não é sobre “mandar” no cão: é sobre **ensinar uma linguagem em comum**. Quando ele entende o que você espera, fica mais calmo, mais seguro e a convivência fica muito mais gostosa para todo mundo.",
    },
    {
      type: "p",
      text: "Este guia usa **reforço positivo**: recompensamos o comportamento certo no momento em que ele acontece, em vez de punir o errado. É o método recomendado por veterinários comportamentalistas, funciona com filhotes e adultos e fortalece o vínculo entre vocês.",
    },
    {
      type: "cards",
      items: [
        { icon: "clock", title: "Sessões curtas", text: "3 a 5 minutos, 2 ou 3 vezes por dia. Melhor pouco e sempre do que muito de vez em quando." },
        { icon: "treat", title: "Recompensa certa", text: "Petiscos bem pequenos e macios, do tamanho de um grão de feijão. Carinho e brincadeira também valem." },
        { icon: "heart", title: "Sem broncas", text: "Nada de gritos, puxões ou castigos. Eles geram medo e atrapalham o aprendizado." },
        { icon: "star", title: "Termine bem", text: "Encerre sempre com um acerto, mesmo que seja um comando que ele já sabe." },
      ],
    },
  ],
  chapters: [
    {
      title: "Os fundamentos do reforço positivo",
      icon: "star",
      blocks: [
        { type: "h2", icon: "treat", text: "Como o cão aprende" },
        {
          type: "p",
          text: "Cães repetem o que dá certo para eles. Se sentar trouxe um petisco, ele vai sentar mais vezes. O segredo está no **tempo**: a recompensa precisa chegar em até **1 a 2 segundos** depois do comportamento, senão ele não faz a ligação.",
        },
        { type: "h2", icon: "hand", text: "A palavra-marcador" },
        {
          type: "p",
          text: "Escolha uma palavra curta e alegre, como **“Isso!”**, e use sempre no exato instante em que ele acertar. Ela funciona como uma “foto” do momento certo e te dá tempo de pegar o petisco. (Se preferir, um clicker faz o mesmo papel.)",
        },
        {
          type: "steps",
          title: "Carregando o marcador (faça antes de tudo)",
          items: [
            "Separe 10 petiscos pequenos.",
            "Diga “Isso!” e, logo em seguida, dê um petisco. Não precisa pedir nada.",
            "Repita 10 vezes, em 2 ou 3 sessões ao longo do dia.",
            "Teste: diga “Isso!” quando ele estiver distraído. Se ele olhar para você esperando o petisco, o marcador está carregado.",
          ],
        },
        { type: "h2", icon: "check", text: "Regras de ouro" },
        {
          type: "list",
          items: [
            "**Uma palavra por comando**, e a família toda usa a mesma (“senta” é sempre “senta”, nunca “senta aí”).",
            "**Diga o comando uma vez só.** Se repetir “senta, senta, senta”, ele aprende que o comando é a palavra repetida.",
            "**Treine antes das refeições**, quando ele está mais interessado no petisco, e nunca logo depois de comer.",
            "**Comece em lugar calmo** (dentro de casa) e só depois vá para lugares com mais distrações.",
            "**Não avançou?** Volte um passo, facilite e termine com um acerto.",
          ],
        },
        {
          type: "tip",
          text: "Desconte os petiscos do treino da ração do dia, para não engordar. Para cães pequenos, corte cada petisco em pedacinhos ainda menores.",
        },
      ],
    },
    {
      title: "Nome e atenção",
      icon: "heart",
      blocks: [
        {
          type: "p",
          text: "Antes de qualquer comando, o cão precisa olhar para você quando ouve o nome dele. Parece simples, mas é a base de todo o resto.",
        },
        {
          type: "steps",
          title: "Passo a passo",
          items: [
            "Em um lugar calmo, diga o nome do cão uma vez, em tom alegre.",
            "No instante em que ele olhar para você, diga “Isso!” e dê o petisco.",
            "Repita 5 a 10 vezes por sessão, mudando de lugar na casa.",
            "Aos poucos, chame quando ele estiver um pouco distraído (cheirando um brinquedo, por exemplo).",
          ],
        },
        {
          type: "warn",
          text: "Nunca use o nome do cão para dar bronca. Ele precisa associar o próprio nome a coisas boas.",
        },
      ],
    },
    {
      title: "Senta",
      icon: "treat",
      blocks: [
        { type: "p", text: "Costuma ser o comando mais fácil de ensinar e é muito útil no dia a dia: antes de pôr a comida, antes de abrir a porta, para cumprimentar visitas." },
        {
          type: "steps",
          title: "Passo a passo",
          items: [
            "Segure um petisco perto do focinho do cão, sem deixar ele pegar.",
            "Leve a mão devagar para cima e um pouco para trás, por cima da cabeça. Para acompanhar o petisco com o olhar, o bumbum desce naturalmente.",
            "No instante em que o bumbum tocar o chão: “Isso!” e petisco.",
            "Repita 5 vezes. Quando ele estiver sentando com facilidade, comece a dizer “Senta” **antes** de fazer o gesto.",
            "Aos poucos, faça o gesto sem o petisco na mão e dê a recompensa com a outra mão.",
          ],
        },
        { type: "tip", text: "Não empurre o bumbum dele para baixo. O cão aprende muito mais rápido quando descobre o movimento sozinho." },
      ],
    },
    {
      title: "Deita",
      icon: "home",
      blocks: [
        { type: "p", text: "Ajuda o cão a relaxar e a esperar com calma. Ensine depois que o “senta” estiver firme." },
        {
          type: "steps",
          title: "Passo a passo",
          items: [
            "Peça “senta”.",
            "Com o petisco no focinho, desça a mão devagar até o chão, entre as patas da frente.",
            "Depois, arraste a mão lentamente para a frente, rente ao chão. O cão vai esticar o corpo até deitar.",
            "Quando os cotovelos tocarem o chão: “Isso!” e petisco.",
            "Depois de alguns acertos, diga “Deita” antes do gesto.",
          ],
        },
        {
          type: "tip",
          title: "Se ele levantar o bumbum",
          text: "Volte para o “senta” e desça a mão mais devagar. Para cães agitados, treine num tapete ou numa superfície macia, que convida a deitar.",
        },
      ],
    },
    {
      title: "Fica",
      icon: "clock",
      blocks: [
        {
          type: "p",
          text: "O “fica” ensina autocontrole e pode evitar acidentes, como sair correndo pela porta. Ele é construído com os **3 Ds**: **duração** (quanto tempo), **distância** (quão longe você vai) e **distração** (o que acontece em volta). **Aumente um D de cada vez.**",
        },
        {
          type: "steps",
          title: "Passo a passo",
          items: [
            "Peça “senta”. Mostre a palma da mão aberta (como um sinal de “pare”) e diga “Fica”.",
            "Espere só 1 segundo. Se ele continuar sentado: “Isso!” e petisco **enquanto ele ainda está sentado**.",
            "Diga a palavra de liberação, como “Pode!”, e convide ele a levantar.",
            "Vá aumentando o tempo: 2, 3, 5, 10 segundos.",
            "Depois, dê um passo para trás e volte. Depois dois passos. Sempre volte até ele para recompensar.",
            "Por último, treine com pequenas distrações (alguém passando, um brinquedo no chão).",
          ],
        },
        { type: "warn", text: "Se ele levantar antes, não brigue: apenas facilite (menos tempo ou menos distância) e tente de novo. Errar muitas vezes seguidas significa que você subiu a dificuldade rápido demais." },
      ],
    },
    {
      title: "Vem (chamado)",
      icon: "ball",
      blocks: [
        {
          type: "p",
          text: "Atender quando é chamado é o comando que mais protege o cão. Por isso ele precisa ser treinado com muito carinho: **vir até você deve ser sempre a melhor coisa do mundo**.",
        },
        {
          type: "steps",
          title: "Passo a passo",
          items: [
            "Dentro de casa, a poucos passos de distância, abaixe-se e diga “Fulano, vem!” em tom animado.",
            "Bata palmas ou se afaste um pouco para incentivar. Quando ele chegar: festa, “Isso!” e um petisco especial.",
            "Repita em cômodos diferentes, aumentando a distância.",
            "Peça a outra pessoa da casa para segurar o cão e soltar quando você chamar (brincadeira de “pingue-pongue”).",
            "Na rua, treine só com guia longa (5 a 10 metros) até ele vir sempre.",
          ],
        },
        {
          type: "warn",
          title: "Nunca faça isso",
          text: "Não chame o cão para algo que ele não gosta (dar banho, cortar unha, ir embora do parque, levar bronca). Nesses casos, vá até ele. Se o “vem” virar sinal de coisa ruim, ele para de atender.",
        },
      ],
    },
    {
      title: "Passear sem puxar a guia",
      icon: "leash",
      blocks: [
        {
          type: "p",
          text: "Cães puxam porque o mundo é interessante e porque, muitas vezes, puxar funciona: eles chegam mais rápido onde querem. O treino ensina que **guia frouxa é o que faz o passeio andar**.",
        },
        {
          type: "steps",
          title: "Passo a passo",
          items: [
            "Use peitoral ou coleira confortável e uma guia de 1,5 a 2 metros. Evite enforcadores e coleiras que machucam.",
            "Comece no quintal ou na frente de casa, com poucas distrações.",
            "Sempre que a guia estiver frouxa e ele ao seu lado: “Isso!” e petisco na altura da sua perna.",
            "Quando ele puxar, **pare e fique parado**, como uma árvore. Espere a guia afrouxar (ele olhar para trás ou voltar um passo).",
            "Guia frouxa: “Isso!” e volte a andar.",
            "Mudar de direção de vez em quando ajuda a manter a atenção dele em você.",
          ],
        },
        { type: "tip", text: "Antes de um passeio de treino, gaste um pouco da energia dele com uma brincadeira. Cão muito agitado aprende com mais dificuldade." },
      ],
    },
    {
      title: "Deixa e solta",
      icon: "hand",
      blocks: [
        { type: "p", text: "Dois comandos que evitam que o cão coma algo perigoso na rua ou destrua o que não deve." },
        {
          type: "steps",
          title: "Deixa (não pegue)",
          items: [
            "Feche um petisco na mão e mostre para o cão. Ele vai cheirar, lamber e tentar pegar. Não abra a mão.",
            "No instante em que ele se afastar ou desistir: “Isso!” e dê um petisco **da outra mão**.",
            "Quando ele já se afastar rapidamente, diga “Deixa” antes de mostrar a mão.",
            "Avance: petisco no chão, coberto pela sua mão; depois, descoberto, com você por perto.",
          ],
        },
        {
          type: "steps",
          title: "Solta (largar o que está na boca)",
          items: [
            "Durante uma brincadeira com um brinquedo, ofereça um petisco bem perto do focinho.",
            "Quando ele abrir a boca e largar o brinquedo: “Isso!”, petisco, e **devolva o brinquedo**.",
            "Depois de algumas repetições, diga “Solta” antes de mostrar o petisco.",
          ],
        },
        { type: "tip", text: "Devolver o brinquedo é o segredo: o cão aprende que soltar não significa perder a brincadeira." },
      ],
    },
    {
      title: "Xixi e cocô no lugar certo",
      icon: "home",
      blocks: [
        {
          type: "p",
          text: "Ensinar o lugar certo exige paciência e rotina. Filhotes têm pouco controle da bexiga: até uns 6 meses é normal ter escapes.",
        },
        {
          type: "steps",
          title: "Passo a passo",
          items: [
            "Escolha um lugar fixo (tapete higiênico, jornal ou um canto do quintal/área de passeio).",
            "Leve o cão até lá **ao acordar, depois de comer, depois de brincar e antes de dormir**. Filhotes: a cada 1 ou 2 horas.",
            "Espere com calma. Quando ele fizer no lugar certo: “Isso!”, festa e petisco **na hora**, ali mesmo.",
            "Se pegar ele começando a fazer no lugar errado, interrompa com um som neutro e leve-o até o lugar certo.",
          ],
        },
        {
          type: "warn",
          text: "Não brigue ao encontrar xixi fora do lugar depois do ocorrido: ele não entende o motivo e pode passar a fazer escondido. Limpe com produto enzimático ou água e sabão neutro. **Evite produtos com amônia**: o cheiro lembra urina e atrai o cão de volta para o mesmo lugar.",
        },
      ],
    },
    {
      title: "Problemas comuns",
      icon: "warn",
      blocks: [
        {
          type: "table",
          head: ["Situação", "O que fazer"],
          rows: [
            ["**Filhote mordendo mãos e pés**", "Ofereça um brinquedo de morder no lugar da mão. Se ele morder forte, pare a brincadeira por alguns segundos. Ele aprende que morder acaba com a diversão."],
            ["**Pular nas pessoas**", "Ignore (vire de costas) enquanto ele pula. Dê atenção e petisco só quando estiver com as 4 patas no chão, ou peça “senta”."],
            ["**Latir demais**", "Descubra a causa (tédio, medo, alerta, pedir atenção). Mais passeios e brincadeiras ajudam muito. Recompense os momentos de silêncio."],
            ["**Destruir objetos**", "Geralmente é falta de atividade. Ofereça brinquedos de morder, brinquedos recheáveis com petisco e passeios diários."],
            ["**Chorar quando fica sozinho**", "Treine ausências curtas e vá aumentando. Saia e volte sem festa. Deixe um brinquedo recheável para ele se distrair."],
          ],
        },
        {
          type: "vet",
          title: "Quando procurar ajuda profissional",
          text: "Se houver agressividade (rosnar, mostrar os dentes, morder), medo intenso, destruição com machucados ou desespero quando fica sozinho, procure o veterinário e um adestrador ou comportamentalista. Essas situações precisam de avaliação individual.",
        },
      ],
    },
    {
      title: "Plano de treino de 4 semanas",
      icon: "clock",
      blocks: [
        { type: "p", text: "Uma sugestão de ritmo. Cada cão aprende no seu tempo: se precisar, fique mais uma semana em cada etapa." },
        {
          type: "table",
          head: ["Semana", "Foco", "Meta da semana"],
          rows: [
            ["**1**", "Marcador “Isso!”, nome e senta", "Olha para você quando chamado pelo nome e senta com o gesto."],
            ["**2**", "Deita e início do fica", "Deita com o gesto; fica sentado por 5 segundos com você ao lado."],
            ["**3**", "Vem e passeio com guia frouxa", "Vem quando chamado dentro de casa; caminha alguns metros sem puxar."],
            ["**4**", "Deixa, solta e revisão com distrações", "Larga um brinquedo em troca de petisco; repete os comandos no quintal ou na rua."],
          ],
        },
        { type: "h2", icon: "check", text: "Checklist diário" },
        {
          type: "checklist",
          items: [
            "2 ou 3 sessões de 3 a 5 minutos",
            "Petiscos pequenos separados antes de começar",
            "Pelo menos um passeio ou brincadeira para gastar energia",
            "Terminei a sessão com um acerto",
            "Todos em casa usaram as mesmas palavras",
          ],
        },
      ],
    },
  ],
  closingTitle: "Paciência, carinho e constância",
  closing: [
    {
      type: "p",
      text: "Cada pequena conquista conta. Comemore os acertos, respeite o ritmo do seu cão e lembre: o treino também é um momento de diversão e de vínculo entre vocês. 🐾",
    },
    {
      type: "tip",
      title: "Uma última dica",
      text: "Cadastre as vacinas e vermífugos no Kit do Pet e mantenha os dados do seu cão sempre atualizados na página do QR code. Cão bem cuidado aprende melhor.",
    },
  ],
  legal:
    "Este guia tem caráter educativo e não substitui a orientação de médico-veterinário, adestrador ou comportamentalista. Cada animal é único: em caso de dúvida, problemas de saúde ou de comportamento, procure um profissional. © Kit do Pet. Uso pessoal; proibida a revenda ou distribuição.",
};
