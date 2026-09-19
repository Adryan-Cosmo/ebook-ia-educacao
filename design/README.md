# Handoff: Trilha formativa "Ferramentas de IA na Educação Básica"

## Visão geral

Ebook-trilha web de leitura longa (~2 h) para formação de professores em IA generativa. É um documento único de rolagem contínua, dividido em 11 seções âncora: capa, home da trilha, sete módulos (0 a 6), glossário e referências. Sobre a leitura há uma camada de aprendizagem: caderno de anotações por módulo, dois exercícios interativos, duas checklists, um quiz de três questões, marcação de módulo concluído, busca por atalho, tema claro/escuro, backup do progresso em arquivo e impressão do material.

Tudo o que o cursista produz vive em `localStorage` no navegador dele. Não há backend, conta, autenticação nem telemetria — e essa decisão é deliberada, não uma pendência: o material é distribuível como arquivo. Ao portar para um ambiente com backend, ver "Decisões a preservar" ao fim deste documento antes de mover estado para o servidor.

## Sobre os arquivos deste pacote

Os arquivos incluídos são **referências de design feitas em HTML** — protótipos que mostram aparência e comportamento pretendidos, não código de produção para copiar. A tarefa é **recriar estes designs no ambiente do codebase de destino** (React, Vue, Svelte, SwiftUI, nativo) usando os padrões e bibliotecas já estabelecidos lá. Se ainda não houver ambiente, escolha o framework mais adequado ao projeto e implemente ali.

Dois pontos sobre a tecnologia do protótipo, para evitar interpretações erradas:

- O arquivo `.dc.html` é um componente de design com template declarativo e uma classe de lógica. Os marcadores `{{ nome }}` no template são valores devolvidos por `renderVals()`, e `<sc-for list="{{ x }}" as="item">` é repetição de lista. Trate ambos como pseudocódigo de binding, não como sintaxe a reproduzir.
- **Todo o estilo é inline, por exigência do ambiente do protótipo.** Isso não é uma recomendação de arquitetura. No codebase de destino, extraia os valores para o sistema de estilos que já existir (CSS modules, styled-components, Tailwind, tokens nativos). A tabela de tokens abaixo existe justamente para isso.

## Fidelidade

**Alta fidelidade (hifi).** Cores, tipografia, espaçamentos, estados e microcópia estão finalizados e auditados. O contraste de todos os pares de cor foi medido contra WCAG 2.1 AA e passa nos dois temas. Recrie a interface fielmente, usando as bibliotecas do codebase.

## Tokens de design

Declarados como variáveis CSS em `:root` e sobrescritos em `[data-theme="dark"]`.

### Cores — tema claro

| Token | Valor | Uso |
| --- | --- | --- |
| `--paper` | `#FAF7F0` | Fundo da página |
| `--paper-2` | `#F1ECDF` | Fundo de card, seção alternada |
| `--ink` | `#1C1B16` | Títulos, texto forte |
| `--ink-soft` | `#403D34` | Corpo de texto |
| `--muted` | `#6E685A` | Legendas, metadados, descrições |
| `--rule` | `#E1DBCC` | Réguas, divisores, bordas decorativas |
| `--edge` | `#8F8770` | Bordas de componente interativo (campo, caixa, botão) |
| `--accent` | `#2A4C8F` | Cor de marca: rótulos, links, numeração, estado ativo |
| `--accent-strong` | `#8F3529` | Hover de link |
| `--accent-soft` | `rgba(42,76,143,.12)` | Preenchimento de estado selecionado |
| `--mark` | `rgba(224,178,74,.42)` | Marca-texto sobre termo-chave |

### Cores — tema escuro (`[data-theme="dark"]`)

