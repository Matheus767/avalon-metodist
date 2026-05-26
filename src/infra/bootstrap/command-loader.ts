import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import type { Command } from '../../app/handler/Command.ts';
import type { CommandDependencies } from '../../app/port/CommandDependencies.ts';

type LoadedCommand = {
	filePath: string;
	command: Command;
};

function instantiateCommand(
	exportedValue: unknown,
	commandDependencies?: CommandDependencies,
): unknown {
	if (typeof exportedValue !== 'function') {
		return exportedValue;
	}

	return new (exportedValue as new (dependencies?: CommandDependencies) => unknown)(
		commandDependencies,
	);
}

function isCommand(value: unknown): value is Command {
	return value !== null
		&& typeof value === 'object'
		&& 'data' in value
		&& 'execute' in value;
}

export function collectCommandFiles(dir: string): string[] {
	const paths: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			paths.push(...collectCommandFiles(fullPath));
			continue;
		}

		if (entry.isFile() && entry.name.endsWith('.ts')) {
			paths.push(fullPath);
		}
	}

	return paths;
}

export async function loadCommandsFromDirectory(
	commandDirectory: string,
	commandDependencies?: CommandDependencies,
): Promise<LoadedCommand[]> {
	const commandFiles = collectCommandFiles(commandDirectory);
	const loadedCommands: LoadedCommand[] = [];

	for (const filePath of commandFiles) {
		const moduleUrl = pathToFileURL(filePath).href;
		const mod = await import(moduleUrl);
		const command = instantiateCommand(mod.default, commandDependencies);

		if (isCommand(command)) {
			loadedCommands.push({ filePath, command });
			continue;
		}

		console.log(
			`[WARNING] O comando em ${filePath} não possui "data" ou "execute".`,
		);
	}

	return loadedCommands;
}
