import { createCommandData } from '../../handler/command-data.ts';
import type { InteractionContextPort } from '../../port/interaction/InteractionContextPort.ts';

export default class UserUseCase {
	data = createCommandData({
		name: 'user',
		description: 'Replies with user info!',
		type: 1,
	});

	async execute(interaction: InteractionContextPort): Promise<void> {
		const user = interaction.getUser();
		await interaction.reply({
			content: `Username: ${user.username}\nID: ${user.id}`,
		});
	}
}