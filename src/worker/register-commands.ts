import 'dotenv/config';

import { register } from 'discord-hono';

import { listAllCommands } from '../infra/bootstrap/command-registry.ts';

const applicationId = process.env.DISCORD_APPLICATION_ID;
const token = process.env.DISCORD_TOKEN;
const guildId = process.env.DISCORD_TEST_GUILD_ID;

async function main(): Promise<void> {
	const commands = listAllCommands().map((command) => command.data.toJSON());
	await register(commands, applicationId, token, guildId);
	console.log(`Comandos registrados com sucesso (${commands.length}).`);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
