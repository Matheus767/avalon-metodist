import fs from 'node:fs/promises';
import path from 'node:path';

import type { InviteTargetConfigRepository } from '../../app/port/repository/InviteTargetConfigRepository.ts';

type ConfigMap = Record<string, string>;

export class InviteTargetConfigJsonRepository implements InviteTargetConfigRepository {
	constructor(private readonly filePath: string) {}

	async getTargetGuildId(originGuildId: string): Promise<string | null> {
		const allConfig = await this.readConfig();

		return allConfig[originGuildId] ?? null;
	}

	async setTargetGuildId(originGuildId: string, targetGuildId: string): Promise<void> {
		const allConfig = await this.readConfig();

		allConfig[originGuildId] = targetGuildId;
		await this.writeConfig(allConfig);
	}

	private async readConfig(): Promise<ConfigMap> {
		try {
			const raw = await fs.readFile(this.filePath, 'utf-8');
			const parsed = JSON.parse(raw) as unknown;

			if (!this.isConfigMap(parsed)) {
				return {};
			}

			return parsed;
		} catch (error) {
			const nodeError = error as NodeJS.ErrnoException;

			if (nodeError.code === 'ENOENT') {
				return {};
			}

			throw error;
		}
	}

	private async writeConfig(config: ConfigMap): Promise<void> {
		await fs.mkdir(path.dirname(this.filePath), { recursive: true });
		await fs.writeFile(this.filePath, JSON.stringify(config, null, 2), 'utf-8');
	}

	private isConfigMap(value: unknown): value is ConfigMap {
		if (!value || typeof value !== 'object' || Array.isArray(value)) {
			return false;
		}

		return Object.values(value).every((entry) => typeof entry === 'string');
	}
}
