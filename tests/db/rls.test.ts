import { beforeAll, describe, expect, it } from 'vitest';
import { as, createTestDb, dayOffset, HOTELS, pgErrorCode, roomId, USERS } from './harness';

let db: Awaited<ReturnType<typeof createTestDb>>;

beforeAll(async () => {
  db = await createTestDb();
}, 60_000);

async function insertReservation(input: {
  hotel: string;
  room: string;
  guest?: string;
  adults?: number;
  checkIn: string;
  checkOut: string;
}) {
  const res = await db.query<{ id: string; created_by: string | null; status: string }>(
    `insert into public.reservations (hotel_id, room_id, guest_name, adults, check_in, check_out)
     values ($1, $2, $3, $4, $5, $6)
     returning id, created_by, status`,
    [input.hotel, input.room, input.guest ?? 'Test Misafir', input.adults ?? 1, input.checkIn, input.checkOut],
  );
  return res.rows[0]!;
}

describe('Otel veri ayrımı (RLS)', () => {
  it('Sahil çalışanı yalnızca Sahil otelini ve verisini görür', async () => {
    await as(db, USERS.sahil, async () => {
      const hotels = await db.query<{ code: string }>('select code from public.hotels');
      expect(hotels.rows.map((r) => r.code)).toEqual(['sahil']);

      const foreignRooms = await db.query('select id from public.rooms where hotel_id = $1', [HOTELS.sehir]);
      expect(foreignRooms.rows).toHaveLength(0);

      const reservations = await db.query<{ hotel_id: string }>('select hotel_id from public.reservations');
      expect(reservations.rows.length).toBeGreaterThan(0);
      expect(new Set(reservations.rows.map((r) => r.hotel_id))).toEqual(new Set([HOTELS.sahil]));
    });
  });

  it('Şehir çalışanı yalnızca Şehir otelini ve verisini görür', async () => {
    await as(db, USERS.sehir, async () => {
      const hotels = await db.query<{ code: string }>('select code from public.hotels');
      expect(hotels.rows.map((r) => r.code)).toEqual(['sehir']);

      const foreign = await db.query('select id from public.reservations where hotel_id = $1', [HOTELS.sahil]);
      expect(foreign.rows).toHaveLength(0);

      const summary = await db.query<{ hotel_code: string }>('select hotel_code from public.hotel_day_summary()');
      expect(summary.rows.map((r) => r.hotel_code)).toEqual(['sehir']);
    });
  });

  it('Sahil çalışanı doğrudan istekle Şehir oteline rezervasyon ekleyemez', async () => {
    const sehirRoom = await roomId(db, 'sehir', '402');
    const checkIn = await dayOffset(db, 300);
    const checkOut = await dayOffset(db, 302);

    const code = await as(db, USERS.sahil, () =>
      pgErrorCode(insertReservation({ hotel: HOTELS.sehir, room: sehirRoom, checkIn, checkOut })),
    );
    expect(['42501', 'P0001']).toContain(code);

    const leaked = await db.query('select id from public.reservations where room_id = $1 and check_in = $2', [
      sehirRoom,
      checkIn,
    ]);
    expect(leaked.rows).toHaveLength(0);
  });

  it('Sahil çalışanı kendi otel kimliğiyle başka otelin odasını kullanamaz', async () => {
    const sehirRoom = await roomId(db, 'sehir', '402');
    const code = await as(db, USERS.sahil, async () =>
      pgErrorCode(
        insertReservation({
          hotel: HOTELS.sahil,
          room: sehirRoom,
          checkIn: await dayOffset(db, 310),
          checkOut: await dayOffset(db, 311),
        }),
      ),
    );
    expect(['P0001', '23503']).toContain(code);
  });

  it('Sahil çalışanı Şehir rezervasyonunu iptal edemez veya silemez', async () => {
    const target = await db.query<{ id: string }>(
      `select id from public.reservations where hotel_id = $1 and status = 'onayli' limit 1`,
      [HOTELS.sehir],
    );
    const id = target.rows[0]!.id;

    await as(db, USERS.sahil, async () => {
      const updated = await db.query(`update public.reservations set status = 'iptal' where id = $1 returning id`, [id]);
      expect(updated.rows).toHaveLength(0);
      expect(await pgErrorCode(db.query('delete from public.reservations where id = $1', [id]))).toBe('42501');
    });

    const after = await db.query<{ status: string }>('select status from public.reservations where id = $1', [id]);
    expect(after.rows[0]!.status).toBe('onayli');
  });

  it('Merkez ofis iki oteli görür, toplu özet iki otel döner', async () => {
    await as(db, USERS.merkez, async () => {
      const hotels = await db.query<{ code: string }>('select code from public.hotels order by code');
      expect(hotels.rows.map((r) => r.code)).toEqual(['sahil', 'sehir']);

      const summary = await db.query<{ hotel_code: string; occupied_tonight: number; sellable_rooms: number }>(
        'select hotel_code, occupied_tonight, sellable_rooms from public.hotel_day_summary() order by hotel_code',
      );
      expect(summary.rows.map((r) => r.hotel_code)).toEqual(['sahil', 'sehir']);
      expect(summary.rows[0]!.sellable_rooms).toBe(21);
      expect(summary.rows[1]!.sellable_rooms).toBe(15);
      for (const row of summary.rows) expect(row.occupied_tonight).toBeGreaterThan(0);

      const memberships = await db.query<{ user_id: string }>('select user_id from public.hotel_members');
      expect(memberships.rows).toHaveLength(2);
      expect(memberships.rows.every((m) => m.user_id === USERS.merkez)).toBe(true);
    });
  });

  it('Merkez ofis iki otelde de rezervasyon oluşturabilir', async () => {
    const sahilRoom = await roomId(db, 'sahil', '402');
    const sehirRoom = await roomId(db, 'sehir', '402');
    const checkIn = await dayOffset(db, 320);
    const checkOut = await dayOffset(db, 322);

    await as(db, USERS.merkez, async () => {
      const a = await insertReservation({ hotel: HOTELS.sahil, room: sahilRoom, checkIn, checkOut });
      const b = await insertReservation({ hotel: HOTELS.sehir, room: sehirRoom, checkIn, checkOut });
      expect(a.created_by).toBe(USERS.merkez);
      expect(b.status).toBe('onayli');
    });
  });

  it('İzleyici rolü okur ama rezervasyon oluşturamaz', async () => {
    const room = await roomId(db, 'sahil', '105');
    await as(db, USERS.izleyici, async () => {
      const rooms = await db.query('select id from public.rooms');
      expect(rooms.rows.length).toBe(22);
      const code = await pgErrorCode(
        insertReservation({
          hotel: HOTELS.sahil,
          room,
          checkIn: await dayOffset(db, 330),
          checkOut: await dayOffset(db, 331),
        }),
      );
      expect(code).toBe('42501');
    });
  });

  it('Üyeliği olmayan kullanıcı hiçbir otel verisi görmez', async () => {
    await as(db, USERS.uyeliksiz, async () => {
      expect((await db.query('select id from public.hotels')).rows).toHaveLength(0);
      expect((await db.query('select id from public.reservations')).rows).toHaveLength(0);
      expect((await db.query('select * from public.hotel_day_summary()')).rows).toHaveLength(0);
    });
  });

  it('Giriş yapmamış (anon) istek tablolara ve fonksiyonlara erişemez', async () => {
    await as(db, null, async () => {
      expect(await pgErrorCode(db.query('select id from public.hotels'))).toBe('42501');
      expect(await pgErrorCode(db.query('select id from public.reservations'))).toBe('42501');
      expect(await pgErrorCode(db.query('select * from public.hotel_day_summary()'))).toBe('42501');
    });
  });
});

