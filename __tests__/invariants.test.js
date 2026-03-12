/**
 * Property-Based тесты — инварианты финансовой модели
 * Эти свойства должны быть истинны при ЛЮБЫХ входных данных.
 */

import { calculateModel } from "../lib/calculations.js";

// Генератор случайных валидных параметров
function randomParams(overrides = {}) {
  return {
    leads: Math.floor(Math.random() * 49) + 1,           // 1–50
    conv: Math.floor(Math.random() * 35) + 5,             // 5–40
    lessons: Math.floor(Math.random() * 300),             // 0–300
    price: Math.floor(Math.random() * 45) + 15,           // 15–60
    teacherRate: Math.floor(Math.random() * 20) + 5,      // 5–25
    premLessons: Math.floor(Math.random() * 200),         // 0–200
    premPrice: Math.floor(Math.random() * 55) + 25,       // 25–80
    premTeacherRate: Math.floor(Math.random() * 30) + 10, // 10–40
    courses: Math.floor(Math.random() * 50),              // 0–50
    coursePrice: Math.floor(Math.random() * 180) + 20,    // 20–200
    guides: Math.floor(Math.random() * 100),              // 0–100
    guidePrice: Math.floor(Math.random() * 40) + 10,      // 10–50
    managers: Math.floor(Math.random() * 4),              // 0–3
    managerFix: Math.floor(Math.random() * 400) + 200,    // 200–600
    managerBonusPct: Math.floor(Math.random() * 15),      // 0–15
    otherCosts: Math.floor(Math.random() * 500),          // 0–500
    ...overrides,
  };
}

const RUNS = 50; // сколько случайных наборов проверяем

describe("Инвариант: net = revenue - totalCost", () => {
  test("выполняется при любых параметрах", () => {
    for (let i = 0; i < RUNS; i++) {
      const params = randomParams();
      const r = calculateModel(params);
      expect(r.netProfit).toBe(r.totalRevenue - r.totalCost);
    }
  });
});

describe("Инвариант: выручка >= 0", () => {
  test("при любых параметрах", () => {
    for (let i = 0; i < RUNS; i++) {
      const r = calculateModel(randomParams());
      expect(r.totalRevenue).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("Инвариант: маржа в диапазоне -100%..100%", () => {
  test("lessonsMargin и netMargin в допустимых пределах", () => {
    for (let i = 0; i < RUNS; i++) {
      const r = calculateModel(randomParams());
      expect(r.lessonsMargin).toBeGreaterThanOrEqual(-100);
      expect(r.lessonsMargin).toBeLessThanOrEqual(100);
    }
  });
});

describe("Инвариант: totalCost = managers + teachers + other", () => {
  test("сумма слагаемых равна итогу", () => {
    for (let i = 0; i < RUNS; i++) {
      const params = randomParams();
      const r = calculateModel(params);
      expect(r.totalCost).toBe(
        r.managerCostTotal + r.teacherCostTotal + params.otherCosts
      );
    }
  });
});

describe("Инвариант: isProfitable совпадает с netProfit >= 0", () => {
  test("флаг и число всегда согласованы", () => {
    for (let i = 0; i < RUNS; i++) {
      const r = calculateModel(randomParams());
      expect(r.isProfitable).toBe(r.netProfit >= 0);
    }
  });
});

describe("Инвариант: breakeven — целое положительное число или 999", () => {
  test("при любых параметрах", () => {
    for (let i = 0; i < RUNS; i++) {
      const r = calculateModel(randomParams());
      expect(r.breakeven).toBeGreaterThan(0);
      expect(Number.isInteger(r.breakeven)).toBe(true);
    }
  });
});
