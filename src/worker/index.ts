import { createCommandRegistry } from '../infra/bootstrap/command-registry.ts';
import { WorkerDeferredInteractionContext } from '../infra/discord/adapters/WorkerDeferredInteractionContext.ts';
import { WorkerDiscordHttpGateway } from '../infra/discord/WorkerDiscordHttpGateway.ts';
import type { DiscordInteraction } from '../infra/discord/types/DiscordInteraction.ts';
import { InviteTargetConfigKvRepository } from '../infra/repository/InviteTargetConfigKvRepository.ts';
import type { ExecutionContextLike, WorkerEnv } from './types.ts';

const DISCORD_INTERACTION_PING = 1;
const DISCORD_INTERACTION_APPLICATION_COMMAND = 2;
const DISCORD_INTERACTION_CHANNEL_MESSAGE_WITH_SOURCE = 4;
const DISCORD_EPHEMERAL_FLAG = 1 << 6;

export default {
	async fetch(request: Request, env: WorkerEnv, _ctx: ExecutionContextLike): Promise<Response> {
		if (request.method === 'GET') {
			return jsonResponse({ status: 'ok' }, 200);
		}

		if (request.method !== 'POST') {
			return jsonResponse({ error: 'Method not allowed.' }, 405);
		}

		const signature = request.headers.get('X-Signature-Ed25519');
		const timestamp = request.headers.get('X-Signature-Timestamp');
		const rawBody = await request.text();
		const isSignatureValid = await verifyDiscordSignature(
			rawBody,
			signature,
			timestamp,
			env.DISCORD_PUBLIC_KEY,
		);

		if (!isSignatureValid) {
			return jsonResponse({ error: 'Invalid request signature.' }, 401);
		}

		let interaction: DiscordInteraction;
		try {
			interaction = JSON.parse(rawBody) as DiscordInteraction;
		} catch {
			return jsonResponse({ error: 'Invalid JSON payload.' }, 400);
		}

		if (interaction.type === DISCORD_INTERACTION_PING) {
			return jsonResponse({ type: DISCORD_INTERACTION_PING }, 200);
		}

		if (interaction.type !== DISCORD_INTERACTION_APPLICATION_COMMAND) {
			return jsonResponse({ error: 'Unsupported interaction type.' }, 400);
		}

		const commandName = interaction.data?.name;

		if (!commandName) {
			return discordMessageResponse('Comando inválido recebido do Discord.', true, 400);
		}

		const dependencies = {
			discordGateway: new WorkerDiscordHttpGateway(env.DISCORD_TOKEN),
			inviteTargetConfigRepository: new InviteTargetConfigKvRepository(env.INVITE_CONFIG_KV),
		};
		const commandRegistry = createCommandRegistry(dependencies);
		const command = commandRegistry.get(commandName);

		if (!command) {
			return discordMessageResponse(`Comando /${commandName} não encontrado.`, true, 404);
		}

		const interactionContext = new WorkerDeferredInteractionContext(interaction);

		try {
			await command.execute(interactionContext);
		} catch (error) {
			console.error(error);
			return discordMessageResponse(
				'Ocorreu um erro ao executar este comando.',
				true,
				500,
			);
		}

		const reply = interactionContext.getReplyOptions();
		return jsonResponse({
			type: DISCORD_INTERACTION_CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: reply.content,
				flags: reply.ephemeral ? DISCORD_EPHEMERAL_FLAG : undefined,
			},
		});
	},
};

function discordMessageResponse(content: string, ephemeral: boolean, status = 200): Response {
	return jsonResponse(
		{
			type: DISCORD_INTERACTION_CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content,
				flags: ephemeral ? DISCORD_EPHEMERAL_FLAG : undefined,
			},
		},
		status,
	);
}

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			'content-type': 'application/json; charset=utf-8',
		},
	});
}

async function verifyDiscordSignature(
	rawBody: string,
	signature: string | null,
	timestamp: string | null,
	publicKey: string,
): Promise<boolean> {
	if (!signature || !timestamp) {
		return false;
	}

	const encoder = new TextEncoder();
	const signatureBytes = hexToArrayBuffer(signature);
	const publicKeyBytes = hexToArrayBuffer(publicKey);
	const payload = encoder.encode(`${timestamp}${rawBody}`);

	try {
		const cryptoKey = await crypto.subtle.importKey(
			'raw',
			publicKeyBytes,
			{
				name: 'Ed25519',
			},
			false,
			['verify'],
		);

		return crypto.subtle.verify('Ed25519', cryptoKey, signatureBytes, payload);
	} catch {
		return false;
	}
}

function hexToUint8Array(hex: string): Uint8Array {
	if (hex.length % 2 !== 0) {
		throw new Error('Hex inválido.');
	}

	const bytes = new Uint8Array(hex.length / 2);
	for (let index = 0; index < hex.length; index += 2) {
		bytes[index / 2] = Number.parseInt(hex.slice(index, index + 2), 16);
	}

	return bytes;
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
	const bytes = hexToUint8Array(hex);
	const copy = new Uint8Array(bytes.length);
	copy.set(bytes);
	return copy.buffer;
}
