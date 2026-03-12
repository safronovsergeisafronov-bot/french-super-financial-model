/**
 * TDD тесты — финансовые расчёты French.Super
 * Соответствуют BDD сценариям из specs/financial-model.feature
 */

import { calculateModel } from "../lib/calculations.js";

const BASE = {
  leads: 5,
  conv: 15,
  avgCheck: 50,
  lessons: 40,
  price: 30,
  teacherRate: 10,
  premLessons: 0,
  premPrice: 45,
  premTeacherRate: 15,
  courses: 5,
  coursePrice: 70,
  guides: 10,
  guidePrice: 20,
  managerCount: 2,
  mgr1Fix: 350,
  mgr1BonusPct: 7,
  mgr1Kpi: 30,
  mgr2Fix: 350,
  mgr2BonusPct: 7,
  mgr2Kpi: 30,
  otherCosts: 100,
};

// ── Выручка от продуктов ────────────────────────────────────────────

describe("Выручка от уроков", () => {
  test("обычные уроки: 40 × €30 = €1200", () => {
    const r = calculateModel({ ...BASE, lessons: 40, price: 30 });
    expect(r.lessonsRevenue).toBe(1200);
  });

  test("себестоимость уроков: 40 × €10 = €400", () => {
    const r = calculateModel({ ...BASE, lessons: 40, teacherRate: 10 });
    expect(r.lessonsCost).toBe(400);
  });

  test("маржа урока: Math.round((30-10)/30 × 100) = 67%", () => {
    const r = calculateModel({ ...BASE, lessons: 40, price: 30, teacherRate: 10 });
    // (20/30)*100 = 66.666... → Math.round → 67
    expect(r.lessonsMargin).toBe(67);
  });

  test("нет уроков → выручка 0, маржа 0", () => {
    const r = calculateModel({ ...BASE, lessons: 0 });
    expect(r.lessonsRevenue).toBe(0);
    expect(r.lessonsMargin).toBe(0);
  });
});

describe("Цифровые продукты", () => {
  test("курсы: 5 × $70 = $350", () => {
    const r = calculateModel({ ...BASE, courses: 5, coursePrice: 70 });
    expect(r.coursesRevenue).toBe(350);
  });

  test("гайды: 10 × $20 = $200", () => {
    const r = calculateModel({ ...BASE, guides: 10, guidePrice: 20 });
    expect(r.guidesRevenue).toBe(200);
  });
});

describe("Итоговая выручка", () => {
  test("сумма всех продуктов: 1200 + 350 + 200 = 1750", () => {
    const r = calculateModel({
      ...BASE,
      lessons: 40,      // 40 × 30 = 1200
      premLessons: 0,
      courses: 5,       // 5 × 70 = 350
      guides: 10,       // 10 × 20 = 200
    });
    expect(r.totalRevenue).toBe(1750);
  });
});

// ── Воронка ────────────────────────────────────────────────────────

describe("Воронка продаж", () => {
  test("продаж в день: 5 × 15% = 0.75 → round to 0.8", () => {
    const r = calculateModel({ ...BASE, leads: 5, conv: 15 });
    expect(r.dailySales).toBe(0.8);
  });

  test("выручка воронки: 0.8 × $50 × 26 = $1040", () => {
    const r = calculateModel({ ...BASE, leads: 5, conv: 15, avgCheck: 50 });
    expect(r.funnelRevenue).toBe(1040);
  });

  test("20 заявок × 20% × $50 × 26 = $5200", () => {
    const r = calculateModel({ ...BASE, leads: 20, conv: 20, avgCheck: 50 });
    expect(r.funnelRevenue).toBe(5200);
  });
});

// ── Менеджеры — индивидуальный расчёт ────────────────────────────

