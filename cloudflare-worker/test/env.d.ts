declare module 'cloudflare:test' {
	// Module augmentation: the test runtime's env is exactly the worker's Env.
	// eslint-disable-next-line @typescript-eslint/no-empty-object-type
	interface ProvidedEnv extends Env {}
}