| Token | Valor |
| --- | --- |
| `--paper` | `#141310` |
| `--paper-2` | `#1E1C15` |
| `--ink` | `#ECE7D9` |
| `--ink-soft` | `#C8C2B2` |
| `--muted` | `#9A9280` |
| `--rule` | `#302D24` |
| `--edge` | `#6A6353` |
| `--accent` | `#7FA6E8` |
| `--accent-strong` | `#E0995A` |
| `--accent-soft` | `rgba(127,166,232,.18)` |
| `--mark` | `rgba(224,178,74,.22)` |

### Cores semânticas (anatomia do prompt e retornos)

| Token | Claro | Escuro | Uso |
| --- | --- | --- | --- |
| `--c1` / `--c1s` | `#1D6A46` / `rgba(29,106,70,.14)` | `#66C492` / `rgba(102,196,146,.18)` | Parte 1 · papel; acerto; "pode" |
| `--c2` / `--c2s` | `#5B3E8F` / `rgba(91,62,143,.14)` | `#B49AE8` / `rgba(180,154,232,.20)` | Parte 2 · contexto |
| `--c3` / `--c3s` | `#9A3B2E` / `rgba(154,59,46,.14)` | `#E08A78` / `rgba(224,138,120,.18)` | Parte 3 · tarefa; erro; "evite" |
| `--c4` / `--c4s` | `#8A6A15` / `rgba(138,106,21,.16)` | `#D9B45E` / `rgba(217,180,94,.18)` | Parte 4 · formato; avisos |

### Contraste medido (tema claro, sobre `--paper`)

| Par | Razão | AA |
| --- | --- | --- |
| `--ink-soft` / `--paper` | 9.8:1 | ✅ corpo |
| `--muted` / `--paper` | 5.18:1 | ✅ corpo |
| `--muted` / `--paper-2` | 4.70:1 | ✅ corpo |
| `--accent` / `--paper` | 7.76:1 | ✅ corpo |
| `--edge` / `--paper` | 3.35:1 | ✅ componente |
| `--c3` / `--paper` | 6.4:1 | ✅ corpo |

**Não clareie `--muted` nem `--edge`.** Ambos já estiveram mais claros e reprovavam; foram escurecidos em auditoria. `--muted` carrega as descrições de 14–15px de todos os módulos e do glossário, e `--edge` é o único limite perceptível dos campos.

### Tipografia

Três famílias do Google Fonts:

- **Lora** (serif) — `ital,wght@0,400;0,500;0,600;1,400;1,500`. Títulos e corpo de texto de leitura.
- **IBM Plex Sans** — `wght@400;500;600`. Interface, rótulos, legendas, botões.
- **IBM Plex Mono** — `wght@400;500`. Prompts, código, numeração, metadados, teclas.

Escala (o corpo usa `clamp()` para fluidez; os valores são mín./máx.):

| Papel | Família | Tamanho | Peso | Altura de linha |
| --- | --- | --- | --- | --- |
| H1 capa | Lora | `clamp(40px, 8vw, 78px)` | 600 | 1.04 |
| Subtítulo capa | Lora | `clamp(19px, 2.4vw, 26px)` | 400 | 1.5 |
| H2 módulo | Lora | `clamp(34px, 6vw, 56px)` | 600 | 1.06 |
| Abertura de módulo (itálico) | Lora | `clamp(18px, 2.2vw, 22px)` | 400 itálico | 1.5 |
| H3 subseção | Lora | `clamp(24px, 4vw, 34px)` | 600 | 1.2 |
| Corpo de leitura | Lora | 20px | 400 | 1.75 |
| Corpo em card | IBM Plex Sans | 15–16px | 400 | 1.6 |
| Legenda / metadado | IBM Plex Sans | 13–14px | 400 | 1.55 |
| Rótulo de seção | IBM Plex Sans | 11–12px, `letter-spacing:.2em`, caixa alta | 600 | 1 |
| Prompt / código | IBM Plex Mono | 15px | 400 | 1.7 |
| Numeração / teclas | IBM Plex Mono | 12–13px | 500 | 1 |

Letter-spacing negativo (`-.015em` a `-.02em`) nos títulos grandes de Lora. Rótulos de seção sempre em caixa alta com `letter-spacing` de `.16em` a `.24em`.

