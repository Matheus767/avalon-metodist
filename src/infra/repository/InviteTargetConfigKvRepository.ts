import type { InviteTargetConfigRepository } from '../../app/port/repository/InviteTargetConfigRepository.ts';

type KVNamespaceLike = {
	get(key: string): Promise<string | null>;
	put(key: string, value: string): Promise<void>;
};

const INVITE_CONFIG_KEY_PREFIX = 'invite-target:';

function getInviteConfigKey(originGuildId: string): string {
	return `${INVITE_CONFIG_KEY_PREFIX}${originGuildId}`;
}

export class InviteTargetConfigKvRepository implements InviteTargetConfigRepository {
	constructor(private readonly namespace: KVNamespaceLike) {}

	async getTargetGuildId(originGuildId: string): Promise<string | null> {
		return this.namespace.get(getInviteConfigKey(originGuildId));
	}

	async setTargetGuildId(originGuildId: string, targetGuildId: string): Promise<void> {
		await this.namespace.put(getInviteConfigKey(originGuildId), targetGuildId);
	}
}
