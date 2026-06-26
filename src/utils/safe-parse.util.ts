import type { ZodTypeAny, infer as ZodInfer } from 'zod';
import { err, ok, type Result } from '../types/result.types.js';
import { ValidationError, type FieldIssue } from '../errors/ValidationError.js';

/**
 * Parses input with a Zod schema and converts failures into a typed
 * `ValidationError`. Used by the `validate` middleware so every layer
 * downstream can trust the parsed value.
 */
export const safeParse = <T extends ZodTypeAny>(
  schema: T,
  input: unknown,
  options: { errorMessage?: string } = {},
): Result<ZodInfer<T>, ValidationError> => {
  const parsed = schema.safeParse(input);
  if (parsed.success) return ok(parsed.data as ZodInfer<T>);

  const fields: FieldIssue[] = parsed.error.issues.map((issue) => {
    const field: FieldIssue = {
      path: issue.path.join('.') || '<root>',
      message: issue.message,
    };
    if (issue.code) field.code = issue.code;
    return field;
  });

  return err(new ValidationError(options.errorMessage ?? 'Validation failed', { fields }));
};