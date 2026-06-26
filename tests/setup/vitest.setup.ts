// Vitest setup file. Runs before every test file.
//
// We pin NODE_ENV=test here so the env validator accepts test-time values
// (e.g. AI_PROVIDER=noop, PORT=0) without crashing.
process.env.NODE_ENV = 'test';
process.env.AI_PROVIDER ??= 'noop';
process.env.LOG_LEVEL ??= 'silent';
process.env.PORT ??= '0';
process.env.HOST ??= '127.0.0.1';