### Espaçamento e forma

- Medida de leitura: `max-width: 672px`, centralizada. Blocos largos (grade de ferramentas, anatomia): `820px`.
- Padding de seção: `clamp(40px,7vh,90px) clamp(16px,4vw,40px) clamp(50px,9vh,110px)`.
- Distância entre subseções de um módulo: `margin-top: 56px`.
- Padding interno de card: `18px 20px` (compacto) a `24px 26px` (destaque).
- Raios: `999px` pílula/botão · `16px` moldura de destaque · `14px` card grande · `12px` card · `10px` campo, alternativa · `8px`/`6px` caixa pequena · `3px` marca-texto.
- Grades responsivas sempre `repeat(auto-fit, minmax(Npx, 1fr))` — nunca `1fr 1fr` fixo. `minmax(230px…)` para pares, `minmax(260px…)` para a grade de 4 células do fechamento (garante 2×2, sem trilha vazia), `minmax(210px…)` para a anatomia.
- Réguas de 1px em `--rule`; hairline de grade por `box-shadow: 0 0 0 1px var(--rule)` na célula, **não** pelo fundo do contêiner (uma grade incompleta exporia o fundo).
- Transições: 120ms a 250ms. `prefers-reduced-motion: reduce` desliga todas.

### Ponto de quebra

Único, em **1080px**. Acima: barra lateral fixa de 248px + `padding-left: 280px` no conteúdo. Abaixo: barra lateral fora da tela (`translateX(-100%)` **e** `visibility: hidden`, para sair da ordem de tabulação), aberta por botão. Segundo ajuste em **640px** para a busca em tela cheia.

## Telas / seções

### 1. Capa (`#capa`)

**Propósito:** dizer em menos de cinco segundos o que é, para quem, por quem e quanto custa de tempo.

**Layout:** coluna única de 820px. Rótulo de seção em caixa alta → H1 → subtítulo → linha de ações.

**Componentes:**
- H1 "Ferramentas de **IA** na Educação Básica" — "IA" em Lora itálico `--accent`.
- Subtítulo em Lora 19–26px `--ink-soft`, largura máxima 640px.
- Botão primário: rótulo dinâmico — "Começar a trilha" na primeira visita, "Ver a trilha" se houver leitura salva. Pílula, fundo `--ink`, texto `--paper`, padding `14px 22px`, hover troca fundo para `--accent`.
- Botão de retomada (condicional): "Continuar em Módulo N", pílula de contorno `--edge`, ícone de seta circular. **Só aparece** se houver `lastSection` salva e ela não for a home.
- Bloco de metadados: autor, 7 módulos, licença CC BY 4.0, leitura ~2 h — IBM Plex Sans 14px `--muted`.

### 2. Home da trilha (`#trilha`)

**Propósito:** dar a visão do percurso e permitir salto direto.

**Layout:** lista vertical de sete linhas, cada uma `grid-template-columns: 64px 1fr auto`, separadas por régua de 1px inferior.

**Cada linha:** número em Lora 34px (módulo atual em `--accent`, os outros em `--muted`) · título em Lora 21px 600 + descrição em Plex Sans 14px `--muted` · etiqueta de estado em caixa alta 10px. Hover desloca o número em 14px (`transform: translateX(14px)`).

### 3. Módulos 0 a 6 (`#modulo-0` … `#modulo-6`)

Todos seguem a mesma estrutura, e essa repetição é o sistema — não varie sem motivo:

1. **Cabeçalho:** rótulo de seção + H2 + parágrafo de abertura em itálico.
2. **Card "Neste módulo":** lista numerada de âncoras internas (`#mN-slug`) + linha de metadados com duração, pré-requisito e recursos (ícones SVG de relógio, marco e lápis).
3. **Subseções numeradas** (`01`, `02`, …) com H3 e corpo de leitura.
4. **Caderno do cursista:** card de borda tracejada `--accent`, rótulo visível com `for`/`id`, contador de palavras à direita, `<textarea>` com fundo e borda próprios.
5. **Referências do módulo:** lista compacta.
6. **Rodapé de ações:** "Marcar como concluído" + navegação anterior/próximo. Marcado com `data-print-hide`.

