import type { InteractionContextPort } from '../port/interaction/InteractionContextPort.ts';

export type CommandData = {
	name: string;
	toJSON(): unknown;
};

export interface Command {
	data: CommandData;
	execute(interaction: InteractionContextPort): Promise<void>;
}
