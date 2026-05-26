import { SlashCommandBuilder } from 'discord.js';

import type { InteractionContextPort } from '../../port/interaction/InteractionContextPort.ts';

export default class PingUseCase {
	data = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');

	async execute(interaction: InteractionContextPort): Promise<void> {
		await interaction.reply({ content: 'Pong!' });
	}
}