describe("Менеджеры — список и структура", () => {
  test("2 менеджера → managersList длиной 2", () => {
    const r = calculateModel({ ...BASE, managerCount: 2 });
    expect(r.managersList).toHaveLength(2);
  });

  test("1 менеджер → managersList длиной 1", () => {
    const r = calculateModel({ ...BASE, managerCount: 1 });
    expect(r.managersList).toHaveLength(1);
  });

  test("0 менеджеров → managersList пуст, расходы 0", () => {
    const r = calculateModel({ ...BASE, managerCount: 0 });
    expect(r.managersList).toHaveLength(0);
    expect(r.managerCostTotal).toBe(0);
  });
});

describe("Менеджеры — расчёт зарплаты", () => {
  test("при 2 менеджерах каждый получает половину выручки в базе для бонуса", () => {
    const r = calculateModel({ ...BASE, managerCount: 2 });
    expect(r.managersList[0].revenueShare).toBe(r.managersList[1].revenueShare);
    expect(r.managersList[0].revenueShare + r.managersList[1].revenueShare)
      .toBe(r.totalRevenue);
  });

  test("зарплата менеджера А = fix + salesBonus + kpi", () => {
    const r = calculateModel({ ...BASE, managerCount: 1 });
    const mgr = r.managersList[0];
    expect(mgr.total).toBe(mgr.fix + mgr.salesBonus + mgr.kpi);
  });

  test("1 менеджер, выручка $1750, бонус 7%, KPI $30 → total = 350+123+30 = 503", () => {
    const r = calculateModel({
      ...BASE,
      managerCount: 1,
      mgr1Fix: 350,
      mgr1BonusPct: 7,
      mgr1Kpi: 30,
      lessons: 40, price: 30,   // 1200
      courses: 5, coursePrice: 70,  // 350
      guides: 10, guidePrice: 20,   // 200
      // totalRevenue = 1750, бонус = round(1750 × 7%) = round(122.5) = 123
    });
    expect(r.managersList[0].salesBonus).toBe(123);
    expect(r.managersList[0].total).toBe(503); // 350+123+30
  });

  test("разные бонусы у менеджеров А и Б считаются независимо", () => {
    const r = calculateModel({
      ...BASE,
      managerCount: 2,
      mgr1BonusPct: 5,
      mgr2BonusPct: 10,
    });
    const share = r.totalRevenue / 2;
    expect(r.managersList[0].salesBonus).toBe(Math.round(share * 5 / 100));
    expect(r.managersList[1].salesBonus).toBe(Math.round(share * 10 / 100));
  });

  test("разные фиксы у менеджеров А и Б", () => {
    const r = calculateModel({
      ...BASE,
      managerCount: 2,
      mgr1Fix: 300,
      mgr2Fix: 400,
    });
    expect(r.managersList[0].fix).toBe(300);
    expect(r.managersList[1].fix).toBe(400);
  });
});

// ── Прибыль и безубыточность ──────────────────────────────────────

describe("Прибыль", () => {
  test("школа в плюсе — isProfitable = true", () => {
    const r = calculateModel({
      ...BASE,
      lessons: 100, price: 30, teacherRate: 10,
      courses: 10, coursePrice: 70,
      guides: 20, guidePrice: 20,
    });
    expect(r.isProfitable).toBe(true);
    expect(r.netProfit).toBeGreaterThan(0);
  });

  test("школа в минусе — isProfitable = false", () => {
    const r = calculateModel({
      ...BASE,
      lessons: 0, courses: 0, guides: 0, premLessons: 0,
      managerCount: 2, mgr1Fix: 600, mgr2Fix: 600,
    });
    expect(r.isProfitable).toBe(false);
    expect(r.netProfit).toBeLessThan(0);
  });
});

describe("Безубыточность", () => {
  test("breakeven — положительное целое число", () => {
    const r = calculateModel(BASE);
    expect(r.breakeven).toBeGreaterThan(0);
    expect(Number.isInteger(r.breakeven)).toBe(true);
  });

  test("нулевой средний чек → breakeven = 999", () => {
    // Не возможно через слайдер (минимум $20), но защита работает
    const r = calculateModel({ ...BASE, avgCheck: 0 });
    expect(r.breakeven).toBe(999);
  });
});
