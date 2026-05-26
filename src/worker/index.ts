export default {
	async fetch(_request: Request): Promise<Response> {
		return new Response('Avalon Metodist worker is running.', {
			status: 200,
			headers: {
				'content-type': 'text/plain; charset=utf-8',
			},
		});
	},
};
