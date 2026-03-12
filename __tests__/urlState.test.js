/**
 * TDD-тесты для lib/urlState.js
 *
 * Статус: ЧАСТИЧНО RED — lib/urlState.js существует, но содержит баг
 * с кириллицей при кодировании/декодировании через btoa/atob.
 *
 * Обнаруженный баг (RED тесты):
 *   btoa(encodeURIComponent(json)) + atob(raw) в Node.js некорректно
 *   обрабатывает multi-byte символы — кириллица возвращается как "Ð¢ÐµÑÑ".
 *
 * Исправление в lib/urlState.js:
 *   Encode: Buffer.from(JSON.stringify(arr)).toString("base64")
 *   Decode: JSON.parse(Buffer.from(raw, "base64").toString("utf8"))
 *
 * Запусти: npm test -- urlState
 */

import { encodeStateToUrl, decodeStateFromUrl } from "../lib/urlState.js";

// ── Тестовые данные ───────────────────────────────────────────────────────────

const baseState = {
  leads: 5,
  conv: 15,
  avgCheck: 50,
  lessons: 40,
  price: 30,
  tRate: 10,
  premLessons: 0,
  premPrice: 45,
  premRate: 15,
  managerCount: 2,
  mgr1Fix: 350,
  mgr1Bonus: 7,
  mgr1Kpi: 30,
  mgr2Fix: 350,
  mgr2Bonus: 7,
  mgr2Kpi: 30,
  other: 100,
  products: [
    { id: 1, name: "Тест", unitPrice: 50, unitsSoldPerMonth: 2, unitCost: 10 },
  ],
  teachers: [
    {
      id: 1,
      name: "Мари",
      lessonsPerMonth: 60,
      pricePerLesson: 45,
      ratePerLesson: 15,
      avgLessonsPerStudent: 8,
    },
  ],
};

// ── encodeStateToUrl ──────────────────────────────────────────────────────────

describe("encodeStateToUrl", () => {
  test("кодирует скалярные значения в короткие ключи", () => {
    const result = encodeStateToUrl(baseState);
    const params = new URLSearchParams(result);

    expect(params.get("l")).toBe("5");
    expect(params.get("cv")).toBe("15");
    expect(params.get("ac")).toBe("50");
    expect(params.get("ls")).toBe("40");
    expect(params.get("pr")).toBe("30");
    expect(params.get("tr")).toBe("10");
    expect(params.get("pl")).toBe("0");
    expect(params.get("pp")).toBe("45");
    expect(params.get("pmr")).toBe("15");
    expect(params.get("mc")).toBe("2");
    expect(params.get("m1f")).toBe("350");
    expect(params.get("m1b")).toBe("7");
    expect(params.get("m1k")).toBe("30");
    expect(params.get("m2f")).toBe("350");
    expect(params.get("m2b")).toBe("7");
    expect(params.get("m2k")).toBe("30");
    expect(params.get("ot")).toBe("100");
  });

  test("результат парсится как URLSearchParams без ошибок", () => {
    const result = encodeStateToUrl(baseState);
    expect(() => new URLSearchParams(result)).not.toThrow();
    const params = new URLSearchParams(result);
    // Убедимся что параметры присутствуют (не пустая строка)
    expect([...params.keys()].length).toBeGreaterThan(0);
  });

  test("кодирует массив products в base64", () => {
    const result = encodeStateToUrl(baseState);
    const params = new URLSearchParams(result);
    const pdValue = params.get("pd");

    expect(pdValue).not.toBeNull();
    expect(typeof pdValue).toBe("string");
    expect(pdValue.length).toBeGreaterThan(0);

    // После исправления бага кириллицы формат должен быть:
    // Buffer.from(JSON.stringify(arr)).toString("base64")
    // Декодирование: JSON.parse(Buffer.from(value, "base64").toString("utf8"))
    const decoded = JSON.parse(Buffer.from(pdValue, "base64").toString("utf8"));
    expect(decoded).toEqual(baseState.products);
  });

  test("кодирует массив teachers в base64", () => {
    const result = encodeStateToUrl(baseState);
    const params = new URLSearchParams(result);
    const tcValue = params.get("tc");

    expect(tcValue).not.toBeNull();
    expect(typeof tcValue).toBe("string");
    expect(tcValue.length).toBeGreaterThan(0);

    // После исправления бага кириллицы формат должен быть:
    // Buffer.from(JSON.stringify(arr)).toString("base64")
    const decoded = JSON.parse(Buffer.from(tcValue, "base64").toString("utf8"));
    expect(decoded).toEqual(baseState.teachers);
  });

  test("кириллица в именах кодируется без ошибок", () => {
    const stateWithCyrillic = {
      ...baseState,
      products: [
        { id: 1, name: "Курс французского", unitPrice: 100, unitsSoldPerMonth: 5, unitCost: 20 },
      ],
      teachers: [
        {
          id: 1,
          name: "Александра Петрова",
          lessonsPerMonth: 80,
          pricePerLesson: 50,
          ratePerLesson: 20,
          avgLessonsPerStudent: 10,
        },
      ],
    };

    expect(() => encodeStateToUrl(stateWithCyrillic)).not.toThrow();

    // Проверяем через round-trip: encodeStateToUrl → decodeStateFromUrl
    // чтобы не зависеть от внутреннего формата base64
    const result = encodeStateToUrl(stateWithCyrillic);
    const decoded = decodeStateFromUrl(result);

    expect(decoded.products[0].name).toBe("Курс французского");
    expect(decoded.teachers[0].name).toBe("Александра Петрова");
  });

  test("пустые массивы кодируются корректно", () => {
    const stateWithEmptyArrays = { ...baseState, products: [], teachers: [] };

    // Проверяем через round-trip
    const result = encodeStateToUrl(stateWithEmptyArrays);
    const decoded = decodeStateFromUrl(result);

    expect(decoded.products).toEqual([]);
    expect(decoded.teachers).toEqual([]);
  });
});

