import { describe, expect, it } from 'vitest';
import { loginSchema, registerSchema } from '../../src/lib/schemas/auth';

describe('registerSchema', () => {
  it('accepts a valid registration payload', () => {
    const result = registerSchema.safeParse({
      username: 'macro_hunter',
      email: 'user@example.com',
      password: 'supersecure123',
      locale: 'en',
      goalType: 'BUILD_MUSCLE'
    });

    expect(result.success).toBe(true);
  });

  it('rejects weak payloads', () => {
    const result = registerSchema.safeParse({
      username: 'x',
      email: 'not-email',
      password: '1'
    });

    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('requires email and password', () => {
    expect(loginSchema.safeParse({ email: 'user@example.com', password: 'x' }).success).toBe(true);
    expect(loginSchema.safeParse({ email: 'bad-email', password: '' }).success).toBe(false);
  });
});