Fundos alternam entre `--paper` e `--paper-2` de um módulo para o outro, criando ritmo. **Máximo de duas cores de fundo em todo o documento.**

Peças específicas que merecem atenção:

- **Anatomia do prompt (Módulo 1):** um exemplo de prompt com quatro trechos marcados em `--c1s` a `--c4s`, cada um com borda inferior de 2px na cor cheia e sobrescrito numerado. Imediatamente abaixo, **sem intervalo** (borda compartilhada, `border-radius` `0 0 12px 12px`), a grade de quatro células explicando cada parte. A adjacência é intencional: separados, o vínculo cor-número se perde na rolagem.
- **Cards de padrão de prompt (Módulo 1):** quatro cards com botão "Copiar" no canto. O prompt em Mono 15px com `overflow-wrap: anywhere`; marcadores substituíveis como `[disciplina/ano]` em `--accent`.
- **Exercício de alucinação (Módulo 1):** um parágrafo com três trechos clicáveis (`<button data-k="p1|p2|p3">`) que **são o texto corrido**, não controles. Estado inativo: sublinhado pontilhado 2px `--accent`. Ativo: fundo `--accent-soft` + `box-shadow: inset 0 -2px 0 var(--accent)`. Ao marcar, revela a explicação correspondente; contador `aria-live` só aparece após o primeiro toque. **A melhor peça didática do material** — ao portar, preserve o toque para desmarcar e o enunciado que diz quantos trechos são clicáveis.
- **Checklists (Módulos 5 e 6):** linhas `grid-template-columns: 22px 1fr`, caixa de 22px com borda de 2px, contador "N de M" em `aria-live`.
- **Quiz (Módulo 6):** três questões, alternativas como botões de largura total. Respondida: a correta em `--c1s`/`--c1`, a escolhida errada em `--c3s`/`--c3`, as demais em `opacity: .55`. Retorno em duas partes — confirmação ("Isso mesmo" / "Não é essa") + explicação. Resposta trocável e botão "Refazer quiz".

### 4. Fechamento de percurso (`#m6-declaracao`)

**Propósito:** encerrar a trilha reconhecendo o que a pessoa produziu — explicitamente **não** um certificado.

Decisão de produto relevante: havia aqui um certificado com moldura e "Declaro que". Foi removido porque não há instituição emissora, código de validação nem carga horária auditável — a forma prometia o que o texto negava. **Não reintroduza um certificado** sem um emissor real por trás.

**Componentes:**
- Parágrafo que diz de saída que a trilha não emite certificado e por quê.
- Campo de nome, explicado como "aparece no topo do caderno exportado".
- Painel "O que você produziu": grade 2×2 com módulos concluídos, total de palavras escritas e espaços preenchidos, itens marcados nas checklists, resultado do quiz. Data de conclusão discreta no cabeçalho do painel, registrada no primeiro carregamento em que os sete módulos estão marcados.
- Parágrafo de fecho remetendo a validação de horas a quem tem competência para emiti-la.
- Card "Backup do caderno" (ver abaixo).

### 5. Glossário (`#glossario`)

Lista de definição de 10 termos, linhas `grid-template-columns: 200px 1fr` separadas por régua. Termo em Lora 18px 600, definição em Plex Sans `--muted`. Alimenta a busca.

Oito termos recebem link da **primeira menção** no corpo dos módulos: Prompt, Engenharia de prompt, Alucinação, TPACK, LGPD, Viés, Data de corte, Agente. O link herda a cor do texto e leva só um sublinhado pontilhado `--edge`; no hover, cor e sublinhado viram `--accent`. Nunca o azul de link padrão no meio da prosa.

### 6. Referências (`#referencias`)

