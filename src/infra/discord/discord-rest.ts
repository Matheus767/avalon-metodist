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
	position?: number;
};

type DiscordInvite = {
	code: string;
};

const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';
const GUILD_TEXT_CHANNEL_TYPE = 0;

export class DiscordRestGateway implements DiscordGatewayPort {
	constructor(
		private readonly token: string,
		private readonly fetchFn: typeof fetch = fetch,
	) {}

	async listBotGuilds(): Promise<BotGuildSummary[]> {
		const response = await this.discordFetch('/users/@me/guilds');
		const guilds = (await response.json()) as DiscordGuild[];

		return guilds
			.map((guild) => ({ id: guild.id, name: guild.name }))
			.sort((left, right) => left.name.localeCompare(right.name, 'pt-BR'));
	}

	async hasGuild(guildId: string): Promise<boolean> {
		const response = await this.discordFetch(`/guilds/${guildId}`, { throwOnError: false });

		return response.ok;
	}

	async createInviteForGuild(guildId: string): Promise<CreatedInvite> {
		const guildResponse = await this.discordFetch(`/guilds/${guildId}`);
		const guild = (await guildResponse.json()) as DiscordGuild;
		const channelsResponse = await this.discordFetch(`/guilds/${guildId}/channels`);
		const channels = (await channelsResponse.json()) as DiscordGuildChannel[];
		const inviteChannels = this.buildInviteChannelOrder(channels, guild.system_channel_id ?? null);

		for (const channel of inviteChannels) {
			const inviteResponse = await this.discordFetch(
				`/channels/${channel.id}/invites`,
				{
					method: 'POST',
					body: JSON.stringify({
						max_age: 0,
						max_uses: 1,
						temporary: false,
						unique: true,
					}),
					throwOnError: false,
				},
			);

			if (!inviteResponse.ok) {
				continue;
			}

			const invite = (await inviteResponse.json()) as DiscordInvite;

			return {
				url: `https://discord.gg/${invite.code}`,
				guildName: guild.name,
				channelName: channel.name,
			};
		}

		throw new Error('Nenhum canal elegível para criação de convite foi encontrado.');
	}

	private async discordFetch(
		path: string,
		options?: RequestInit & { throwOnError?: boolean },
	): Promise<Response> {
		const { throwOnError = true, ...requestInit } = options ?? {};
		const response = await this.fetchFn(`${DISCORD_API_BASE_URL}${path}`, {
			...requestInit,
			headers: {
				Authorization: `Bot ${this.token}`,
				'Content-Type': 'application/json',
				...(requestInit.headers ?? {}),
			},
		});

		if (throwOnError && !response.ok) {
			const body = await response.text();
			throw new Error(`Falha ao chamar Discord API (${response.status}): ${body}`);
		}

		return response;
	}

	private buildInviteChannelOrder(
		channels: DiscordGuildChannel[],
		systemChannelId: string | null,
	): DiscordGuildChannel[] {
		const textChannels = channels
			.filter((channel) => channel.type === GUILD_TEXT_CHANNEL_TYPE)
			.sort((left, right) => (left.position ?? 0) - (right.position ?? 0));

		if (!systemChannelId) {
			return textChannels;
		}

		const systemChannel = textChannels.find((channel) => channel.id === systemChannelId);

		if (!systemChannel) {
			return textChannels;
		}

		return [
			systemChannel,
			...textChannels.filter((channel) => channel.id !== systemChannel.id),
		];
	}
}
