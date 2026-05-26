<<<<<<< Updated upstream
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

=======
import { createCommandData } from '../../handler/command-data.ts';
>>>>>>> Stashed changes
import type { CommandDependencies } from '../../port/CommandDependencies.ts';
import { ensureGuildInteraction } from '../shared/command-guards.ts';

export default class InviteUseCase {
	data = createCommandData({
		name: 'invite',
		description: 'Gera um convite para o servidor configurado previamente.',
		type: 1,
	});

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