function getRequiredEnv(name: 'BOT_TOKEN' | 'CLIENT_ID' | 'GUILD_ID'): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`Defina ${name} no ambiente (.env).`);
	}
	return value;
}

export const token = getRequiredEnv('BOT_TOKEN');
export const clientId = getRequiredEnv('CLIENT_ID');
export const guildId = getRequiredEnv('GUILD_ID');