import { DiscordHono } from 'discord-hono';

import type { CommandDependencies } from '../app/port/CommandDependencies.ts';
import { createCommandRegistry } from '../infra/bootstrap/command-registry.ts';
import { DiscordHonoInteractionContext } from '../infra/discord/adapters/DiscordHonoInteractionContext.ts';
import { DiscordRestGateway } from '../infra/discord/discord-rest.ts';
import { InviteTargetConfigKvRepository } from '../infra/repository/InviteTargetConfigKvRepository.ts';
import type { WorkerBindings } from './types.ts';

type DiscordWorkerEnv = {
	Bindings: WorkerBindings;
};

const commandNames = Array.from(createCommandRegistry().keys());

const app = new DiscordHono<DiscordWorkerEnv>({
	discordEnv: (bindings) => ({
		TOKEN: bindings?.DISCORD_TOKEN,
		PUBLIC_KEY: bindings?.DISCORD_PUBLIC_KEY,
		APPLICATION_ID: bindings?.DISCORD_APPLICATION_ID,
	}),
});

for (const commandName of commandNames) {
	app.command(commandName, async (context) => {
		const dependencies: CommandDependencies = {
			discordGateway: new DiscordRestGateway(context.env.DISCORD_TOKEN),
			inviteTargetConfigRepository: new InviteTargetConfigKvRepository(
				context.env.INVITE_CONFIG_KV,
			),
		};
		const command = createCommandRegistry(dependencies).get(commandName);

		if (!command) {
			return context
				.flags('EPHEMERAL')
				.res(`Nenhum comando correspondente a ${commandName} foi encontrado.`);
		}

		const interactionContext = new DiscordHonoInteractionContext(context);

		try {
			await command.execute(interactionContext);
			return interactionContext.toResponse();
		} catch (error) {
			console.error(error);
			return context.flags('EPHEMERAL').res('Ocorreu um erro ao executar este comando.');
		}
	});
}

export default app;
