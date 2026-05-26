import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';

import type { CommandData } from './Command.ts';

export function createCommandData(
	command: RESTPostAPIApplicationCommandsJSONBody,
): CommandData {
	return {
		name: command.name,
		toJSON(): RESTPostAPIApplicationCommandsJSONBody {
			return command;
		},
	};
}
