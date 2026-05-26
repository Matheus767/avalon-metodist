# Avalon Metodist

Bot de utilidades para Discord focado em configurar e gerar convites entre servidores de forma simples via slash commands.

## Especificacoes

- **Runtime:** Node.js + TypeScript
- **Biblioteca:** `discord.js` v14
- **Gerenciador:** `pnpm`
- **Arquitetura:** separacao por `use-cases`, `ports` e `infra` (estilo Clean Architecture)
- **Persistencia de configuracao:** arquivo JSON local em `data/invite-target-config.json`

## Comandos

- `/listservers` - lista os servidores disponiveis para configuracao (admin, resposta ephemera)
- `/config index:<numero>` - define o servidor alvo para gerar convites (admin, resposta ephemera)
- `/invite` - gera convite para o servidor alvo configurado
- `/ping` - teste rapido de disponibilidade
- `/user` - retorna informacoes basicas do usuario

## Variaveis de ambiente

Defina no `.env`:

- `BOT_TOKEN`
- `CLIENT_ID`
- `GUILD_ID`

## Execucao rapida

```bash
pnpm install
pnpm dev
pnpm deploy-commands
```