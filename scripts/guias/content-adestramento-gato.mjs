import { catSitting } from "./art.mjs";

export const adestramentoGato = {
  file: "guia-adestramento-gato.pdf",
  title: "Adestramento básico para gatos",
  kicker: "Guia bônus · Gatos",
  subtitle: "Sim, gatos aprendem! Reforço positivo, rotina e soluções para os desafios mais comuns da convivência.",
  edition: "2026",
  coverArt: catSitting(),
  closingArt: catSitting({ bg: "#ccfbf1", collar: "#f97316" }),
  theme: { main: "#db2777", dark: "#9d174d", soft: "#fdf2f8", coverBg: "#fdf2f8", blob1: "#fbcfe8", blob2: "#ccfbf1" },
  introTitle: "Antes de começar",
  intro: [
    {
      type: "p",
      text: "Muita gente acha que gato não aprende nada, mas eles são ótimos alunos quando o treino respeita o jeito felino de ser. O segredo é **motivação**: o gato faz o que vale a pena para ele, e nunca por medo.",
    },
    {
      type: "p",
      text: "Este guia usa **reforço positivo**: recompensamos o comportamento certo na hora em que ele acontece. Assim o gato aprende, fica mais confiante e o vínculo entre vocês se fortalece.",
    },
    {
      type: "cards",
      items: [
        { icon: "clock", title: "Sessões bem curtas", text: "1 a 3 minutos, uma ou duas vezes ao dia. Pare antes que ele perca o interesse." },
        { icon: "treat", title: "Petisco irresistível", text: "Pedacinhos de frango cozido sem tempero, um pouco de sachê na ponta de uma colher ou o petisco favorito dele." },
        { icon: "heart", title: "Nunca castigue", text: "Gritos, borrifos de água e sustos geram medo e estresse. O gato associa o castigo a você, não ao erro." },
        { icon: "star", title: "Respeite o “não”", text: "Se ele se afastar, encerre. Gato que escolhe participar aprende muito mais." },
      ],
    },
  ],
  chapters: [
    {
      title: "Como o gato aprende",
      icon: "star",
      blocks: [
        {
          type: "p",
          text: "Gatos aprendem por associação: se uma ação traz algo bom, ela tende a se repetir. A recompensa precisa chegar em **até 1 ou 2 segundos**, senão ele não entende o que fez de certo.",
        },
        { type: "h2", icon: "hand", text: "O marcador: “clique” ou palavra" },
        {
          type: "p",
          text: "Um clicker (vende em pet shops) ou uma palavra curta, como **“Isso!”**, marcam o momento exato do acerto. O clicker funciona muito bem com gatos, porque o som é sempre igual.",
        },
        {
          type: "steps",
          title: "Carregando o marcador",
          items: [
            "Separe 8 a 10 pedacinhos de petisco.",
            "Clique (ou diga “Isso!”) e dê um petisco logo em seguida. Não peça nada.",
            "Repita 8 a 10 vezes, em duas sessões no mesmo dia.",
            "Pronto: quando ele virar a cabeça para você ao ouvir o som, o marcador está carregado.",
          ],
        },
        {
          type: "tip",
          title: "Melhor momento para treinar",
          text: "Um pouco antes da refeição, quando ele está com fome e animado. Evite treinar logo depois de comer ou quando ele estiver sonolento.",
        },
      ],
    },
    {
      title: "Atender pelo nome e vir quando chamado",
      icon: "heart",
      blocks: [
        { type: "p", text: "Ter um gato que vem quando é chamado facilita na hora de dar remédio, de colocar na caixa de transporte e em emergências." },
        {
          type: "steps",
          title: "Passo a passo",
          items: [
            "Escolha um som só para isso: o nome dele seguido de “vem”, ou chacoalhar o pote de petiscos.",
            "Faça o som a 1 metro dele e dê um petisco assim que ele se aproximar.",
            "Aumente a distância aos poucos: outro canto do cômodo, depois outro cômodo.",
            "Use o mesmo som antes de servir a comida. Ele vai associar o chamado à melhor parte do dia.",
          ],
        },
        { type: "warn", text: "Não chame o gato para algo que ele não gosta (remédio, banho, corte de unhas). Nesses casos, vá até ele com calma." },
      ],
    },
    {
      title: "Toque no alvo (target)",
      icon: "wand",
      blocks: [
        {
          type: "p",
          text: "Ensinar o gato a encostar o focinho num alvo (a ponta do seu dedo ou um palitinho) parece um truque, mas é muito útil: com ele, você guia o gato para descer de um lugar, entrar na caixa de transporte ou subir na balança.",
        },
        {
          type: "steps",
          title: "Passo a passo",
          items: [
            "Mostre o dedo indicador (ou um palitinho de churrasco com a ponta envolvida em fita colorida) a uns 5 cm do focinho.",
            "Gatos são curiosos e vão cheirar. No momento em que o focinho encostar: clique e petisco.",
            "Repita, mudando um pouco a posição do alvo: para um lado, para o outro, um pouco mais alto.",
            "Quando ele tocar sempre, diga “toca” antes de mostrar o alvo.",
            "Depois, afaste o alvo alguns passos para ele vir até você seguindo o alvo.",
          ],
        },
      ],
    },
    {
      title: "Senta",
      icon: "treat",
      blocks: [
        {
          type: "steps",
          title: "Passo a passo",
          items: [
            "Com o gato de pé à sua frente, segure um petisco perto do focinho.",
            "Leve o petisco devagar para cima e um pouco para trás, por cima da cabeça.",
            "Para acompanhar com o olhar, ele tende a sentar. Na hora em que sentar: clique e petisco.",
            "Depois de vários acertos, diga “senta” antes do gesto.",
          ],
        },
        { type: "tip", text: "Pedir “senta” antes de servir a comida ajuda gatos ansiosos que sobem na bancada ou se enroscam nas pernas na hora de comer." },
      ],
    },
    {
      title: "Caixa de areia sem problemas",
      icon: "litter",
      blocks: [
        {
          type: "p",
          text: "A maioria dos gatos usa a caixa por instinto. Quando há problema, quase sempre é algo na **caixa, no local ou na saúde**, não “birra”.",
        },
        {
          type: "cards",
          items: [
            { icon: "litter", title: "Quantidade", text: "Número de gatos + 1. Com um gato, o ideal são 2 caixas, em lugares diferentes." },
            { icon: "home", title: "Lugar", text: "Calmo, de fácil acesso, longe da comida e da água e longe da máquina de lavar." },
            { icon: "check", title: "Limpeza", text: "Retire os dejetos pelo menos 1 vez ao dia e troque toda a areia regularmente." },
            { icon: "star", title: "Areia e tamanho", text: "Areia fina, sem perfume. A caixa deve ter 1,5 vez o comprimento do gato." },
          ],
        },
        {
          type: "steps",
          title: "Ensinando um filhote ou gato novo",
          items: [
            "Mostre a caixa logo que ele chegar em casa.",
            "Coloque o gato na caixa depois das refeições e quando acordar.",
            "Se ele usar, deixe-o em paz (não pegue no colo na hora) e ofereça um petisco quando sair.",
          ],
        },
        {
          type: "vet",
          text: "Se um gato que sempre usou a caixa começar a fazer xixi fora dela, a primeira suspeita é saúde, especialmente problemas urinários, que podem ser graves (principalmente em machos). Se ele estiver indo muitas vezes à caixa, fazendo pouco xixi, com sangue ou miando ao urinar, **procure o veterinário com urgência**.",
        },
        {
          type: "warn",
          text: "Limpe acidentes com produto enzimático ou água e sabão neutro. Evite produtos com amônia ou cloro: o cheiro atrai o gato de volta ao mesmo lugar.",
        },
      ],
    },
    {
      title: "Arranhador, e não o sofá",
      icon: "scratcher",
      blocks: [
        {
          type: "p",
          text: "Arranhar é uma **necessidade**: o gato cuida das unhas, alonga o corpo e marca território. O objetivo não é proibir, e sim **mostrar onde arranhar**.",
        },
        {
          type: "steps",
          title: "Passo a passo",
          items: [
            "Ofereça arranhadores firmes (que não balançam) e altos o bastante para ele se esticar todo. Tenha um vertical e um horizontal.",
            "Coloque-os **perto do que ele arranha hoje** (o sofá, por exemplo) e perto de onde ele dorme, porque gatos arranham ao acordar.",
            "Atraia para o arranhador com uma varinha de brinquedo ou passando um pouco de erva-de-gato (catnip).",
            "Toda vez que ele usar: clique e petisco.",
            "Enquanto isso, deixe o sofá menos atraente: cubra com uma manta ou fita dupla face por algumas semanas.",
          ],
        },
        {
          type: "warn",
          title: "Importante",
          text: "Nunca retire as unhas do gato cirurgicamente (“desungulação”): é uma amputação dolorosa, que causa problemas de saúde e de comportamento. Prefira arranhadores e o corte regular das pontas das unhas.",
        },
      ],
    },
    {
      title: "Caixa de transporte sem drama",
      icon: "carrier",
      blocks: [
        {
          type: "p",
          text: "Muitos gatos só veem a caixa de transporte quando vão ao veterinário, e aí ela vira sinônimo de coisa ruim. O treino transforma a caixa num cantinho seguro.",
        },
        {
          type: "steps",
          title: "Passo a passo (leve 1 a 3 semanas)",
          items: [
            "Deixe a caixa aberta, num lugar da casa onde ele passa tempo, com uma mantinha com o cheiro dele.",
            "Coloque petiscos perto, depois na porta, depois lá dentro. Deixe ele explorar sozinho.",
            "Sirva algumas refeições dentro da caixa.",
            "Quando ele entrar tranquilo, feche a porta por 2 segundos, dê petisco e abra. Aumente o tempo aos poucos.",
            "Depois, levante a caixa do chão por um instante; depois dê uma voltinha pela casa; depois um passeio curto de carro.",
          ],
        },
        {
          type: "tip",
          text: "Caixas que abrem por cima ou que desmontam ao meio facilitam muito tirar o gato no consultório sem puxá-lo para fora.",
        },
      ],
    },
    {
      title: "Escovação, unhas e manuseio",
      icon: "brush",
      blocks: [
        { type: "p", text: "Acostumar o gato a ser tocado facilita os cuidados em casa e as consultas. Vá devagar e respeite os sinais dele." },
        {
          type: "steps",
          title: "Acostumando ao toque",
          items: [
            "Com o gato relaxado, toque rapidamente uma pata e dê um petisco.",
            "Aos poucos, segure a pata por 1 segundo, depois pressione de leve a almofadinha para a unha aparecer. Petisco a cada etapa.",
            "Faça o mesmo com orelhas, boca e barriga, um pouquinho por dia.",
            "Apresente a escova e o cortador antes de usar: deixe ele cheirar e ganhe petisco.",
          ],
        },
        {
          type: "warn",
          title: "Ao cortar as unhas",
          text: "Corte só a **pontinha transparente**. A parte rosada tem vasos e nervos e sangra se for cortada. Na dúvida, peça para o veterinário ensinar. Corte uma ou duas unhas por dia, se for preciso.",
        },
        { type: "tip", text: "Sinais de que é hora de parar: rabo batendo, orelhas para trás, pele tremendo nas costas ou pupilas muito dilatadas." },
      ],
    },
    {
      title: "Brincadeira e gasto de energia",
      icon: "wand",
      blocks: [
        {
          type: "p",
          text: "Muitos “problemas de comportamento” (atacar pés, miar de madrugada, derrubar objetos) são, na verdade, **energia de caça acumulada**. Gatos precisam brincar todos os dias.",
        },
        {
          type: "steps",
          title: "A brincadeira ideal (2 vezes por dia, 10 a 15 minutos)",
          items: [
            "Use uma varinha com penas ou um ratinho na ponta e imite uma presa: esconda atrás de móveis, faça pausas, deixe escapar.",
            "Deixe ele “capturar” várias vezes. Se ele nunca pega, fica frustrado.",
            "Diminua o ritmo no final e termine com uma última captura.",
            "Logo depois, ofereça a refeição ou um petisco: caçar, comer, se limpar e dormir é o ciclo natural do gato.",
          ],
        },
        {
          type: "warn",
          text: "Não use as mãos ou os pés como brinquedo, mesmo com filhotes. Ele aprende que mão é presa e, adulto, vai morder e arranhar de verdade. Laser só se terminar com um brinquedo físico para ele “pegar”.",
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
            ["**Sobe na bancada e na mesa**", "Ofereça lugares altos permitidos (prateleiras, nichos, torre perto da janela) e recompense quando ele usar. Não deixe comida exposta na bancada."],
            ["**Ataca os pés e as mãos**", "Mais brincadeira com varinha. Quando ele atacar, pare de se mexer e redirecione para um brinquedo."],
            ["**Mia de madrugada**", "Brinque bem antes de dormir e sirva uma refeição logo depois. Não atenda os miados noturnos, para não reforçar."],
            ["**Morde durante o carinho**", "Muitos gatos têm limite para carinho. Faça sessões curtas e pare antes dos sinais de incômodo (rabo batendo, orelhas para trás)."],
            ["**Derruba objetos**", "Geralmente é tédio ou pedido de atenção. Enriqueça o ambiente com brinquedos, arranhadores, esconderijos e janelas teladas."],
          ],
        },
        {
          type: "vet",
          title: "Quando procurar o veterinário",
          text: "Mudanças repentinas de comportamento, como agressividade nova, esconder-se o tempo todo, parar de usar a caixa, lamber-se demais ou parar de comer, podem ser sinal de dor ou doença. Leve ao veterinário antes de pensar em treino.",
        },
      ],
    },
    {
      title: "Plano de treino de 4 semanas",
      icon: "clock",
      blocks: [
        { type: "p", text: "Uma sugestão de ritmo. Gatos aprendem no próprio tempo: se for preciso, fique mais uma semana na mesma etapa." },
        {
          type: "table",
          head: ["Semana", "Foco", "Meta da semana"],
          rows: [
            ["**1**", "Marcador, nome e vir quando chamado", "Vem até você ao ouvir o chamado, dentro do mesmo cômodo."],
            ["**2**", "Toque no alvo e arranhador", "Encosta o focinho no alvo; usa o arranhador pelo menos uma vez por dia."],
            ["**3**", "Caixa de transporte e manuseio", "Entra na caixa aberta sozinho; aceita que você segure a pata por alguns segundos."],
            ["**4**", "Senta e revisão", "Senta antes da comida; repete os comandos em cômodos diferentes."],
          ],
        },
        { type: "h2", icon: "check", text: "Checklist diário" },
        {
          type: "checklist",
          items: [
            "1 ou 2 sessões de treino de até 3 minutos",
            "2 brincadeiras de caça de 10 a 15 minutos",
            "Caixa de areia limpa",
            "Arranhadores perto dos lugares favoritos dele",
            "Terminei o treino com um acerto",
          ],
        },
      ],
    },
  ],
  closingTitle: "Respeito, paciência e petiscos",
  closing: [
    {
      type: "p",
      text: "Treinar um gato é construir confiança. Cada vez que ele escolhe participar, vocês ficam mais próximos. Celebre os pequenos avanços e respeite o tempo dele. 🐾",
    },
    {
      type: "tip",
      title: "Uma última dica",
      text: "Cadastre as vacinas e vermífugos no Kit do Pet e mantenha os dados do seu gato sempre atualizados na página do QR code.",
    },
  ],
  legal:
    "Este guia tem caráter educativo e não substitui a orientação de médico-veterinário ou comportamentalista felino. Cada animal é único: em caso de dúvida, problemas de saúde ou de comportamento, procure um profissional. © Kit do Pet. Uso pessoal; proibida a revenda ou distribuição.",
};
