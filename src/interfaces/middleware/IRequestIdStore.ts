/**
 * Contract for anything that produces request ids. The default
 * implementation uses `uuid` v7; tests can inject a counter.
 */
export interface IRequestIdStore {
  generate(): string;
  readonly headerName: string;
}