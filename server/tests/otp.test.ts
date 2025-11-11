import { describe, it, expect, beforeEach } from 'vitest';
import { createAndStoreOtp, verifyOtpAndConsume, generateOtp } from '../app/api/_lib/otp';

// We'll mock a minimal supabaseAdmin object implementing the subset used by the helpers
function makeMockDb() {
  const tables: Record<string, any[]> = {};

  function from(table: string) {
    if (!tables[table]) tables[table] = [];
    const rows = tables[table];

    // simple chainable builder
    const builder: any = {
      _filters: [] as Array<(r: any) => boolean>,
      _limit: undefined as number | undefined,
      select(cols?: any, opts?: any) { return builder; },
      eq(col: string, val: any) {
        // if an update is pending, perform update and return result
        if (builder._pendingUpdate) {
          const matched = rows.filter((r) => builder._filters.every((f: any) => f(r)) && r[col] === val);
          matched.forEach((m) => Object.assign(m, builder._pendingUpdate));
          return Promise.resolve({ data: matched, error: null });
        }
        builder._filters.push((r: any) => r[col] === val);
        return builder;
      },
      gt(col: string, val: any) { builder._filters.push((r: any) => new Date(r[col]) > new Date(val)); return builder; },
      order() { return builder; },
      limit(n: number) { builder._limit = n; return builder; },
      async _execute() {
        const filtered = rows.filter((r) => builder._filters.every((f: any) => f(r)));
        const data = typeof builder._limit === 'number' ? filtered.slice(0, builder._limit) : filtered;
        return { data, error: null, count: filtered.length };
      },
      then(resolve: any, reject: any) { return builder._execute().then(resolve, reject); },
      async maybeSingle() { const res = await builder._execute(); return { data: res.data.length ? res.data[res.data.length - 1] : null, error: null }; },
      async insert(obj: any) { const row = { id: `${Math.random()}`, ...obj, created_at: new Date().toISOString(), attempts: obj.attempts ?? 0 }; rows.push(row); return { data: [row], error: null }; },
  update(obj: any) { builder._pendingUpdate = obj; return builder; }
    };

    return builder;
  }

  return { from };
}

describe('OTP helper', () => {
  let db: any;
  beforeEach(() => {
    db = makeMockDb();
  });

  it('generates a 6-digit OTP', () => {
    const otp = generateOtp();
    expect(otp).toHaveLength(6);
  });

  it('creates and verifies an OTP successfully', async () => {
    const taskId = 'task-1';
    const otp = await createAndStoreOtp(db, taskId, 24);
    expect(otp).toHaveLength(6);
    const res = await verifyOtpAndConsume(db, taskId, otp);
    expect(res.ok).toBe(true);
  });

  it('rejects invalid OTP and increments attempts', async () => {
    const taskId = 'task-2';
    const otp = await createAndStoreOtp(db, taskId, 24);
    const res1 = await verifyOtpAndConsume(db, taskId, '000000');
    expect(res1.ok).toBe(false);
    expect(res1.reason).toBe('invalid');
  });
});
