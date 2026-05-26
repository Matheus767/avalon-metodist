<<<<<<< Updated upstream
import type { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
=======
import type { RESTPostAPIApplicationCommandsJSONBody } from 'discord-api-types/v10';

import type { InteractionContextPort } from '../port/interaction/InteractionContextPort.ts';

export type CommandData = {
	name: string;
	toJSON(): RESTPostAPIApplicationCommandsJSONBody;
};
>>>>>>> Stashed changes

export interface Command {
	data: SlashCommandBuilder;
	execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
