# Ferramentas de IA na Educação Básica

Trilha formativa progressiva para professores: do letramento digital à engenharia de prompts, com base em TPACK, BNCC e no guia da UNESCO. Leitura de cerca de 2 horas, em sete módulos.

**v2.0** · Adryan Cavalcante Cosmo · Licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/deed.pt-br)

## O que tem na trilha

Um documento único de rolagem contínua: capa, home da trilha, módulos 0 a 6, glossário e referências. Sobre a leitura há uma camada de aprendizagem:

- caderno de anotações por módulo, com contador de palavras;
- exercício de construção de prompt e exercício de avaliação crítica (alucinação, viés, desatualização);
- checklists de proteção de dados (LGPD) e de implementação;
- quiz final de três questões;
- marcação de módulo concluído e painel "O que você produziu";
- busca por atalho (`Ctrl K` / `⌘K`), tema claro/escuro;
- backup do progresso em arquivo `.json`, exportação do caderno em PDF e impressão da trilha.

## Como usar

É um site estático, sem build nem dependências. Abra o `index.html` no navegador ou sirva a pasta:

```bash
python -m http.server 8000
```

Depois acesse `http://localhost:8000`. Para publicar, qualquer hospedagem estática serve (GitHub Pages, por exemplo, apontando para a raiz da branch `main`).

## Privacidade

Tudo o que o cursista escreve fica no `localStorage` do navegador dele, sob o prefixo `ebook2.`. Não há backend, conta, autenticação nem telemetria, e isso é intencional: o material funciona como arquivo distribuível. O backup em arquivo existe para quem troca de computador ou usa máquina compartilhada.

## Estrutura

| Arquivo | Conteúdo |
| --- | --- |
| `index.html` | Todo o conteúdo da trilha, em HTML semântico |
| `style.css` | Tokens de design (cores, tipografia, espaçamento) e componentes |
| `print.css` | Folha de impressão: fundo branco, uma seção por página, checklists preenchíveis à mão |
| `app.js` | Estado, persistência, busca, quiz, checklists, backup e exportação |
| `assets/favicon.svg` | Ícone |
| `design/` | Handoff do redesign: protótipo, auditoria de UX e documentação das decisões |

## Design

O redesign segue o handoff em [`design/README.md`](design/README.md), que documenta tokens, contraste medido (WCAG 2.1 AA nos dois temas), comportamento de cada componente e as decisões a preservar: estética de livro, no máximo duas cores de fundo, medida de 672px, nada de gamificação e nada de certificado sem um emissor real.

Os arquivos em `design/` são referências, não código de produção:

- `Ebook Trilha IA v2.dc.html` + `support.js`: protótipo-fonte do design.
- `Trilha IA - versão offline.html`: o mesmo protótipo empacotado num arquivo único que abre sem internet.
- `Auditoria UX - Trilha IA.dc.html`: auditoria de UX/UI que originou as correções.

### Diferenças em relação ao protótipo

- Estilos extraídos para classes em `style.css`; no protótipo, eles estavam inline por exigência da ferramenta de design.
- A grade da anatomia do prompt usa `minmax(260px, 1fr)` para fechar em 2×2 na medida de 672px (com 210px ficava 3+1, com uma trilha vazia).
- Os links de termos no corpo levam direto ao termo no glossário (`#termo-…`), e a busca também.
- O atalho mostrado no glossário segue a plataforma (`⌘K` ou `Ctrl K`), como no resto da página.
- O botão "Exportar caderno" usa ícone SVG no lugar do glifo `⤓`.
- A camada escura do menu lateral fica abaixo do menu (no protótipo, ela o cobria).

## Pendências de conteúdo

- **DOI do Zenodo**: será acrescentado às duas formas de citação quando o depósito for concluído. Não use DOI de placeholder.
- **Capturas de tela** dos Módulos 2 e 3 (ChatGPT, Claude, Gemini, Manus, configuração de privacidade, Canva Educação e um GIF do fluxo prompt → material). Cada uma precisa de `alt` descritivo e não pode mostrar nome de aluno nem e-mail.

## Como citar

> COSMO, Adryan Cavalcante. *Ferramentas de IA na Educação Básica: uma trilha formativa para professores*. 2. ed. [S. l.]: publicação independente, 2026. E-book.
