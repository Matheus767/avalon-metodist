import 'dotenv/config';

import { clientId, guildId, token } from '../../../config.ts';
import { registerApplicationCommands } from './register-application-commands.ts';

async function main() {
	try {
		await registerApplicationCommands({
			applicationId: clientId,
			guildId,
			token,
			logPrefix: 'Comandos recarregados com sucesso',
		});
	} catch (error) {
		console.error(error);
		process.exitCode = 1;
	}
}

main();