// ── decodeStateFromUrl ────────────────────────────────────────────────────────

describe("decodeStateFromUrl", () => {
  test("null → возвращает null", () => {
    expect(decodeStateFromUrl(null)).toBeNull();
  });

  test("пустая строка → возвращает null", () => {
    expect(decodeStateFromUrl("")).toBeNull();
  });

  test("восстанавливает скалярные значения из закодированной строки", () => {
    const encoded = encodeStateToUrl(baseState);
    const decoded = decodeStateFromUrl(encoded);

    expect(decoded).not.toBeNull();
    expect(decoded.leads).toBe(5);
    expect(decoded.conv).toBe(15);
    expect(decoded.avgCheck).toBe(50);
    expect(decoded.lessons).toBe(40);
    expect(decoded.price).toBe(30);
    expect(decoded.tRate).toBe(10);
    expect(decoded.premLessons).toBe(0);
    expect(decoded.premPrice).toBe(45);
    expect(decoded.premRate).toBe(15);
    expect(decoded.managerCount).toBe(2);
    expect(decoded.mgr1Fix).toBe(350);
    expect(decoded.mgr1Bonus).toBe(7);
    expect(decoded.mgr1Kpi).toBe(30);
    expect(decoded.mgr2Fix).toBe(350);
    expect(decoded.mgr2Bonus).toBe(7);
    expect(decoded.mgr2Kpi).toBe(30);
    expect(decoded.other).toBe(100);
  });

  test("восстанавливает leads=20 из параметра l=20", () => {
    const minimal = new URLSearchParams({ l: "20" }).toString();
    const decoded = decodeStateFromUrl(minimal);

    expect(decoded).not.toBeNull();
    expect(decoded.leads).toBe(20);
  });

  test("отсутствующий параметр → undefined для этого поля", () => {
    // Строка только с leads — остальные поля должны быть undefined
    const minimal = new URLSearchParams({ l: "10" }).toString();
    const decoded = decodeStateFromUrl(minimal);

    expect(decoded.conv).toBeUndefined();
    expect(decoded.avgCheck).toBeUndefined();
    expect(decoded.managerCount).toBeUndefined();
  });

  test("восстанавливает массив products с кириллицей", () => {
    const stateWithCyrillic = {
      ...baseState,
      products: [
        { id: 2, name: "Разговорный клуб", unitPrice: 35, unitsSoldPerMonth: 10, unitCost: 5 },
      ],
    };
    const encoded = encodeStateToUrl(stateWithCyrillic);
    const decoded = decodeStateFromUrl(encoded);

    expect(decoded.products).toEqual(stateWithCyrillic.products);
    expect(decoded.products[0].name).toBe("Разговорный клуб");
  });

  test("повреждённый base64 в products → не выбрасывает ошибку, возвращает null или дефолт", () => {
    // Формируем строку с намеренно повреждённым base64 для pd
    const params = new URLSearchParams({
      l: "5",
      pd: "!!!невалидный_base64!!!",
    });

    expect(() => decodeStateFromUrl(params.toString())).not.toThrow();

    const decoded = decodeStateFromUrl(params.toString());
    // Функция может вернуть null (весь decode падает) или объект с null/[] для products
    if (decoded !== null) {
      // Если вернула объект — products должен быть null или пустым массивом, но не выбрасывать
      expect(
        decoded.products === null ||
        decoded.products === undefined ||
        Array.isArray(decoded.products)
      ).toBe(true);
    }
  });

  test("повреждённый base64 в teachers → не выбрасывает ошибку", () => {
    const params = new URLSearchParams({
      l: "5",
      tc: "###невалидный###",
    });

    expect(() => decodeStateFromUrl(params.toString())).not.toThrow();

    const decoded = decodeStateFromUrl(params.toString());
    if (decoded !== null) {
      expect(
        decoded.teachers === null ||
        decoded.teachers === undefined ||
        Array.isArray(decoded.teachers)
      ).toBe(true);
    }
  });

  test("нулевые значения (conv=0) восстанавливаются как 0, не как undefined", () => {
    const stateWithZeros = {
      ...baseState,
      conv: 0,
      premLessons: 0,
      mgr1Kpi: 0,
    };
    const encoded = encodeStateToUrl(stateWithZeros);
    const decoded = decodeStateFromUrl(encoded);

    expect(decoded.conv).toBe(0);
    expect(decoded.premLessons).toBe(0);
    expect(decoded.mgr1Kpi).toBe(0);
    // Явно: не undefined, не null
    expect(decoded.conv).not.toBeUndefined();
    expect(decoded.conv).not.toBeNull();
  });
});

