# Editando o conteúdo

Todo o conteúdo da trilha mora em [`src/data/content.json`](../src/data/content.json). Os tipos estão em [`src/data/index.ts`](../src/data/index.ts). Depois de editar, rode `npm run check`: os testes conferem ids, ligações e formato.

## Estrutura do arquivo

| Chave | Conteúdo |
| --- | --- |
| `LINES` | As 7 linhas: `{ id, name, note, mods: [números dos tópicos] }`. A ordem de `mods` é a ordem das fileiras no esquema. |
| `M` | Os tópicos, por número (`"1"` a `"30"`). |
| `EDGES` | Ligações `[de, para]` (obrigatória) ou `[de, para, 1]` (recomendada). |
| `PAR` | Linha paralela (carreira, inglês, certificações). |
| `POS` | Cards do comparativo de pós. |
| `PLAN` | Linhas do cronograma, com mês inicial e final (0 = dez/2026, 12 = dez/2027). |

## Um tópico

```jsonc
"12": {
  "t": "Banco de dados relacional I",      // título completo
  "s": "Banco I",                            // nome curto (blocos e esquema)
  "why": "Modelar bem e consultar rápido…", // por que estudar
  "top": [                                   // checklist, em ordem
    "#Modelagem",                            //   "#" = cabeçalho de grupo (não conta)
    "Normalização",
    "!Paginação por offset vs cursor",       //   "!" = etiqueta "já usa"
    ["Outbox pattern", 19]                   //   [texto, nº] = link para outro tópico
  ],
  "res": [["livro", "Use The Index, Luke", "https://use-the-index-luke.com/"]],
  "tip": "Texto opcional de prática",
  "g": "M14 16h20M14 24h20…",                // traço do ícone (path SVG, caixa 48×48)
  "lc": [[175, "Combine Two Tables", "combine-two-tables"]], // LeetCode: nº, nome, slug
  "ex": "Pergunta do modo Explique",
  "pj": "Enunciado do Projeto"
}
```

Tipos de recurso aceitos em `res`: `artigo`, `video`, `livro`, `referencia`, `curso`, `pratica`. Só links `https://` viram links clicáveis.

## Cuidado: ids posicionais

O id de um subtópico é a posição dele na lista, sem contar os cabeçalhos: o terceiro item de U12 é `m12.2`. Isso tem uma consequência:

> **Inserir ou remover um item no meio da lista desloca as marcações salvas de quem já usa o site.**

Para não bagunçar o progresso:

- adicione itens novos **no fim** da lista do tópico;
- para tirar um item, troque o texto em vez de apagar a linha;
- se precisar reorganizar, aumente o `v` do formato salvo e escreva uma migração em `state/persist.ts`.

## Adicionar um tópico

1. Escolha o próximo número livre (hoje, 31) e crie a entrada em `M`.
2. Coloque o número em `mods` de uma linha em `LINES`.
3. Ligue ao grafo com `EDGES`: de quem ele depende e quem depende dele. As ligações devem apontar para a mesma coluna ou colunas à direita.
4. Ajuste os limites em `state/persist.ts` se passar de 99 tópicos (`m\d{1,2}`).
5. `npm run check`.

O esquema se ajusta sozinho: a altura acompanha a linha com mais tópicos.

## Adicionar um exercício

- **LeetCode**: acrescente `[número, "Nome", "slug-da-url"]` em `lc`. O id gerado é `lc-<tópico>-<número>`.
- **Explique** e **Projeto**: um por tópico, nos campos `ex` e `pj`.
- **Revise a IA**: gerado a partir do checklist do tópico; não precisa de conteúdo.

Os critérios de nota de cada modo ficam em `CRIT` (`src/data/index.ts`) e o texto do pedido em `gradePrompt` (`src/domain/exercises.ts`).

## Ícones

Cada tópico tem um traço próprio desenhado sobre a mira tracejada comum. O campo `g` é o atributo `d` de um `<path>` numa caixa de 48×48, com traço de 1,3 px e sem preenchimento. Mantenha o desenho dentro do círculo de raio 19 centrado em (24, 24).
