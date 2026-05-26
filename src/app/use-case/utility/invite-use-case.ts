import { SlashCommandBuilder } from 'discord.js';

import type { CommandDependencies } from '../../port/CommandDependencies.ts';
import type { InteractionContextPort } from '../../port/interaction/InteractionContextPort.ts';
import { ensureGuildInteraction } from '../shared/command-guards.ts';

export default class InviteUseCase {
	data = new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Gera um convite para o servidor configurado previamente.');

	constructor(private readonly dependencies?: CommandDependencies) {}

	async execute(interaction: InteractionContextPort): Promise<void> {
		if (!(await ensureGuildInteraction(interaction))) {
			return;
		}

		const originGuildId = interaction.getGuildId();

		if (!originGuildId) {
			await interaction.reply({
				content: 'Não foi possível identificar o servidor de origem.',
				ephemeral: true,
			});
			return;
		}

		const targetGuildId = await this.getDependencies().inviteTargetConfigRepository.getTargetGuildId(
			originGuildId,
		);

		if (!targetGuildId) {
			await interaction.reply({
				content: 'Nenhum servidor alvo configurado. Use /listServers e depois /config index:<numero>.',
				ephemeral: true,
			});
			return;
		}

		const invite = await this.getDependencies().discordGateway.createInviteForGuild(targetGuildId);
		await interaction.reply({
			content: `Convite gerado para ${invite.guildName} (${invite.channelName}): ${invite.url}`,
		});
	}

	private getDependencies(): CommandDependencies {
		if (!this.dependencies) {
			throw new Error('Dependências do comando não foram fornecidas.');
		}
		return this.dependencies;
	}
}