// ── Round-trip: encode → decode → encode ─────────────────────────────────────

describe("round-trip: encode → decode → encode", () => {
  test("идемпотентность: повторное кодирование даёт тот же результат", () => {
    const encoded1 = encodeStateToUrl(baseState);
    const decoded = decodeStateFromUrl(encoded1);
    const encoded2 = encodeStateToUrl(decoded);

    // Сравниваем через URLSearchParams чтобы не зависеть от порядка параметров
    const params1 = new URLSearchParams(encoded1);
    const params2 = new URLSearchParams(encoded2);

    // Все скалярные ключи должны совпадать
    const scalarKeys = ["l", "cv", "ac", "ls", "pr", "tr", "pl", "pp", "pmr", "mc",
                        "m1f", "m1b", "m1k", "m2f", "m2b", "m2k", "ot"];
    for (const key of scalarKeys) {
      expect(params2.get(key)).toBe(params1.get(key));
    }
  });

  test("все скалярные значения совпадают после round-trip", () => {
    const encoded = encodeStateToUrl(baseState);
    const decoded = decodeStateFromUrl(encoded);

    expect(decoded.leads).toBe(baseState.leads);
    expect(decoded.conv).toBe(baseState.conv);
    expect(decoded.avgCheck).toBe(baseState.avgCheck);
    expect(decoded.lessons).toBe(baseState.lessons);
    expect(decoded.price).toBe(baseState.price);
    expect(decoded.tRate).toBe(baseState.tRate);
    expect(decoded.premLessons).toBe(baseState.premLessons);
    expect(decoded.premPrice).toBe(baseState.premPrice);
    expect(decoded.premRate).toBe(baseState.premRate);
    expect(decoded.managerCount).toBe(baseState.managerCount);
    expect(decoded.mgr1Fix).toBe(baseState.mgr1Fix);
    expect(decoded.mgr1Bonus).toBe(baseState.mgr1Bonus);
    expect(decoded.mgr1Kpi).toBe(baseState.mgr1Kpi);
    expect(decoded.mgr2Fix).toBe(baseState.mgr2Fix);
    expect(decoded.mgr2Bonus).toBe(baseState.mgr2Bonus);
    expect(decoded.mgr2Kpi).toBe(baseState.mgr2Kpi);
    expect(decoded.other).toBe(baseState.other);
  });

  test("массив products сохраняется точно после round-trip", () => {
    const encoded = encodeStateToUrl(baseState);
    const decoded = decodeStateFromUrl(encoded);

    expect(decoded.products).toEqual(baseState.products);
    expect(decoded.products).toHaveLength(1);
    expect(decoded.products[0].name).toBe("Тест");
    expect(decoded.products[0].unitPrice).toBe(50);
    expect(decoded.products[0].unitsSoldPerMonth).toBe(2);
    expect(decoded.products[0].unitCost).toBe(10);
  });

  test("массив teachers сохраняется точно после round-trip", () => {
    const encoded = encodeStateToUrl(baseState);
    const decoded = decodeStateFromUrl(encoded);

    expect(decoded.teachers).toEqual(baseState.teachers);
    expect(decoded.teachers).toHaveLength(1);
    expect(decoded.teachers[0].name).toBe("Мари");
    expect(decoded.teachers[0].lessonsPerMonth).toBe(60);
    expect(decoded.teachers[0].pricePerLesson).toBe(45);
    expect(decoded.teachers[0].ratePerLesson).toBe(15);
    expect(decoded.teachers[0].avgLessonsPerStudent).toBe(8);
  });
});