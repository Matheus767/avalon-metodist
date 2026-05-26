import {
	ChatInputCommandInteraction,
	MessageFlags,
	PermissionsBitField,
} from 'discord.js';

export async function ensureGuildInteraction(
	interaction: ChatInputCommandInteraction,
): Promise<boolean> {
	if (interaction.inGuild()) {
		return true;
	}

	await interaction.reply({
		content: 'Este comando só pode ser usado dentro de um servidor.',
		flags: MessageFlags.Ephemeral,
	});
	return false;
}

export async function ensureAdminPermission(
	interaction: ChatInputCommandInteraction,
): Promise<boolean> {
	const hasAdmin = interaction.memberPermissions?.has(
		PermissionsBitField.Flags.Administrator,
	);

	if (hasAdmin) {
		return true;
	}

	await interaction.reply({
		content: 'Apenas administradores do servidor podem usar este comando.',
		flags: MessageFlags.Ephemeral,
	});
	return false;
}
