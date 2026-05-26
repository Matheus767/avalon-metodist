import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default class UserUseCase {
	data = new SlashCommandBuilder().setName('user').setDescription('Replies with user info!');

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply(`Username: ${interaction.user.username}\nID: ${interaction.user.id}`);
	}
}