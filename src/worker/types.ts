export interface KVNamespaceLike {
	get(key: string): Promise<string | null>;
	put(key: string, value: string): Promise<void>;
}

export type WorkerBindings = {
	DISCORD_TOKEN: string;
	DISCORD_PUBLIC_KEY: string;
	DISCORD_APPLICATION_ID: string;
	DISCORD_TEST_GUILD_ID?: string;
	INVITE_CONFIG_KV: KVNamespaceLike;
};
