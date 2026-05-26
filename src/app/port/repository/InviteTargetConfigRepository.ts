export interface InviteTargetConfigRepository {
	getTargetGuildId(originGuildId: string): Promise<string | null>;
	setTargetGuildId(originGuildId: string, targetGuildId: string): Promise<void>;
}
