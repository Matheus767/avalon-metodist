import 'dotenv/config';

import { REST, Routes } from 'discord.js';
import { clientId, guildId, token } from '../../../config.ts';
import { listAllCommands } from '../bootstrap/command-registry.ts';

async function main() {
	const commands = listAllCommands().map((command) => command.data.toJSON());
	const rest = new REST().setToken(token);

	try {
		console.log(
			`Atualizando ${commands.length} comando(s) de aplicação (/) no servidor...`,
		);
		const data = (await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		)) as unknown[];
		console.log(
			`Comandos recarregados com sucesso: ${data.length} registro(s).`,
		);
	} catch (error) {
		console.error(error);
		process.exitCode = 1;
	}
}

main();