describe('Rezervasyon kuralları', () => {
  it('Aynı oda çakışan tarihlerde ikinci aktif rezervasyona verilemez', async () => {
    const room = await roomId(db, 'sahil', '104');
    await as(db, USERS.sahil, async () => {
      await insertReservation({
        hotel: HOTELS.sahil,
        room,
        checkIn: await dayOffset(db, 200),
        checkOut: await dayOffset(db, 203),
      });
      const code = await pgErrorCode(
        insertReservation({
          hotel: HOTELS.sahil,
          room,
          checkIn: await dayOffset(db, 202),
          checkOut: await dayOffset(db, 205),
        }),
      );
      expect(code).toBe('23P01');
    });
  });

  it('Çıkış günü aynı odaya yeni giriş yapılabilir (bitişik tarihler çakışma sayılmaz)', async () => {
    const room = await roomId(db, 'sahil', '104');
    await as(db, USERS.sahil, async () => {
      const next = await insertReservation({
        hotel: HOTELS.sahil,
        room,
        checkIn: await dayOffset(db, 203),
        checkOut: await dayOffset(db, 206),
      });
      expect(next.status).toBe('onayli');
    });
  });

  it('İptal edilen rezervasyon odayı serbest bırakır; iptal kaydı tutulur', async () => {
    const room = await roomId(db, 'sahil', '105');
    await as(db, USERS.sahil, async () => {
      const first = await insertReservation({
        hotel: HOTELS.sahil,
        room,
        checkIn: await dayOffset(db, 210),
        checkOut: await dayOffset(db, 214),
      });
      const cancelled = await db.query<{ cancelled_by: string; cancelled_at: string | null }>(
        `update public.reservations set status = 'iptal' where id = $1 returning cancelled_by, cancelled_at`,
        [first.id],
      );
      expect(cancelled.rows[0]!.cancelled_by).toBe(USERS.sahil);
      expect(cancelled.rows[0]!.cancelled_at).not.toBeNull();

      const replacement = await insertReservation({
        hotel: HOTELS.sahil,
        room,
        checkIn: await dayOffset(db, 211),
        checkOut: await dayOffset(db, 213),
      });
      expect(replacement.status).toBe('onayli');
    });
  });

  it('İptal edilmiş rezervasyon yeniden onaylı yapılamaz', async () => {
    const target = await db.query<{ id: string }>(
      `select id from public.reservations where hotel_id = $1 and status = 'iptal' limit 1`,
      [HOTELS.sahil],
    );
    await as(db, USERS.sahil, async () => {
      const code = await pgErrorCode(
        db.query(`update public.reservations set status = 'onayli' where id = $1`, [target.rows[0]!.id]),
      );
      expect(code).toBe('P0001');
    });
  });

  it('Kullanıcı durum, oluşturan veya tarih alanlarını doğrudan yazamaz', async () => {
    const room = await roomId(db, 'sahil', '303');
    const target = await db.query<{ id: string }>(
      `select id from public.reservations where hotel_id = $1 and status = 'onayli' limit 1`,
      [HOTELS.sahil],
    );
    await as(db, USERS.sahil, async () => {
      const checkIn = await dayOffset(db, 220);
      const checkOut = await dayOffset(db, 221);
      expect(
        await pgErrorCode(
          db.query(
            `insert into public.reservations (hotel_id, room_id, guest_name, check_in, check_out, status)
             values ($1, $2, 'Test', $3, $4, 'konaklamada')`,
            [HOTELS.sahil, room, checkIn, checkOut],
          ),
        ),
      ).toBe('42501');
      expect(
        await pgErrorCode(
          db.query(
            `insert into public.reservations (hotel_id, room_id, guest_name, check_in, check_out, created_by)
             values ($1, $2, 'Test', $3, $4, $5)`,
            [HOTELS.sahil, room, checkIn, checkOut, USERS.sehir],
          ),
        ),
      ).toBe('42501');
      expect(
        await pgErrorCode(
          db.query(`update public.reservations set check_out = check_out + 1 where id = $1`, [target.rows[0]!.id]),
        ),
      ).toBe('42501');
    });
  });

  it('Arızalı odaya ve kapasiteyi aşan kişi sayısına rezervasyon yapılamaz', async () => {
    const outOfOrder = await roomId(db, 'sahil', '106');
    const standard = await roomId(db, 'sahil', '303');
    await as(db, USERS.sahil, async () => {
      const checkIn = await dayOffset(db, 230);
      const checkOut = await dayOffset(db, 231);
      expect(
        await pgErrorCode(insertReservation({ hotel: HOTELS.sahil, room: outOfOrder, checkIn, checkOut })),
      ).toBe('P0001');
      expect(
        await pgErrorCode(insertReservation({ hotel: HOTELS.sahil, room: standard, adults: 5, checkIn, checkOut })),
      ).toBe('P0001');
    });
  });

  it('Çıkış tarihi giriş tarihinden sonra olmalıdır', async () => {
    const room = await roomId(db, 'sahil', '303');
    await as(db, USERS.sahil, async () => {
      const day = await dayOffset(db, 240);
      expect(await pgErrorCode(insertReservation({ hotel: HOTELS.sahil, room, checkIn: day, checkOut: day }))).toBe(
        '23514',
      );
    });
  });

  it('Uygun oda araması dolu ve arızalı odaları göstermez', async () => {
    await as(db, USERS.sahil, async () => {
      const today = await dayOffset(db, 0);
      const tomorrow = await dayOffset(db, 1);
      const res = await db.query<{ room_number: string }>(
        'select room_number from public.available_rooms($1, $2, $3, $4)',
        [HOTELS.sahil, today, tomorrow, 2],
      );
      const numbers = res.rows.map((r) => r.room_number);
      expect(numbers).toContain('102'); // yarın giriş var ama bu gece boş
      expect(numbers).not.toContain('106'); // arızalı
      expect(numbers).not.toContain('201'); // konaklamada
      expect(numbers).not.toContain('101'); // bugün çıkış + bugün yeni giriş

      const foreign = await db.query('select * from public.available_rooms($1, $2, $3, $4)', [
        HOTELS.sehir,
        today,
        tomorrow,
        1,
      ]);
      expect(foreign.rows).toHaveLength(0);
    });
  });
});
