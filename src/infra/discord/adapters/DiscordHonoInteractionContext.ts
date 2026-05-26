import type { APIApplicationCommandInteractionDataOption } from 'discord-api-types/v10';
import type { CommandContext } from 'discord-hono';

import type {
	InteractionContextPort,
	InteractionReplyOptions,
} from '../../../app/port/interaction/InteractionContextPort.ts';

const ADMINISTRATOR_PERMISSION = 0x8n;

export class DiscordHonoInteractionContext<E extends { Bindings?: object } = { Bindings?: object }>
implements InteractionContextPort {
	private response: Response | null = null;

	constructor(private readonly context: CommandContext<E>) {}

	getGuildId(): string | null {
		return this.context.interaction.guild_id ?? null;
	}

	isInGuild(): boolean {
		return Boolean(this.context.interaction.guild_id);
	}

	hasAdministratorPermission(): boolean {
		const rawPermissions = this.context.interaction.member?.permissions;

		if (!rawPermissions) {
			return false;
		}

		return (BigInt(rawPermissions) & ADMINISTRATOR_PERMISSION) === ADMINISTRATOR_PERMISSION;
	}

	getIntegerOption(name: string): number | null {
		const interactionData = this.context.interaction.data;

		if (!('options' in interactionData) || !interactionData.options) {
			return null;
		}

		const option = this.findOptionByName(interactionData.options, name);

		if (!option || !('value' in option) || typeof option.value !== 'number') {
			return null;
		}

		return option.value;
	}

	getUser(): { id: string; username: string } {
		const memberUser = this.context.interaction.member?.user;
		const interactionUser = this.context.interaction.user;

		return {
			id: memberUser?.id ?? interactionUser?.id ?? 'unknown-user-id',
			username: memberUser?.username ?? interactionUser?.username ?? 'unknown-user',
		};
	}

	async reply(options: InteractionReplyOptions): Promise<void> {
		this.response = options.ephemeral
			? this.context.flags('EPHEMERAL').res(options.content)
			: this.context.res(options.content);
	}

	toResponse(): Response {
		if (!this.response) {
			throw new Error('Nenhuma resposta foi gerada para a interação.');
		}

		return this.response;
	}

	private findOptionByName(
		options: APIApplicationCommandInteractionDataOption[],
		name: string,
	): APIApplicationCommandInteractionDataOption | null {
		for (const option of options) {
			if (option.name === name) {
				return option;
			}

			if ('options' in option && option.options) {
				const nested = this.findOptionByName(option.options, name);

				if (nested) {
					return nested;
				}
			}
		}

		return null;
	}
}
