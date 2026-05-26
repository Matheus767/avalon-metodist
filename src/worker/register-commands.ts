import 'dotenv/config';

import { registerApplicationCommands } from '../infra/discord/register-application-commands.ts';

const applicationId = process.env.DISCORD_APPLICATION_ID;
const token = process.env.DISCORD_TOKEN;
const guildId = process.env.DISCORD_TEST_GUILD_ID;

async function main(): Promise<void> {
	if (!applicationId || !token || !guildId) {
		throw new Error('Defina DISCORD_APPLICATION_ID, DISCORD_TOKEN e DISCORD_TEST_GUILD_ID.');
	}

	await registerApplicationCommands({
		applicationId,
		guildId,
		token,
		logPrefix: 'Comandos do worker registrados com sucesso',
	});
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
