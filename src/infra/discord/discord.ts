import {
	ChannelType,
	Client,
	Guild,
	GuildBasedChannel,
	PermissionsBitField,
	TextChannel,
} from 'discord.js';

import type {
	BotGuildSummary,
	CreatedInvite,
	DiscordGatewayPort,
} from '../../app/port/discord/DiscordGatewayPort.ts';

export class DiscordGateway implements DiscordGatewayPort {
	constructor(private readonly client: Client) {}

	async listBotGuilds(): Promise<BotGuildSummary[]> {
		const summaries = this.client.guilds.cache.map((guild) => ({
			id: guild.id,
			name: guild.name,
		}));

		return summaries.sort((left, right) =>
			left.name.localeCompare(right.name, 'pt-BR'),
		);
	}

	async hasGuild(guildId: string): Promise<boolean> {
		try {
			await this.client.guilds.fetch(guildId);
			return true;
		} catch {
			return false;
		}
	}

	async createInviteForGuild(guildId: string): Promise<CreatedInvite> {
		const guild = await this.client.guilds.fetch(guildId);
		const inviteChannel = await this.resolveInviteChannel(guild);
		const invite = await inviteChannel.createInvite({
			maxAge: 0,
			maxUses: 1,
			temporary: false,
			unique: true,
		});

		return {
			url: invite.url,
			guildName: guild.name,
			channelName: inviteChannel.name,
		};
	}

	private async resolveInviteChannel(guild: Guild): Promise<TextChannel> {
		await guild.channels.fetch();
		const me = guild.members.me ?? (await guild.members.fetchMe());
		const channels = guild.channels.cache
			.filter((channel) => this.isInviteCompatibleChannel(channel))
			.sort((left, right) => left.position - right.position);
		const systemChannel = guild.systemChannel;

		if (
			systemChannel &&
			this.isInviteCompatibleChannel(systemChannel) &&
			this.canCreateInvite(systemChannel, me.id)
		) {
			return systemChannel;
		}

		const firstEligibleChannel = channels.find((channel) =>
			this.canCreateInvite(channel, me.id),
		);

		if (!firstEligibleChannel) {
			throw new Error('Nenhum canal elegível para criação de convite foi encontrado.');
		}

		return firstEligibleChannel;
	}

	private canCreateInvite(channel: TextChannel, botUserId: string): boolean {
		const permissions = channel.permissionsFor(botUserId);

		if (!permissions) {
			return false;
		}

		return permissions.has(PermissionsBitField.Flags.ViewChannel) &&
			permissions.has(PermissionsBitField.Flags.CreateInstantInvite);
	}

	private isInviteCompatibleChannel(channel: GuildBasedChannel): channel is TextChannel {
		return channel.type === ChannelType.GuildText;
	}
}