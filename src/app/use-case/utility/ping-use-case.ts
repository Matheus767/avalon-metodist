import { createCommandData } from '../../handler/command-data.ts';
import type { InteractionContextPort } from '../../port/interaction/InteractionContextPort.ts';

export default class PingUseCase {
	data = createCommandData({
		name: 'ping',
		description: 'Replies with Pong!',
		type: 1,
	});

	async execute(interaction: InteractionContextPort): Promise<void> {
		await interaction.reply({
			content: 'Pong!',
		});
	}
}