import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

import type { CommandDependencies } from '../../port/CommandDependencies.ts';
import { ensureGuildInteraction } from '../shared/command-guards.ts';

export default class InviteUseCase {
	data = new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Gera um convite para o servidor configurado previamente.');

	constructor(private readonly dependencies: CommandDependencies) {}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!(await ensureGuildInteraction(interaction))) {
			return;
		}

		const originGuildId = interaction.guildId;

		if (!originGuildId) {
			await interaction.reply({
				content: 'Não foi possível identificar o servidor de origem.',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		const targetGuildId = await this.dependencies.inviteTargetConfigRepository.getTargetGuildId(
			originGuildId,
		);

		if (!targetGuildId) {
			await interaction.reply({
				content: 'Nenhum servidor alvo configurado. Use /listServers e depois /config index:<numero>.',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		const invite = await this.dependencies.discordGateway.createInviteForGuild(targetGuildId);
		await interaction.reply(
			`Convite gerado para ${invite.guildName} (${invite.channelName}): ${invite.url}`,
		);
	}
}