Lista numerada em ABNT NBR 6023. Ao fim, bloco "Como citar esta obra" com a citação ABNT, o BibTeX em `<pre>` e botões de cópia com confirmação em `aria-live`.

**Pendência de conteúdo:** o DOI do Zenodo ainda não existe. O bloco hoje declara que o DOI será acrescentado às duas formas quando o depósito for concluído. Nunca exiba um DOI de placeholder — houve um `10.5281/zenodo.XXXXXXX` no material e ele foi removido por destruir a credibilidade do bloco.

## Navegação e chrome

### Barra lateral (`#sidenav`)

Fixa, 248px, 100vh, rolável. Título da obra no topo, rótulo "Sumário", 11 links. Estados:
- **Ativo** (scroll-spy): fundo `--accent-soft`, `box-shadow: inset 3px 0 0 var(--accent)`.
- **Concluído**: tique em `--accent` à direita **e** `aria-label` acrescentando "— módulo concluído" (o tique visual sozinho é invisível para leitor de tela).

Abaixo de 1080px sai da tela com `visibility: hidden`, abre por botão, fecha por: escolha de item, clique no scrim, `Esc` (que devolve o foco ao botão) e o próprio botão. `aria-expanded` e `aria-controls` no gatilho.

### Cabeçalho fixo (`#topbar`)

54px, fundo translúcido com `backdrop-filter: blur(8px)`, régua inferior. Contém: botão de menu (abaixo de 1080px), título curto, botão de busca com tecla de atalho, chip de progresso, porcentagem de rolagem, botão de tema.

**Dois indicadores distintos, deliberadamente hierarquizados:**
- **Chip "N/7 módulos"** — o progresso real. Pílula com ponto que acende em `--accent`; é o indicador principal.
- **Porcentagem de rolagem** — 11px, `opacity: .75`, `aria-hidden`. Posição na página, secundária.

Barra de 2px sob o cabeçalho com `role="progressbar"` e `aria-valuenow` atualizado na rolagem.

### Busca (`Ctrl+K` / `Cmd+K`)

Diálogo modal: `role="dialog"`, `aria-modal="true"`, campo com `aria-label`, foco contido (Tab preso), foco devolvido ao gatilho no fechamento. Filtra as 11 seções e os 10 termos do glossário em tempo real. Setas percorrem, Enter abre, `Esc` fecha. Resultado selecionado: fundo `--paper-2` + `box-shadow: inset 3px 0 0 var(--accent)` e `aria-selected`. Abaixo de 640px, tela cheia (`100dvh`).

O rótulo da tecla é sensível à plataforma: `⌘K` em Mac/iOS, `Ctrl K` no resto.

## Interações e comportamento

| Interação | Comportamento |
| --- | --- |
| Alternar tema | Troca `data-theme` no `<html>`, grava a escolha, atualiza `color-scheme` (barra de rolagem e controles nativos acompanham) e o rótulo do botão ("Escuro" ↔ "Claro") com `aria-pressed` |
| Digitar no caderno | Grava por tecla, recalcula a contagem de palavras e o indicador "· salvo" |
| Marcar item de checklist | Alterna e grava; contador `aria-live` |
| Responder o quiz | Registra, revela retorno; resposta trocável; "Refazer quiz" zera |
| Marcar trecho do exercício | Alterna e revela a explicação; contador aparece só após o primeiro toque |
| Marcar módulo concluído | Alterna, grava, atualiza o tique da barra lateral, o chip do cabeçalho e o painel de fechamento |
| Copiar prompt / citação | `navigator.clipboard`; confirmação temporária de ~1,4 s (prompt) ou 2,6 s (citação) |
| Exportar caderno | Abre janela nova com o caderno formatado e dispara a impressão; se o pop-up for bloqueado, exibe aviso `role="alert"` com instrução |
| Baixar backup | Gera `.json` com anotações, checklists, quiz, módulos concluídos, nome e data; nome do arquivo com a data |
| Restaurar backup | Lê o arquivo, valida a origem, repõe campos, armazenamento e estado; arquivo estranho é recusado com aviso |
| Imprimir a trilha | `window.print()` com folha de estilo de impressão dedicada |
| Rolar | Atualiza a barra de progresso, o `aria-valuenow`, o item ativo da barra lateral e grava a seção corrente |

