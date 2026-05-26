function getRequiredEnv(
	name: 'BOT_TOKEN' | 'CLIENT_ID' | 'GUILD_ID',
	fallbackName?: 'DISCORD_TOKEN' | 'DISCORD_APPLICATION_ID' | 'DISCORD_TEST_GUILD_ID',
): string {
	const value = process.env[name] ?? (fallbackName ? process.env[fallbackName] : undefined);
	if (!value) {
		throw new Error(`Defina ${name} no ambiente (.env).`);
	}
	return value;
}

export const token = getRequiredEnv('BOT_TOKEN', 'DISCORD_TOKEN');
export const clientId = getRequiredEnv('CLIENT_ID', 'DISCORD_APPLICATION_ID');
export const guildId = getRequiredEnv('GUILD_ID', 'DISCORD_TEST_GUILD_ID');