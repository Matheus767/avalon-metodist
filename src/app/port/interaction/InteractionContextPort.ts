export type InteractionReplyOptions = {
	content: string;
	ephemeral?: boolean;
};

export interface InteractionContextPort {
	getGuildId(): string | null;
	isInGuild(): boolean;
	hasAdministratorPermission(): boolean;
	getIntegerOption(name: string): number | null;
	getUser(): { id: string; username: string };
	reply(options: InteractionReplyOptions): Promise<void>;
}
