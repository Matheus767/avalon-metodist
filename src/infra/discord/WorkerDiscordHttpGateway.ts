import type {
	BotGuildSummary,
	CreatedInvite,
	DiscordGatewayPort,
} from '../../app/port/discord/DiscordGatewayPort.ts';

type DiscordGuild = {
	id: string;
	name: string;
	system_channel_id?: string | null;
};

type DiscordGuildChannel = {
	id: string;
	name: string;
	type: number;
	position: number;
};

type DiscordInvite = {
	code: string;
};

type DiscordError = {
	message?: string;
};

const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';
const GUILD_TEXT_CHANNEL_TYPE = 0;

export class WorkerDiscordHttpGateway implements DiscordGatewayPort {
	constructor(private readonly botToken: string) {}

	async listBotGuilds(): Promise<BotGuildSummary[]> {
		const guilds = await this.discordRequest<DiscordGuild[]>('/users/@me/guilds');

		return guilds
			.map((guild) => ({
				id: guild.id,
				name: guild.name,
			}))
			.sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
	}

	async hasGuild(guildId: string): Promise<boolean> {
		try {
			await this.discordRequest<DiscordGuild>(`/guilds/${guildId}`);
			return true;
		} catch {
			return false;
		}
	}

	async createInviteForGuild(guildId: string): Promise<CreatedInvite> {
		const guild = await this.discordRequest<DiscordGuild>(`/guilds/${guildId}`);
		const channels = await this.discordRequest<DiscordGuildChannel[]>(`/guilds/${guildId}/channels`);
		const inviteChannels = channels
			.filter((channel) => channel.type === GUILD_TEXT_CHANNEL_TYPE)
			.sort((left, right) => left.position - right.position);

		if (inviteChannels.length === 0) {
			throw new Error('Nenhum canal elegível para criação de convite foi encontrado.');
		}

		const prioritizedChannels = this.prioritizeInviteChannels(
			inviteChannels,
			guild.system_channel_id ?? null,
		);

		for (const channel of prioritizedChannels) {
			try {
				const invite = await this.discordRequest<DiscordInvite>(
					`/channels/${channel.id}/invites`,
					{
						method: 'POST',
						body: JSON.stringify({
							max_age: 0,
							max_uses: 1,
							temporary: false,
							unique: true,
						}),
						headers: {
							'content-type': 'application/json',
						},
					},
				);

				return {
					url: `https://discord.gg/${invite.code}`,
					guildName: guild.name,
					channelName: channel.name,
				};
			} catch {
				// Tenta o próximo canal quando o bot não possui permissão.
			}
		}

		throw new Error('Nenhum canal elegível para criação de convite foi encontrado.');
	}

	private prioritizeInviteChannels(
		channels: DiscordGuildChannel[],
		systemChannelId: string | null,
	): DiscordGuildChannel[] {
		if (!systemChannelId) {
			return channels;
		}

		const prioritized = channels.find((channel) => channel.id === systemChannelId);

		if (!prioritized) {
			return channels;
		}

		return [prioritized, ...channels.filter((channel) => channel.id !== prioritized.id)];
	}

	private async discordRequest<T>(
		path: string,
		init?: RequestInit,
	): Promise<T> {
		const response = await fetch(`${DISCORD_API_BASE_URL}${path}`, {
			...init,
			headers: {
				authorization: `Bot ${this.botToken}`,
				...(init?.headers ?? {}),
			},
		});

		if (!response.ok) {
			const fallbackMessage = `Discord API request failed with status ${response.status}.`;
			const errorPayload = await response.json().catch(() => null) as DiscordError | null;
			const errorMessage = errorPayload?.message ?? fallbackMessage;
			throw new Error(errorMessage);
		}

		return response.json() as Promise<T>;
	}
}
