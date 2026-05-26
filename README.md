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

## Cloudflare Workers (discord-hono)

Este projeto tambem possui runtime serverless via `discord-hono` para hospedar comandos como endpoint de Interactions.

### Variaveis para Worker

- `DISCORD_TOKEN`
- `DISCORD_PUBLIC_KEY`
- `DISCORD_APPLICATION_ID`
- `DISCORD_TEST_GUILD_ID` (opcional, recomendado para ambiente de teste)

### Setup de KV

1. Crie um namespace KV:
   - `pnpm wrangler kv namespace create INVITE_CONFIG_KV`
2. Copie o `id` retornado e atualize `wrangler.toml`.

### Desenvolvimento e deploy

```bash
pnpm worker:dev
pnpm worker:register
pnpm worker:deploy
```

### Cutover e rollback

1. Deploy do Worker em producao.
2. Configure no Discord Developer Portal o `Interactions Endpoint URL` para a URL do Worker.
3. Valide `/ping`, `/listservers`, `/config`, `/invite` em servidor de teste.
4. Se houver regressao, restaure temporariamente a URL anterior do endpoint (rollback rapido).