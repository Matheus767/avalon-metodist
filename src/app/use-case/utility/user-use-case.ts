import { SlashCommandBuilder } from 'discord.js';

import type { InteractionContextPort } from '../../port/interaction/InteractionContextPort.ts';

export default class UserUseCase {
	data = new SlashCommandBuilder().setName('user').setDescription('Replies with user info!');

	async execute(interaction: InteractionContextPort): Promise<void> {
		const user = interaction.getUser();
		await interaction.reply({
			content: `Username: ${user.username}\nID: ${user.id}`,
		});
	}
}