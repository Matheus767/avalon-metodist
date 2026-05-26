import 'dotenv/config';
import path from 'node:path';

import { Client, Collection, Events, GatewayIntentBits, MessageFlags } from 'discord.js';
import { token } from '../config.ts';
import type { Command } from './app/handler/Command.ts';
import type { CommandDependencies } from './app/port/CommandDependencies.ts';
import { DiscordGateway } from './infra/discord/discord.ts';
import { loadCommandsFromDirectory } from './infra/bootstrap/command-loader.ts';
import { InviteTargetConfigJsonRepository } from './infra/repository/InviteTargetConfigJsonRepository.ts';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const commands = new Collection<string, Command>();
const dependencies: CommandDependencies = {
	discordGateway: new DiscordGateway(client),
	inviteTargetConfigRepository: new InviteTargetConfigJsonRepository(
		path.join(process.cwd(), 'data', 'invite-target-config.json'),
	),
};

async function loadCommands(commandDependencies: CommandDependencies): Promise<void> {
	const utilityPath = path.join(process.cwd(), 'src', 'app', 'use-case', 'utility');
	const loadedCommands = await loadCommandsFromDirectory(
		utilityPath,
		commandDependencies,
	);

	for (const { command } of loadedCommands) {
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
		await command.execute(interaction);
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

loadCommands(dependencies)
	.then(() => client.login(token))
	.catch((err) => {
		console.error(err);
		process.exitCode = 1;
	});