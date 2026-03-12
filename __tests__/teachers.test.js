/**
 * TDD тесты — управление преподавателями (RED phase)
 *
 * Эти тесты описывают новую структуру teachers[] которая заменит
 * отдельные поля lessons/price/teacherRate/premLessons/premPrice/premTeacherRate.
 *
 * Тесты ПАДАЮТ намеренно — код ещё не реализован.
 */

import { calculateModel } from "../lib/calculations.js";

// ── Базовые параметры без полей уроков (используем teachers[]) ──────────────
const BASE_WITHOUT_LESSONS = {
  leads: 5,
  conv: 15,
  avgCheck: 50,
  courses: 0,
  coursePrice: 70,
  guides: 0,
  guidePrice: 20,
  managerCount: 0,
  mgr1Fix: 350,
  mgr1BonusPct: 7,
  mgr1Kpi: 30,
  mgr2Fix: 350,
  mgr2BonusPct: 7,
  mgr2Kpi: 30,
  otherCosts: 0,
};

// ── 1. Один преподаватель: выручка, себестоимость, прибыль, маржа ───────────

describe("Один преподаватель — базовые расчёты", () => {
  const teacher = {
    id: "t1",
    name: "Анна",
    lessonsPerMonth: 40,
    ratePerLesson: 10,       // что платим преподавателю
    pricePerLesson: 30,      // что платит ученик
    avgLessonsPerStudent: 4,
  };

  test("40 уроков × $30 → teacherRevenue = 1200", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [teacher] });
    // revenue = lessonsPerMonth × pricePerLesson
    expect(r.teachersList[0].revenue).toBe(1200);
  });

  test("40 уроков × $10 ставка → teacherCost = 400", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [teacher] });
    // cost = lessonsPerMonth × ratePerLesson
    expect(r.teachersList[0].cost).toBe(400);
  });

  test("profit = revenue - cost → 1200 - 400 = 800", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [teacher] });
    expect(r.teachersList[0].profit).toBe(800);
  });

  test("margin = Math.round((800/1200) × 100) = 67%", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [teacher] });
    // (30-10)/30 × 100 = 66.666... → Math.round → 67
    expect(r.teachersList[0].margin).toBe(67);
  });
});

// ── 2. studentsEstimate = Math.ceil(lessonsPerMonth / avgLessonsPerStudent) ──

describe("Один преподаватель — оценка количества учеников", () => {
  test("40 уроков / 4 на ученика → studentsEstimate = 10", () => {
    const teacher = {
      id: "t1",
      name: "Анна",
      lessonsPerMonth: 40,
      ratePerLesson: 10,
      pricePerLesson: 30,
      avgLessonsPerStudent: 4,
    };
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [teacher] });
    expect(r.teachersList[0].studentsEstimate).toBe(10);
  });

  test("45 уроков / 4 на ученика → studentsEstimate = Math.ceil(11.25) = 12", () => {
    const teacher = {
      id: "t2",
      name: "Борис",
      lessonsPerMonth: 45,
      ratePerLesson: 12,
      pricePerLesson: 35,
      avgLessonsPerStudent: 4,
    };
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [teacher] });
    expect(r.teachersList[0].studentsEstimate).toBe(12);
  });
});

// ── 3. Два преподавателя — teacherCostTotal = сумма их costs ────────────────

describe("Два преподавателя — суммарная себестоимость", () => {
  const teacherA = {
    id: "t1",
    name: "Анна",
    lessonsPerMonth: 40,
    ratePerLesson: 10,
    pricePerLesson: 30,
    avgLessonsPerStudent: 4,
  };
  const teacherB = {
    id: "t2",
    name: "Борис",
    lessonsPerMonth: 20,
    ratePerLesson: 15,
    pricePerLesson: 45,
    avgLessonsPerStudent: 4,
  };

  test("teacherCostTotal = 400 + 300 = 700", () => {
    // Анна: 40 × 10 = 400, Борис: 20 × 15 = 300
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [teacherA, teacherB] });
    expect(r.teacherCostTotal).toBe(700);
  });

  test("teacherCostTotal = сумма cost каждого из teachersList", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [teacherA, teacherB] });
    const sumFromList = r.teachersList.reduce((s, t) => s + t.cost, 0);
    expect(r.teacherCostTotal).toBe(sumFromList);
  });
});

// ── 4. Два преподавателя — totalRevenue включает суммарную выручку ───────────

