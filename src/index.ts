import 'dotenv/config';
import path from 'node:path';

import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { token } from '../config.ts';
import type { Command } from './app/handler/Command.ts';
import type { CommandDependencies } from './app/port/CommandDependencies.ts';
import { createCommandRegistry } from './infra/bootstrap/command-registry.ts';
import { DiscordJsInteractionContext } from './infra/discord/adapters/DiscordJsInteractionContext.ts';
import { DiscordGateway } from './infra/discord/discord.ts';
import { InviteTargetConfigJsonRepository } from './infra/repository/InviteTargetConfigJsonRepository.ts';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = new Collection<string, Command>();
const dependencies: CommandDependencies = {
	discordGateway: new DiscordGateway(client),
	inviteTargetConfigRepository: new InviteTargetConfigJsonRepository(
		path.join(process.cwd(), 'data', 'invite-target-config.json'),
	),
};

function loadCommands(commandDependencies: CommandDependencies): void {
	const registry = createCommandRegistry(commandDependencies);
	for (const command of registry.values()) {
		commands.set(command.data.name, command);
	}
}

client.once(Events.ClientReady, (readyClient) => {
	console.log(`${readyClient.user.username} is ready!`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`Nenhum comando correspondente a ${interaction.commandName} foi encontrado.`);
		return;
	}

	try {
		const context = new DiscordJsInteractionContext(interaction);
		await command.execute(context);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'Ocorreu um erro ao executar este comando.',
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: 'Ocorreu um erro ao executar este comando.',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
});

try {
	loadCommands(dependencies);
	void client.login(token).catch((error) => {
		console.error(error);
		process.exitCode = 1;
	});
} catch (error) {
	console.error(error);
	process.exitCode = 1;
}