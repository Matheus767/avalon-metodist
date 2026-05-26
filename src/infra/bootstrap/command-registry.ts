import type { Command } from '../../app/handler/Command.ts';
import type { CommandDependencies } from '../../app/port/CommandDependencies.ts';
import ConfigUseCase from '../../app/use-case/utility/config-use-case.ts';
import InviteUseCase from '../../app/use-case/utility/invite-use-case.ts';
import ListServersUseCase from '../../app/use-case/utility/list-servers-use-case.ts';
import PingUseCase from '../../app/use-case/utility/ping-use-case.ts';
import UserUseCase from '../../app/use-case/utility/user-use-case.ts';

type CommandFactory = (dependencies?: CommandDependencies) => Command;

const commandFactories: Record<string, CommandFactory> = {
	ping: () => new PingUseCase(),
	user: () => new UserUseCase(),
	listservers: (dependencies) => new ListServersUseCase(dependencies),
	config: (dependencies) => new ConfigUseCase(dependencies),
	invite: (dependencies) => new InviteUseCase(dependencies),
};

export function createCommandRegistry(dependencies?: CommandDependencies): Map<string, Command> {
	return new Map(
		Object.entries(commandFactories).map(([name, factory]) => [
			name,
			factory(dependencies),
		]),
	);
}

export function listAllCommands(dependencies?: CommandDependencies): Command[] {
	return Array.from(createCommandRegistry(dependencies).values());
}
