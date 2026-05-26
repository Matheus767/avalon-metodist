<<<<<<< Updated upstream
import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
=======
import { createCommandData } from '../../handler/command-data.ts';
import type { InteractionContextPort } from '../../port/interaction/InteractionContextPort.ts';
>>>>>>> Stashed changes

export default class UserUseCase {
	data = createCommandData({
		name: 'user',
		description: 'Replies with user info!',
		type: 1,
	});

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply(`Username: ${interaction.user.username}\nID: ${interaction.user.id}`);
	}
}