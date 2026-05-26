import type { InteractionContextPort } from '../../port/interaction/InteractionContextPort.ts';

export async function ensureGuildInteraction(
	interaction: InteractionContextPort,
): Promise<boolean> {
	if (interaction.isInGuild()) {
		return true;
	}

	await interaction.reply({
		content: 'Este comando só pode ser usado dentro de um servidor.',
		ephemeral: true,
	});
	return false;
}

export async function ensureAdminPermission(
	interaction: InteractionContextPort,
): Promise<boolean> {
	if (interaction.hasAdministratorPermission()) {
		return true;
	}

	await interaction.reply({
		content: 'Apenas administradores do servidor podem usar este comando.',
		ephemeral: true,
	});
	return false;
}
