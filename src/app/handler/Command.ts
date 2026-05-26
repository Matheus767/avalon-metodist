import type { InteractionContextPort } from '../port/interaction/InteractionContextPort.ts';

export type CommandOptionData = {
	name: string;
	description: string;
	type: number;
	required?: boolean;
	min_value?: number;
	options?: CommandOptionData[];
};

export type CommandJsonData = {
	name: string;
	description: string;
	type: number;
	options?: CommandOptionData[];
};

export type CommandData = {
	name: string;
	toJSON(): CommandJsonData;
};

export interface Command {
	data: CommandData;
	execute(interaction: InteractionContextPort): Promise<void>;
}
