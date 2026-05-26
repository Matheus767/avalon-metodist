import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export default class PingUseCase {
	data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

	async execute(interaction: ChatInputCommandInteraction): Promise<void> {
		await interaction.reply('Pong!');
	}
}