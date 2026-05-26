export type WorkerEnv = {
	DISCORD_TOKEN: string;
	DISCORD_PUBLIC_KEY: string;
	DISCORD_APPLICATION_ID: string;
	INVITE_CONFIG_KV: {
		get(key: string): Promise<string | null>;
		put(key: string, value: string): Promise<void>;
	};
};

export type ExecutionContextLike = {
	waitUntil(promise: Promise<unknown>): void;
};
