import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

const load = (filename: string): string =>
  readFileSync(resolve(here, filename), 'utf8');

export const ANALYZE_TICKET_PROMPTS = Object.freeze({
  version: '1.0.0',
  system: load('analyze-ticket.v1.system.txt'),
  userTemplate: load('analyze-ticket.v1.user.txt'),
});
