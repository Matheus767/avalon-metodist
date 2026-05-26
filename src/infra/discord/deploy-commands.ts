import 'dotenv/config';
import path from 'node:path';

import { REST, Routes } from 'discord.js';
import { clientId, guildId, token } from '../../../config.ts';
import { loadCommandsFromDirectory } from '../bootstrap/command-loader.ts';

async function main() {
	const utilityPath = path.join(process.cwd(), 'src', 'app', 'use-case', 'utility');
	const loadedCommands = await loadCommandsFromDirectory(utilityPath);
	const commands = loadedCommands.map(({ command }) => command.data.toJSON());
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
