<<<<<<< Updated upstream
import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

=======
import { createCommandData } from '../../handler/command-data.ts';
>>>>>>> Stashed changes
import type { CommandDependencies } from '../../port/CommandDependencies.ts';
import { ensureAdminPermission, ensureGuildInteraction } from '../shared/command-guards.ts';

export default class ConfigUseCase {
	data = createCommandData({
		name: 'config',
		description: 'Configura em qual servidor o /invite vai gerar convite.',
		type: 1,
		options: [
			{
				name: 'index',
				description: 'Índice do servidor retornado em /listServers',
				type: 4,
				required: true,
				min_value: 1,
			},
		],
	});

	constructor(private readonly dependencies: CommandDependencies) {}

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		if (!(await ensureGuildInteraction(interaction))) {
			return;
		}
		if (!(await ensureAdminPermission(interaction))) {
			return;
		}

		const selectedIndex = interaction.options.getInteger('index', true);
		const botGuilds = await this.dependencies.discordGateway.listBotGuilds();

		if (selectedIndex > botGuilds.length) {
			await interaction.reply({
				content: `Índice inválido. Execute /listServers e use um índice entre 1 e ${botGuilds.length}.`,
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		const targetGuild = botGuilds[selectedIndex - 1];
		const originGuildId = interaction.guildId;

		if (!originGuildId) {
			await interaction.reply({
				content: 'Não foi possível identificar o servidor de origem.',
				flags: MessageFlags.Ephemeral,
			});
			return;
		}

		await this.dependencies.inviteTargetConfigRepository.setTargetGuildId(
			originGuildId,
			targetGuild.id,
		);

		await interaction.reply({
			content: `Configuração salva. O /invite agora gera convite para: ${targetGuild.name}.`,
			flags: MessageFlags.Ephemeral,
		});
	}
}
