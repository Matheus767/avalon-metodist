import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

import type { CommandDependencies } from '../../port/CommandDependencies.ts';
import { ensureAdminPermission, ensureGuildInteraction } from '../shared/command-guards.ts';

export default class ListServersUseCase {
	data = new SlashCommandBuilder()
		.setName('listservers')
		.setDescription('Lista os servidores em que o bot está com índice para configuração.');

	constructor(private readonly dependencies: CommandDependencies) {}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!(await ensureGuildInteraction(interaction))) {
			return;
		}
		if (!(await ensureAdminPermission(interaction))) {
			return;
		}

		const botGuilds = await this.dependencies.discordGateway.listBotGuilds();
		const guildLines = botGuilds.map((guild, index) => `${index + 1} - ${guild.name}`);
		const content = guildLines.length > 0
			? [
				'Servidores disponíveis para convite:',
				...guildLines,
				'Use /config index:<numero> para escolher o servidor alvo.',
			].join('\n')
			: 'O bot não está em nenhum servidor para listar.';

		await interaction.reply({
			content,
			flags: MessageFlags.Ephemeral,
		});
	}
}
