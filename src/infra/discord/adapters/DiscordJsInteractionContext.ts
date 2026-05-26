import {
	MessageFlags,
	PermissionsBitField,
	type ChatInputCommandInteraction,
} from 'discord.js';

import type {
	InteractionContextPort,
	InteractionReplyOptions,
} from '../../../app/port/interaction/InteractionContextPort.ts';

export class DiscordJsInteractionContext implements InteractionContextPort {
	constructor(private readonly interaction: ChatInputCommandInteraction) {}

	getGuildId(): string | null {
		return this.interaction.guildId ?? null;
	}

	isInGuild(): boolean {
		return this.interaction.inGuild();
	}

	hasAdministratorPermission(): boolean {
		const hasAdmin = this.interaction.memberPermissions?.has(
			PermissionsBitField.Flags.Administrator,
		);

		return Boolean(hasAdmin);
	}

	getIntegerOption(name: string): number | null {
		return this.interaction.options.getInteger(name);
	}

	getUser(): { id: string; username: string } {
		return {
			id: this.interaction.user.id,
			username: this.interaction.user.username,
		};
	}

	async reply(options: InteractionReplyOptions): Promise<void> {
		await this.interaction.reply({
			content: options.content,
			flags: options.ephemeral ? MessageFlags.Ephemeral : undefined,
		});
	}
}