### Estados de erro

Três, todos já desenhados — mantenha-os:
1. **Armazenamento indisponível** (navegação privada, cota cheia): faixa `role="alert"` no cabeçalho recomendando exportar em PDF, e os contadores passam a dizer "· não salvo".
2. **Pop-up bloqueado** na exportação: aviso com instrução para liberar.
3. **Backup inválido**: mensagem em `--c3` pedindo um arquivo gerado pela própria trilha.

## Estado

Tudo em memória no componente e espelhado em `localStorage` sob o prefixo `ebook2.`:

| Chave | Conteúdo |
| --- | --- |
| `theme` | `light` \| `dark` |
| `caderno-mod0` … `caderno-mod6`, `ex-mod1`, `ex-mod4` | Texto de cada uma das 9 áreas (gravadas cruas) |
| `lgpd`, `impl` | Mapa índice → booleano das checklists |
| `quiz` | Mapa questão → índice escolhido |
| `done` | Mapa id de módulo → booleano |
| `certName` | Nome digitado |
| `doneAt` | ISO 8601 do momento em que os sete módulos ficaram marcados |
| `lastSection` | Id da última seção lida |

**Armadilha já corrigida, não reintroduza:** as chaves de estado são serializadas em JSON, as nove chaves de texto são cruas. `lastSection` já foi gravada crua e serializada em JSON na restauração de backup, o que corrompia o ponteiro de retomada. Mantenha a simetria: se o codebase de destino tiver uma camada de persistência, passe tudo por ela.

**Estado derivado (nunca duplicado no DOM):** rótulo do botão de tema, contadores de palavras, indicador "salvo", chip de progresso, painel do fechamento. Houve um defeito de origem em que esses valores eram escritos direto no DOM e voltavam ao valor inicial a cada re-render — o botão dizia "Escuro" no modo escuro. **Derive tudo do estado.**

## Acessibilidade — requisitos verificados

Estes itens foram auditados e passam. Trate-os como requisitos, não sugestões:

- Contraste de texto ≥ 4.5:1 e de componente ≥ 3:1 nos dois temas (tabela acima).
- Alvo de toque: 36px de altura no desktop, **44×44px sob `pointer: coarse`**.
- Hierarquia de headings sem salto: um `h1`, `h2` por módulo, `h3` por subseção.
- Todos os 9 campos de texto e o campo de nome com `<label>` visível associado por `for`/`id` — placeholder não é rótulo.
- `focus-visible` global: contorno de 2px `--accent` com `offset` de 2px.
- Skip link para o conteúdo, primeiro elemento focável da página.
- `aria-label` nas 11 seções, espelhando o `h2`.
- `role="progressbar"` com valor atualizado; `aria-live="polite"` em todo retorno que muda sem recarregar (quiz, checklists, exercício, cópia, backup).
- Navegação completa por teclado, incluindo setas e Enter nos resultados de busca.
- Ícones funcionais como **SVG inline com `aria-hidden="true"`** — 34 deles. O material usava glifos tipográficos (`⏱ ◷ ✎ ▤ ↔ ⌕ ☰`) que renderizavam de forma inconsistente entre sistemas e eram anunciados com nomes inesperados. **Não volte a usar glifos como ícone.**
- `prefers-reduced-motion: reduce` desliga transições.

## Impressão

Folha dedicada, ativada por `@media print`. O documento assume a responsabilidade pela impressão (`<meta name="omelette-owns-print">` no protótipo — no destino, a equivalência é ter CSS de impressão próprio em vez de deixar o navegador paginar a tela).

