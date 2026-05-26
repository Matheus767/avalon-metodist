import type { DiscordGatewayPort } from './discord/DiscordGatewayPort.ts';
import type { InviteTargetConfigRepository } from './repository/InviteTargetConfigRepository.ts';

export type CommandDependencies = {
	discordGateway: DiscordGatewayPort;
	inviteTargetConfigRepository: InviteTargetConfigRepository;
};
