import { SlashCommandBuilder } from 'discord.js';

import type { CommandDependencies } from '../../port/CommandDependencies.ts';
import type { InteractionContextPort } from '../../port/interaction/InteractionContextPort.ts';
import { ensureAdminPermission, ensureGuildInteraction } from '../shared/command-guards.ts';

export default class ConfigUseCase {
	data = new SlashCommandBuilder()
		.setName('config')
		.setDescription('Configura em qual servidor o /invite vai gerar convite.')
		.addIntegerOption((option) =>
			option
				.setName('index')
				.setDescription('Índice do servidor retornado em /listServers')
				.setRequired(true)
				.setMinValue(1),
		);

	constructor(private readonly dependencies?: CommandDependencies) {}

	async execute(interaction: InteractionContextPort): Promise<void> {
		if (!(await ensureGuildInteraction(interaction))) {
			return;
		}
		if (!(await ensureAdminPermission(interaction))) {
			return;
		}

		const selectedIndex = interaction.getIntegerOption('index');

		if (!selectedIndex || selectedIndex < 1) {
			await interaction.reply({
				content: 'Índice inválido. Informe um número maior ou igual a 1.',
				ephemeral: true,
			});
			return;
		}
		const botGuilds = await this.getDependencies().discordGateway.listBotGuilds();

		if (selectedIndex > botGuilds.length) {
			await interaction.reply({
				content: `Índice inválido. Execute /listServers e use um índice entre 1 e ${botGuilds.length}.`,
				ephemeral: true,
			});
			return;
		}

		const targetGuild = botGuilds[selectedIndex - 1];
		const originGuildId = interaction.getGuildId();

		if (!originGuildId) {
			await interaction.reply({
				content: 'Não foi possível identificar o servidor de origem.',
				ephemeral: true,
			});
			return;
		}

		await this.getDependencies().inviteTargetConfigRepository.setTargetGuildId(
			originGuildId,
			targetGuild.id,
		);

		await interaction.reply({
			content: `Configuração salva. O /invite agora gera convite para: ${targetGuild.name}.`,
			ephemeral: true,
		});
	}

	private getDependencies(): CommandDependencies {
		if (!this.dependencies) {
			throw new Error('Dependências do comando não foram fornecidas.');
		}
		return this.dependencies;
	}
}
