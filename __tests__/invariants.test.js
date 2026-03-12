/**
 * Property-Based тесты — инварианты финансовой модели
 * Эти свойства должны быть истинны при ЛЮБЫХ входных данных.
 */

import { calculateModel } from "../lib/calculations.js";

function randomParams(overrides = {}) {
  return {
    leads: Math.floor(Math.random() * 49) + 1,
    conv: Math.floor(Math.random() * 39) + 1,
    avgCheck: Math.floor(Math.random() * 180) + 20,
    lessons: Math.floor(Math.random() * 300),
    price: Math.floor(Math.random() * 45) + 15,
    teacherRate: Math.floor(Math.random() * 20) + 5,
    premLessons: Math.floor(Math.random() * 200),
    premPrice: Math.floor(Math.random() * 55) + 25,
    premTeacherRate: Math.floor(Math.random() * 30) + 10,
    courses: Math.floor(Math.random() * 50),
    coursePrice: Math.floor(Math.random() * 180) + 20,
    guides: Math.floor(Math.random() * 100),
    guidePrice: Math.floor(Math.random() * 40) + 10,
    managerCount: Math.floor(Math.random() * 3),   // 0, 1, или 2
    mgr1Fix: Math.floor(Math.random() * 400) + 200,
    mgr1BonusPct: Math.floor(Math.random() * 15),
    mgr1Kpi: Math.floor(Math.random() * 11) * 5,   // 0,5,10,...,50
    mgr2Fix: Math.floor(Math.random() * 400) + 200,
    mgr2BonusPct: Math.floor(Math.random() * 15),
    mgr2Kpi: Math.floor(Math.random() * 11) * 5,
    otherCosts: Math.floor(Math.random() * 500),
    ...overrides,
  };
}

const RUNS = 50;

describe("Инвариант: net = revenue - totalCost", () => {
  test("выполняется при любых параметрах", () => {
    for (let i = 0; i < RUNS; i++) {
      const p = randomParams();
      const r = calculateModel(p);
      expect(r.netProfit).toBe(r.totalRevenue - r.totalCost);
    }
  });
});

describe("Инвариант: totalRevenue >= 0", () => {
  test("при любых параметрах", () => {
    for (let i = 0; i < RUNS; i++) {
      const r = calculateModel(randomParams());
      expect(r.totalRevenue).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("Инвариант: isProfitable === (netProfit >= 0)", () => {
  test("флаг и число всегда согласованы", () => {
    for (let i = 0; i < RUNS; i++) {
      const r = calculateModel(randomParams());
      expect(r.isProfitable).toBe(r.netProfit >= 0);
    }
  });
});

describe("Инвариант: totalCost = managers + teachers + other", () => {
  test("сумма слагаемых равна итогу", () => {
    for (let i = 0; i < RUNS; i++) {
      const p = randomParams();
      const r = calculateModel(p);
      expect(r.totalCost).toBe(
        r.managerCostTotal + r.teacherCostTotal + p.otherCosts
      );
    }
  });
});

describe("Инвариант: managerCostTotal = сумма total каждого менеджера", () => {
  test("при любом количестве менеджеров", () => {
    for (let i = 0; i < RUNS; i++) {
      const r = calculateModel(randomParams());
      const sumFromList = r.managersList.reduce((s, m) => s + m.total, 0);
      expect(r.managerCostTotal).toBe(sumFromList);
    }
  });
});

describe("Инвариант: каждый менеджер — total = fix + salesBonus + kpi", () => {
  test("при любых параметрах", () => {
    for (let i = 0; i < RUNS; i++) {
      const r = calculateModel(randomParams());
      for (const mgr of r.managersList) {
        expect(mgr.total).toBe(mgr.fix + mgr.salesBonus + mgr.kpi);
      }
    }
  });
});

describe("Инвариант: breakeven > 0 и целое", () => {
  test("при любых параметрах", () => {
    for (let i = 0; i < RUNS; i++) {
      const r = calculateModel(randomParams());
      expect(r.breakeven).toBeGreaterThan(0);
      expect(Number.isInteger(r.breakeven)).toBe(true);
    }
  });
});