describe("Два преподавателя — суммарная выручка", () => {
  const teacherA = {
    id: "t1",
    name: "Анна",
    lessonsPerMonth: 40,
    ratePerLesson: 10,
    pricePerLesson: 30,
    avgLessonsPerStudent: 4,
  };
  const teacherB = {
    id: "t2",
    name: "Борис",
    lessonsPerMonth: 20,
    ratePerLesson: 15,
    pricePerLesson: 45,
    avgLessonsPerStudent: 4,
  };

  test("totalRevenue включает выручку обоих преподавателей: 1200 + 900 = 2100", () => {
    // Анна: 40 × 30 = 1200, Борис: 20 × 45 = 900
    const r = calculateModel({
      ...BASE_WITHOUT_LESSONS,
      teachers: [teacherA, teacherB],
      courses: 0,
      guides: 0,
    });
    expect(r.totalRevenue).toBe(2100);
  });

  test("totalRevenue = сумма revenue всех преподавателей + courses + guides", () => {
    const r = calculateModel({
      ...BASE_WITHOUT_LESSONS,
      teachers: [teacherA, teacherB],
      courses: 2,
      coursePrice: 50,   // +100
      guides: 5,
      guidePrice: 10,    // +50
    });
    const teachersRevenue = r.teachersList.reduce((s, t) => s + t.revenue, 0);
    expect(r.totalRevenue).toBe(teachersRevenue + 100 + 50);
  });
});

// ── 5. Преподаватель с 0 уроков → revenue=0, cost=0, margin=0 ───────────────

describe("Преподаватель с нулевой нагрузкой", () => {
  const idleTeacher = {
    id: "t_idle",
    name: "Виктория",
    lessonsPerMonth: 0,
    ratePerLesson: 10,
    pricePerLesson: 30,
    avgLessonsPerStudent: 4,
  };

  test("revenue = 0", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [idleTeacher] });
    expect(r.teachersList[0].revenue).toBe(0);
  });

  test("cost = 0", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [idleTeacher] });
    expect(r.teachersList[0].cost).toBe(0);
  });

  test("profit = 0", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [idleTeacher] });
    expect(r.teachersList[0].profit).toBe(0);
  });

  test("margin = 0 (нет деления на ноль)", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [idleTeacher] });
    expect(r.teachersList[0].margin).toBe(0);
  });

  test("studentsEstimate = 0", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [idleTeacher] });
    expect(r.teachersList[0].studentsEstimate).toBe(0);
  });
});

// ── 6. teachersList содержит все обязательные поля ──────────────────────────

describe("Структура teachersList", () => {
  const teacher = {
    id: "t1",
    name: "Анна",
    lessonsPerMonth: 40,
    ratePerLesson: 10,
    pricePerLesson: 30,
    avgLessonsPerStudent: 4,
  };

  test("teachersList[0] содержит поля id, name, revenue, cost, profit, margin, studentsEstimate", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [teacher] });
    const t = r.teachersList[0];

    expect(t).toHaveProperty("id", "t1");
    expect(t).toHaveProperty("name", "Анна");
    expect(t).toHaveProperty("revenue");
    expect(t).toHaveProperty("cost");
    expect(t).toHaveProperty("profit");
    expect(t).toHaveProperty("margin");
    expect(t).toHaveProperty("studentsEstimate");
  });

  test("длина teachersList соответствует числу входных преподавателей", () => {
    const teachers = [
      { id: "t1", name: "Анна",  lessonsPerMonth: 40, ratePerLesson: 10, pricePerLesson: 30, avgLessonsPerStudent: 4 },
      { id: "t2", name: "Борис", lessonsPerMonth: 20, ratePerLesson: 15, pricePerLesson: 45, avgLessonsPerStudent: 4 },
    ];
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers });
    expect(r.teachersList).toHaveLength(2);
  });

  test("пустой массив teachers → teachersList пуст", () => {
    const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers: [] });
    expect(r.teachersList).toHaveLength(0);
  });
});

// ── 7. Property-based: для любого преподавателя profit = revenue - cost ──────

describe("Property-based: profit = revenue - cost (инвариант)", () => {
  function randomTeacher(id) {
    return {
      id: `t${id}`,
      name: `Преп${id}`,
      lessonsPerMonth: Math.floor(Math.random() * 100),
      ratePerLesson: Math.floor(Math.random() * 30) + 5,
      pricePerLesson: Math.floor(Math.random() * 50) + 15,
      avgLessonsPerStudent: Math.floor(Math.random() * 8) + 1,
    };
  }

  const RUNS = 50;

  test("profit = revenue - cost для каждого преподавателя при случайных параметрах", () => {
    for (let i = 0; i < RUNS; i++) {
      const teacherCount = Math.floor(Math.random() * 4) + 1; // 1–4
      const teachers = Array.from({ length: teacherCount }, (_, idx) => randomTeacher(idx + 1));

      const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers });

      for (const t of r.teachersList) {
        expect(t.profit).toBe(t.revenue - t.cost);
      }
    }
  });

  test("teacherCostTotal = сумма cost всех преподавателей при случайных параметрах", () => {
    for (let i = 0; i < RUNS; i++) {
      const teacherCount = Math.floor(Math.random() * 4) + 1;
      const teachers = Array.from({ length: teacherCount }, (_, idx) => randomTeacher(idx + 1));

      const r = calculateModel({ ...BASE_WITHOUT_LESSONS, teachers });
      const sumCosts = r.teachersList.reduce((s, t) => s + t.cost, 0);

      expect(r.teacherCostTotal).toBe(sumCosts);
    }
  });
});
