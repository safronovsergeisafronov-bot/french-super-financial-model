/**
 * TDD тесты — финансовые расчёты French.Super
 * Соответствуют BDD сценариям из specs/financial-model.feature
 */

import { calculateModel } from "../lib/calculations.js";

// Базовые параметры для большинства тестов
const BASE = {
  leads: 5,
  conv: 15,
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
  managers: 2,
  managerFix: 350,
  managerBonusPct: 7,
  otherCosts: 100,
};

describe("Выручка от уроков", () => {
  test("обычные уроки: 40 × €30 = €1200", () => {
    const result = calculateModel({ ...BASE, lessons: 40, price: 30 });
    expect(result.lessonsRevenue).toBe(1200);
  });

  test("себестоимость уроков: 40 × €10 = €400", () => {
    const result = calculateModel({ ...BASE, lessons: 40, teacherRate: 10 });
    expect(result.lessonsCost).toBe(400);
  });

  test("маржа урока: (30 - 10) / 30 × 100 = 67% (округление Math.round)", () => {
    const result = calculateModel({ ...BASE, lessons: 40, price: 30, teacherRate: 10 });
    // (20/30)*100 = 66.666... → Math.round → 67
    expect(result.lessonsMargin).toBe(67);
  });

  test("нет уроков → выручка 0, маржа 0", () => {
    const result = calculateModel({ ...BASE, lessons: 0 });
    expect(result.lessonsRevenue).toBe(0);
    expect(result.lessonsMargin).toBe(0);
  });
});

describe("Цифровые продукты", () => {
  test("курсы: 5 × $70 = $350", () => {
    const result = calculateModel({ ...BASE, courses: 5, coursePrice: 70 });
    expect(result.coursesRevenue).toBe(350);
  });

  test("гайды: 10 × $20 = $200", () => {
    const result = calculateModel({ ...BASE, guides: 10, guidePrice: 20 });
    expect(result.guidesRevenue).toBe(200);
  });
});

describe("Итоговая выручка", () => {
  test("сумма всех продуктов", () => {
    const result = calculateModel({
      ...BASE,
      lessons: 40,    // 40 × 30 = 1200
      premLessons: 0,
      courses: 5,     // 5 × 70 = 350
      guides: 10,     // 10 × 20 = 200
    });
    expect(result.totalRevenue).toBe(1750);
  });
});

describe("Расходы на менеджеров", () => {
  test("фикс 2 менеджера × $350 = $700", () => {
    const result = calculateModel({ ...BASE, managers: 2, managerFix: 350 });
    expect(result.managerFixTotal).toBe(700);
  });

  test("KPI 2 менеджера × $35 = $70", () => {
    const result = calculateModel({ ...BASE, managers: 2 });
    expect(result.managerKpi).toBe(70);
  });

  test("расходы на 1 менеджера — детальная разбивка", () => {
    const result = calculateModel({
      ...BASE,
      managers: 1,
      managerFix: 350,
      managerBonusPct: 7,
      lessons: 40, price: 30, // totalRevenue = 1750
      courses: 5, coursePrice: 70,
      guides: 10, guidePrice: 20,
    });
    // фикс: 350, бонус: round(1750 * 7/100) = round(122.5) = 123, kpi: 35 → итого 508
    expect(result.managerCostTotal).toBe(508);
  });
});

describe("Прибыль и статус", () => {
  test("школа в плюсе — isProfitable = true", () => {
    const result = calculateModel({
      ...BASE,
      lessons: 100, price: 30, teacherRate: 10,
      courses: 10, coursePrice: 70,
      guides: 20, guidePrice: 20,
    });
    expect(result.isProfitable).toBe(true);
    expect(result.netProfit).toBeGreaterThan(0);
  });

  test("школа в минусе — isProfitable = false", () => {
    const result = calculateModel({
      ...BASE,
      lessons: 0, courses: 0, guides: 0, premLessons: 0,
      managers: 3, managerFix: 600,
    });
    expect(result.isProfitable).toBe(false);
    expect(result.netProfit).toBeLessThan(0);
  });
});

describe("Безубыточность", () => {
  test("breakeven — положительное целое число", () => {
    const result = calculateModel(BASE);
    expect(result.breakeven).toBeGreaterThan(0);
    expect(Number.isInteger(result.breakeven)).toBe(true);
  });

  test("с нулевой выручкой breakeven = 999", () => {
    const result = calculateModel({
      ...BASE,
      lessons: 0, courses: 0, guides: 0, premLessons: 0,
    });
    expect(result.breakeven).toBe(999);
  });
});
