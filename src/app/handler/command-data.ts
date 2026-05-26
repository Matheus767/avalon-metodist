import type { CommandData, CommandJsonData } from './Command.ts';

export function createCommandData(
	command: CommandJsonData,
): CommandData {
	return {
		name: command.name,
		toJSON(): CommandJsonData {
			return command;
		},
	};
}
