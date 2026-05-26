import type { InviteTargetConfigRepository } from '../../app/port/repository/InviteTargetConfigRepository.ts';
import type { KVNamespaceLike } from '../../worker/types.ts';

export class InviteTargetConfigKvRepository implements InviteTargetConfigRepository {
	constructor(
		private readonly namespace: KVNamespaceLike,
		private readonly keyPrefix = 'invite-target',
	) {}

	async getTargetGuildId(originGuildId: string): Promise<string | null> {
		return this.namespace.get(this.buildKey(originGuildId));
	}

	async setTargetGuildId(originGuildId: string, targetGuildId: string): Promise<void> {
		await this.namespace.put(this.buildKey(originGuildId), targetGuildId);
	}

	private buildKey(originGuildId: string): string {
		return `${this.keyPrefix}:${originGuildId}`;
	}
}
