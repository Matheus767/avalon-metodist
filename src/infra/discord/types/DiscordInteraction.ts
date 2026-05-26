export type DiscordInteractionOption = {
	name: string;
	type: number;
	value?: string | number | boolean;
	options?: DiscordInteractionOption[];
};

export type DiscordInteraction = {
	type: number;
	token?: string;
	application_id?: string;
	guild_id?: string;
	member?: {
		permissions?: string;
		user?: {
			id: string;
			username: string;
		};
	};
	user?: {
		id: string;
		username: string;
	};
	data?: {
		name?: string;
		options?: DiscordInteractionOption[];
	};
};
