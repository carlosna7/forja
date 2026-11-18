# Política de segurança

## Versões cobertas

Só a versão publicada a partir da branch `main` recebe correções.

## Como reportar

Encontrou uma falha? Não abra issue pública. Use **Security → Report a vulnerability** neste repositório (aviso privado do GitHub) com:

- o que acontece e onde (tela, URL, arquivo);
- passos para reproduzir;
- o impacto que você enxerga.

A resposta inicial vem em até 7 dias. Quando a correção sair, o crédito é seu, se quiser.

## Escopo

Este é um site estático sem backend nem login. Os pontos mais relevantes são a CSP, a validação de arquivos importados e a cadeia de dependências. Os detalhes estão em [docs/seguranca.md](docs/seguranca.md).