Regras:
- Tokens forçados para papel: fundos brancos, texto preto, `print-color-adjust: exact`.
- Cada `section[data-spy]` começa em página nova; a capa não.
- Fora: barra lateral, cabeçalho, busca, barra de progresso, contadores, SVGs, e todo `button` sem `data-print-keep`.
- Fora por marcação explícita (`data-print-hide`): os 7 rodapés de ação, o card de atalhos, o card de backup, os dois botões da capa.
- Dentro com reset neutro (`data-print-keep`): as 11 linhas de checklist e as 9 alternativas do quiz — imprimem como caixas de contorno preto, preenchíveis à mão. O tique imprime em preto quando marcado, então o papel reflete o estado real.
- Dentro como texto corrido (`data-print-text`): os três trechos do exercício de alucinação. Sem moldura de botão, com sublinhado pontilhado — eles **são a frase**, e escondê-los deixava o parágrafo sem sentido.
- `break-inside: avoid` em cards, citações, prompts, células de grade e itens de lista. `break-after: avoid` nos títulos.
- Áreas de caderno: 26mm de altura com borda, espaço para escrever à mão.
- Escala tipográfica em pontos: 30pt (H1), 21pt (H2), 14pt (H3), 11pt (corpo).

São dois documentos com propósitos distintos: **imprimir a trilha** produz o material para trabalhar; **exportar o caderno** produz o registro do que a pessoa escreveu.

## Assets

Nenhuma imagem ou ícone externo. Todos os 34 ícones são SVG inline de traço (`stroke-width: 1.8`, `stroke-linecap: round`), desenhados no próprio documento. Fontes vêm do Google Fonts.

**Pendência de conteúdo:** os Módulos 2 e 3 pedem capturas de tela reais, ainda não produzidas — tela inicial de ChatGPT, Claude, Gemini e Manus; uma tela de configuração de privacidade; Canva Educação com um modelo aberto; e um GIF curto do fluxo prompt → material pronto. Ao inserir, cada uma precisa de `alt` descritivo e nenhuma pode conter nome de aluno ou e-mail visível.

## Decisões a preservar

Cada uma destas resolveu um problema concreto. Mudá-las sem motivo reintroduz o problema:

1. **Estética de livro, não de curso online.** Papel creme, serif para leitura, sem gradientes, sem emoji, sem selos. O público é docente, e o material compete com apostila, não com infoproduto.
2. **Máximo de duas cores de fundo.** O ritmo entre módulos vem da alternância, não de ornamento.
3. **Medida de 672px.** Cerca de 70 caracteres por linha, faixa confortável para leitura longa.
4. **Sem certificado.** Ver "Fechamento de percurso".
5. **Nada de gamificação.** Sem selos, sequências, tempo de leitura ou comparação com outros usuários. Foi considerado e recusado: não serve a quem está se formando.
6. **Estado local, sem conta.** Se o destino tiver backend e login, sincronizar é legítimo — mas mantenha o material utilizável sem conta e preserve o backup em arquivo. Parte do público usa computador compartilhado de laboratório.
7. **Interação que exige produção.** Caderno, exercícios e checklists pedem escrita e decisão, não cliques de avanço.

## Verificação recomendada

Nenhuma auditoria heurística substitui observação. Antes de considerar a implementação pronta, teste os Módulos 1 e 6 com cinco docentes de baixa familiaridade digital, no celular deles.

## Arquivos deste pacote

| Arquivo | O que é |
| --- | --- |
| `Ebook Trilha IA v2.dc.html` | A trilha completa: template, lógica e estilo. Fonte de verdade do design. |
| `Trilha IA — versão offline.html` | Mesma trilha empacotada em arquivo único com fontes e runtime embutidos. Abre sem internet. Gerado a partir do arquivo acima — não edite. |
| `Auditoria UX - Trilha IA.dc.html` | Auditoria de UX/UI em 6 dimensões que originou as correções descritas aqui. Painel com filtro por severidade, tabela de contraste e checklist WCAG. Útil para entender o porquê de várias decisões. |
