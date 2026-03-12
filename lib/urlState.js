// Схема коротких ключей для URL
const KEY_MAP = {
  leads: "l",
  conv: "cv",
  avgCheck: "ac",
  lessons: "ls",
  price: "pr",
  tRate: "tr",
  premLessons: "pl",
  premPrice: "pp",
  premRate: "pmr",
  managerCount: "mc",
  mgr1Fix: "m1f",
  mgr1Bonus: "m1b",
  mgr1Kpi: "m1k",
  mgr2Fix: "m2f",
  mgr2Bonus: "m2b",
  mgr2Kpi: "m2k",
  other: "ot",
};

const ARRAY_KEYS = {
  products: "pd",
  teachers: "tc",
};

export const DEFAULT_STATE = {
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
    { id: "p1",  name: "Курс «Французский по карте города»", unitPrice: 70,  unitsSoldPerMonth: 5,  unitCost: 0  },
    { id: "p2",  name: 'Книга "Жопарль"',                    unitPrice: 20,  unitsSoldPerMonth: 10, unitCost: 8  },
    { id: "p3",  name: "DELF B1 (полный гайд)",              unitPrice: 40,  unitsSoldPerMonth: 3,  unitCost: 0  },
    { id: "p4",  name: "DELF B1: Аудирование",               unitPrice: 12,  unitsSoldPerMonth: 5,  unitCost: 0  },
    { id: "p5",  name: "DELF B1: Письменная речь",           unitPrice: 12,  unitsSoldPerMonth: 3,  unitCost: 0  },
    { id: "p6",  name: "DELF B1: Чтение",                    unitPrice: 12,  unitsSoldPerMonth: 4,  unitCost: 0  },
    { id: "p7",  name: "DELF B1: Устная речь",               unitPrice: 12,  unitsSoldPerMonth: 3,  unitCost: 0  },
    { id: "p8",  name: "DELF B2 (полный гайд)",              unitPrice: 45,  unitsSoldPerMonth: 2,  unitCost: 0  },
    { id: "p9",  name: "DELF B2: Аудирование",               unitPrice: 14,  unitsSoldPerMonth: 2,  unitCost: 0  },
    { id: "p10", name: "DELF B2: Письменная речь",           unitPrice: 14,  unitsSoldPerMonth: 1,  unitCost: 0  },
    { id: "p11", name: "DELF B2: Чтение",                    unitPrice: 14,  unitsSoldPerMonth: 2,  unitCost: 0  },
    { id: "p12", name: "DELF B2: Устная речь",               unitPrice: 14,  unitsSoldPerMonth: 1,  unitCost: 0  },
  ],
  teachers: [
    { id: "t1", name: "Преподаватель А", lessonsPerMonth: 40, pricePerLesson: 30, ratePerLesson: 10, avgLessonsPerStudent: 8 },
  ],
};

export function encodeStateToUrl(state) {
  const params = new URLSearchParams();

  // Скалярные параметры
  for (const [stateKey, urlKey] of Object.entries(KEY_MAP)) {
    if (state[stateKey] != null) {
      params.set(urlKey, state[stateKey]);
    }
  }

  // Массивы — base64 UTF-8 с поддержкой кириллицы
  for (const [stateKey, urlKey] of Object.entries(ARRAY_KEYS)) {
    if (state[stateKey] != null) {
      try {
        const json = JSON.stringify(state[stateKey]);
        // Используем Buffer (Node/Next.js) для корректной UTF-8 кодировки
        const encoded = typeof Buffer !== "undefined"
          ? Buffer.from(json).toString("base64")
          : btoa(unescape(encodeURIComponent(json)));
        params.set(urlKey, encoded);
      } catch {
        // Пропускаем если сериализация не удалась
      }
    }
  }

  return params.toString();
}

export function decodeStateFromUrl(hashString) {
  if (!hashString) return null;

  let params;
  try {
    params = new URLSearchParams(hashString);
  } catch {
    return null;
  }

  // Проверяем что hash вообще содержит известные ключи
  const allKnownKeys = [...Object.values(KEY_MAP), ...Object.values(ARRAY_KEYS)];
  const hasAnyKnownKey = allKnownKeys.some(key => params.has(key));
  if (!hasAnyKnownKey) return null;

  const result = {};

  // Скалярные параметры
  for (const [stateKey, urlKey] of Object.entries(KEY_MAP)) {
    const raw = params.get(urlKey);
    if (raw != null) {
      const num = Number(raw);
      if (!isNaN(num)) {
        result[stateKey] = num;
      }
    }
  }

  // Массивы — decode из base64 с поддержкой кириллицы
  for (const [stateKey, urlKey] of Object.entries(ARRAY_KEYS)) {
    const raw = params.get(urlKey);
    if (raw != null) {
      try {
        const json = typeof Buffer !== "undefined"
          ? Buffer.from(raw, "base64").toString("utf8")
          : decodeURIComponent(escape(atob(raw)));
        result[stateKey] = JSON.parse(json);
      } catch {
        result[stateKey] = DEFAULT_STATE[stateKey];
      }
    }
  }

  return result;
}