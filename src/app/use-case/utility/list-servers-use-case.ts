import { createCommandData } from '../../handler/command-data.ts';
import type { CommandDependencies } from '../../port/CommandDependencies.ts';
import type { InteractionContextPort } from '../../port/interaction/InteractionContextPort.ts';
import { ensureAdminPermission, ensureGuildInteraction } from '../shared/command-guards.ts';

export default class ListServersUseCase {
	data = createCommandData({
		name: 'listservers',
		description: 'Lista os servidores em que o bot está com índice para configuração.',
		type: 1,
	});

	constructor(private readonly dependencies: CommandDependencies) {}

	async execute(interaction: InteractionContextPort): Promise<void> {
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
			ephemeral: true,
		});
	}
}
