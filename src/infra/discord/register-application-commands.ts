import { REST, Routes } from 'discord.js';

import { listAllCommandData } from '../bootstrap/command-registry.ts';

export type RegisterApplicationCommandsParams = {
	applicationId: string;
	guildId: string;
	token: string;
	logPrefix: string;
};

export async function registerApplicationCommands({
	applicationId,
	guildId,
	token,
	logPrefix,
}: RegisterApplicationCommandsParams): Promise<number> {
	const commandPayload = listAllCommandData().map((commandData) => commandData.toJSON());
	const rest = new REST().setToken(token);
	await rest.put(Routes.applicationGuildCommands(applicationId, guildId), {
		body: commandPayload,
	});
	console.log(`${logPrefix} (${commandPayload.length}).`);
	return commandPayload.length;
}
