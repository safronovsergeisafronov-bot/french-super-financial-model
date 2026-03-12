/**
 * TDD тесты — система продуктов French.Super
 * Соответствуют BDD сценариям из specs/products.feature
 */

import { calculateModel, calculateProducts } from "../lib/calculations.js";

// ── calculateProducts() — изолированные тесты ────────────────────────────────

describe("calculateProducts: цифровой продукт (себестоимость 0)", () => {
  test("DELF B1 полный: 5 × €40 = €200, маржа 100%", () => {
    const products = [
      { id: "p1", name: "DELF B1 (полный)", unitPrice: 40, unitsSoldPerMonth: 5, unitCost: 0 },
    ];
    const result = calculateProducts(products);
    expect(result[0].revenue).toBe(200);
    expect(result[0].cost).toBe(0);
    expect(result[0].profit).toBe(200);
    expect(result[0].margin).toBe(100);
  });
});

describe("calculateProducts: физический продукт (есть себестоимость)", () => {
  test("Книга: 10 × €20 = €200 выручка, 10 × €8 = €80 себест., маржа 60%", () => {
    const products = [
      { id: "p2", name: "Книга Жопарль", unitPrice: 20, unitsSoldPerMonth: 10, unitCost: 8 },
    ];
    const result = calculateProducts(products);
    expect(result[0].revenue).toBe(200);
    expect(result[0].cost).toBe(80);
    expect(result[0].profit).toBe(120);
    expect(result[0].margin).toBe(60);
  });
});

describe("calculateProducts: нулевые продажи", () => {
  test("0 продаж → выручка 0, маржа 0", () => {
    const products = [
      { id: "p3", name: "Курс", unitPrice: 70, unitsSoldPerMonth: 0, unitCost: 0 },
    ];
    const result = calculateProducts(products);
    expect(result[0].revenue).toBe(0);
    expect(result[0].cost).toBe(0);
    expect(result[0].profit).toBe(0);
    expect(result[0].margin).toBe(0);
  });
});

describe("calculateProducts: несколько продуктов", () => {
  test("два продукта считаются независимо", () => {
    const products = [
      { id: "p1", name: "Продукт А", unitPrice: 40, unitsSoldPerMonth: 5, unitCost: 0 },
      { id: "p2", name: "Продукт Б", unitPrice: 30, unitsSoldPerMonth: 5, unitCost: 0 },
    ];
    const result = calculateProducts(products);
    expect(result[0].revenue).toBe(200); // 5 × 40
    expect(result[1].revenue).toBe(150); // 5 × 30
  });

  test("пустой массив → пустой массив", () => {
    expect(calculateProducts([])).toEqual([]);
  });
});

describe("calculateProducts: DELF пакеты — bundle + части независимо", () => {
  test("4 части по €12 + 1 bundle €40 при 1 продаже каждый = €88", () => {
    const products = [
      { id: "b1", name: "DELF B1: Аудирование", unitPrice: 12, unitsSoldPerMonth: 1, unitCost: 0 },
      { id: "b2", name: "DELF B1: Письмо", unitPrice: 12, unitsSoldPerMonth: 1, unitCost: 0 },
      { id: "b3", name: "DELF B1: Чтение", unitPrice: 12, unitsSoldPerMonth: 1, unitCost: 0 },
      { id: "b4", name: "DELF B1: Устная речь", unitPrice: 12, unitsSoldPerMonth: 1, unitCost: 0 },
      { id: "b5", name: "DELF B1 (полный)", unitPrice: 40, unitsSoldPerMonth: 1, unitCost: 0 },
    ];
    const result = calculateProducts(products);
    const totalRevenue = result.reduce((s, p) => s + p.revenue, 0);
    expect(totalRevenue).toBe(88); // 4×12 + 40
  });
});

// ── calculateModel() интеграция с products[] ──────────────────────────────────

const BASE_NO_PRODUCTS = {
  leads: 5,
  conv: 15,
  avgCheck: 50,
  courses: 0,
  coursePrice: 0,
  guides: 0,
  guidePrice: 0,
  managerCount: 1,
  mgr1Fix: 350,
  mgr1BonusPct: 7,
  mgr1Kpi: 30,
  mgr2Fix: 350,
  mgr2BonusPct: 7,
  mgr2Kpi: 30,
  otherCosts: 100,
  teachers: [
    { id: "t1", name: "Преп А", lessonsPerMonth: 40, pricePerLesson: 30, ratePerLesson: 10, avgLessonsPerStudent: 8 },
  ],
};

describe("calculateModel: productsRevenue входит в totalRevenue", () => {
  test("1 продукт €200 прибавляется к totalRevenue", () => {
    const products = [
      { id: "p1", name: "Курс", unitPrice: 40, unitsSoldPerMonth: 5, unitCost: 0 },
    ];
    const withProducts = calculateModel({ ...BASE_NO_PRODUCTS, products });
    const withoutProducts = calculateModel({ ...BASE_NO_PRODUCTS, products: [] });
    expect(withProducts.totalRevenue).toBe(withoutProducts.totalRevenue + 200);
  });
});

describe("calculateModel: productsCost входит в totalCost", () => {
  test("физический продукт: productsCost = €80", () => {
    const products = [
      { id: "p2", name: "Книга", unitPrice: 20, unitsSoldPerMonth: 10, unitCost: 8 },
    ];
    const r = calculateModel({ ...BASE_NO_PRODUCTS, products });
    // Себестоимость 10 × €8 = €80
    expect(r.productsCost).toBe(80);
    // Инвариант: totalCost включает productsCost
    expect(r.totalCost).toBe(r.managerCostTotal + r.teacherCostTotal + r.productsCost + BASE_NO_PRODUCTS.otherCosts);
  });
});

describe("calculateModel: productsList возвращается в результате", () => {
  test("каждый продукт содержит revenue, cost, profit, margin", () => {
    const products = [
      { id: "p1", name: "Тест", unitPrice: 50, unitsSoldPerMonth: 4, unitCost: 10 },
    ];
    const r = calculateModel({ ...BASE_NO_PRODUCTS, products });
    expect(r.productsList).toHaveLength(1);
    expect(r.productsList[0].revenue).toBe(200);
    expect(r.productsList[0].cost).toBe(40);
    expect(r.productsList[0].profit).toBe(160);
    expect(r.productsList[0].margin).toBe(80);
  });
});

describe("calculateModel: пустой products[] не ломает расчёты", () => {
  test("без продуктов productsRevenue=0, productsCost=0", () => {
    const r = calculateModel({ ...BASE_NO_PRODUCTS, products: [] });
    expect(r.productsRevenue).toBe(0);
    expect(r.productsCost).toBe(0);
  });
});

describe("calculateModel: инвариант netProfit с products[]", () => {
  test("netProfit = totalRevenue - totalCost при наличии продуктов", () => {
    const products = [
      { id: "p1", name: "А", unitPrice: 40, unitsSoldPerMonth: 5, unitCost: 0 },
      { id: "p2", name: "Б", unitPrice: 20, unitsSoldPerMonth: 10, unitCost: 8 },
    ];
    const r = calculateModel({ ...BASE_NO_PRODUCTS, products });
    expect(r.netProfit).toBe(r.totalRevenue - r.totalCost);
  });
});
