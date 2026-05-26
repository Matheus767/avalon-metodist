export type BotGuildSummary = {
	id: string;
	name: string;
};

export type CreatedInvite = {
	url: string;
	guildName: string;
	channelName: string;
};

export interface DiscordGatewayPort {
	listBotGuilds(): Promise<BotGuildSummary[]>;
	hasGuild(guildId: string): Promise<boolean>;
	createInviteForGuild(guildId: string): Promise<CreatedInvite>;
}
