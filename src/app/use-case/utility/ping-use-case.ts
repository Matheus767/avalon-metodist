<<<<<<< Updated upstream
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
=======
import { createCommandData } from '../../handler/command-data.ts';
import type { InteractionContextPort } from '../../port/interaction/InteractionContextPort.ts';
>>>>>>> Stashed changes

export default class PingUseCase {
	data = createCommandData({
		name: 'ping',
		description: 'Replies with Pong!',
		type: 1,
	});

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply('Pong!');
	}
}