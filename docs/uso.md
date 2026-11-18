# Guia de uso

## O ciclo de estudo

```
Hoje → estuda o tópico → marca subtópicos → faz o exercício
     → copia o pedido → Claude avalia → registra a nota → Hoje
```

Uma sessão típica leva de 25 minutos (um LeetCode) a 2 horas (um projeto).

## Hoje

- **Agora**: o exercício mais indicado no momento, com o tempo sugerido e o motivo da escolha. "Trocar por outro" mostra o próximo da fila.
- **Projeto executado**: porcentagem geral e de cada uma das 7 linhas, módulos concluídos e dias seguidos de estudo.
- **Próximo a liberar**: o tópico bloqueado mais perto de abrir e o que falta.
- **Onde você está**: os blocos da linha atual.

Cada dia da semana puxa um modo: domingo e quinta *Explique*, segunda, quarta e sexta *Na mão*, terça *Revise a IA*, sábado *Projeto*.

## Trilha

Dois jeitos de ver, e a escolha fica salva:

- **Esquema**: planta com as ligações. Toque num bloco para destacar o que ele exige e o que libera; toque de novo para abrir. Arraste o fundo para mover, use − / + para zoom ou "Ajustar" para caber na tela. `Esc` limpa a seleção.
- **Colunas**: uma coluna por linha, mais compacta.

Legenda das ligações: **cheia** quando a base já está concluída, **tracejada** quando falta, **pontilhada** quando é só recomendada.

A chave **Exigir projeto aprovado** faz um tópico só concluir com um projeto nota 7 ou mais. Deixe desligada no começo se quiser andar mais rápido.

## Prancha do tópico

- Ícone, motivo para estudar e barra de progresso.
- **Base / Você está aqui / Libera ao concluir**: de onde o tópico vem e para onde leva.
- **Detalhes, em ordem**: o checklist. Itens com a etiqueta *já usa* são coisas que você já faz no trabalho; vale marcar depois de revisar a teoria. Etiquetas como *U19 Mensageria* apontam para onde o assunto aparece de novo.
- **Exercícios**, **Prática** e **Para estudar** (artigos, vídeos, livros e cursos, abrindo em nova aba).

Tópicos bloqueados podem ser lidos, mas o checklist e as notas ficam travados.

## Exercícios

| Modo | Como fazer | Tempo |
| --- | --- | --- |
| Na mão | LeetCode sem IA. Cole a solução e escreva a complexidade de tempo e espaço. Tem cronômetro. | 25 min |
| Explique | Responda a pergunta com suas palavras e um exemplo. | 10 min |
| Revise a IA | Copie o pedido de código, cole no Claude, ache os bugs. Depois cole o pedido de avaliação **na mesma conversa**. | 15 min |
| Projeto | Faça como faria no trabalho, com ou sem IA. Cole o código principal ou o link do repositório e um resumo das decisões. | 2 h |

### Avaliar com o Claude

1. Escreva a resposta no campo **Sua resposta**.
2. Clique em **Copiar pedido de avaliação**. O texto leva o tópico, o modo, os critérios e sua resposta. Dá para conferir em "Ver o pedido que será copiado".
3. Cole numa conversa com o Claude (o link "Abrir o Claude" abre uma aba nova).
4. Volte e preencha **Nota final** (aceita `7,5` ou `7.5`) e, se quiser, cole o parecer.
5. **Registrar nota**. A melhor nota de cada exercício aparece como selo; 7 ou mais é aprovado.

Se a cópia automática falhar, o texto aparece numa caixa para você selecionar e copiar.

## Avaliações

Lista de todas as notas, da mais recente para a mais antiga, com média geral, aprovados e média por modo. Abra um registro para ver o parecer, voltar ao exercício ou apagar.

## Carreira

- **Cronograma** de dez/2026 a dez/2027. A barra fica laranja no mês em que você deveria estar nela. "Editar datas" ajusta início, fim e conclusão.
- **Comparativo de pós** com modalidade, duração, preço e dois medidores (IA aplicada e arquitetura). Os medidores são uma leitura, não um ranking oficial; confira a grade antes de se matricular.
- **Linha paralela**: soft skills, inglês e certificações, com checklist próprio.

## Busca

`⌘K` (Mac) ou `Ctrl+K` abre a busca. Procura em tópicos, subtópicos e exercícios, sem acento e por várias palavras. Setas para escolher, `Enter` para abrir, `Esc` para fechar.

## Seus dados

Tudo fica no navegador onde você usa o site.

- **Exportar progresso** baixa um `forja-progresso-AAAA-MM-DD.json`.
- **Importar progresso** substitui o progresso atual pelo do arquivo. O arquivo é validado: o que não for reconhecido é ignorado.
- **Apagar tudo** pede confirmação na própria página.

Limpar os dados do site no navegador também apaga o progresso. Exporte antes.
