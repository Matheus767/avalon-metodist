import type {
	InteractionContextPort,
	InteractionReplyOptions,
} from '../../../app/port/interaction/InteractionContextPort.ts';
import type {
	DiscordInteraction,
	DiscordInteractionOption,
} from '../types/DiscordInteraction.ts';

const ADMINISTRATOR_PERMISSION = 0x8n;

export class WorkerDeferredInteractionContext implements InteractionContextPort {
	private replyOptions: InteractionReplyOptions | null = null;

	constructor(private readonly interaction: DiscordInteraction) {}

	getGuildId(): string | null {
		return this.interaction.guild_id ?? null;
	}

	isInGuild(): boolean {
		return Boolean(this.interaction.guild_id);
	}

	hasAdministratorPermission(): boolean {
		const rawPermissions = this.interaction.member?.permissions;

		if (!rawPermissions) {
			return false;
		}

		return (BigInt(rawPermissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
	}

	getIntegerOption(name: string): number | null {
		const option = this.findOptionByName(this.interaction.data?.options, name);

		if (!option || typeof option.value !== 'number') {
			return null;
		}

		return option.value;
	}

	getUser(): { id: string; username: string } {
		return this.interaction.member?.user
			?? this.interaction.user
			?? { id: 'unknown-user-id', username: 'unknown-user' };
	}

	async reply(options: InteractionReplyOptions): Promise<void> {
		this.replyOptions = options;
	}

	getReplyOptions(): InteractionReplyOptions {
		return this.replyOptions ?? {
			content: 'Comando executado sem resposta explícita.',
			ephemeral: true,
		};
	}

	private findOptionByName(
		options: DiscordInteractionOption[] | undefined,
		name: string,
	): DiscordInteractionOption | null {
		if (!options) {
			return null;
		}

		for (const option of options) {
			if (option.name === name) {
				return option;
			}

			const nested = this.findOptionByName(option.options, name);

			if (nested) {
				return nested;
			}
		}

		return null;
	}
}
