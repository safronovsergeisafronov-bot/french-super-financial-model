/**
 * French.Super — Финансовые расчёты
 * Вся бизнес-логика здесь. React-компоненты только отображают.
 */

export function calculateModel({
  leads,
  conv,
  lessons,
  price,
  teacherRate,
  premLessons,
  premPrice,
  premTeacherRate,
  courses,
  coursePrice,
  guides,
  guidePrice,
  managers,
  managerFix,
  managerBonusPct,
  otherCosts,
}) {
  // Выручка от уроков
  const lessonsRevenue = lessons * price;
  const lessonsCost = lessons * teacherRate;
  const lessonsProfit = lessonsRevenue - lessonsCost;
  const lessonsMargin =
    lessonsRevenue > 0 ? Math.round((lessonsProfit / lessonsRevenue) * 100) : 0;

  // Выручка от премиум-уроков
  const premRevenue = premLessons * premPrice;
  const premCost = premLessons * premTeacherRate;
  const premProfit = premRevenue - premCost;
  const premMargin =
    premRevenue > 0 ? Math.round((premProfit / premRevenue) * 100) : 0;

  // Цифровые продукты (маржа 100%)
  const coursesRevenue = courses * coursePrice;
  const guidesRevenue = guides * guidePrice;

  // Итоговая выручка
  const totalRevenue = lessonsRevenue + premRevenue + coursesRevenue + guidesRevenue;

  // Расходы на менеджеров
  const managerFixTotal = managers * managerFix;
  const managerBonus = Math.round((totalRevenue * managerBonusPct) / 100);
  const managerKpi = managers * 35;
  const managerCostTotal = managerFixTotal + managerBonus + managerKpi;
  const managerCostPerPerson = managers > 0 ? Math.round(managerCostTotal / managers) : 0;

  // Расходы на преподавателей
  const teacherCostTotal = lessonsCost + premCost;

  // Итоговые расходы
  const totalCost = managerCostTotal + teacherCostTotal + otherCosts;

  // Прибыль
  const netProfit = totalRevenue - totalCost;
  const netMargin =
    totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // ROI менеджеров
  const managerRoi =
    managerCostTotal > 0 ? (totalRevenue / managerCostTotal).toFixed(1) : "0";

  // Безубыточность (заявок/день)
  const avgRevenuePerLead = totalRevenue / Math.max(leads * 26, 1);
  const breakeven =
    avgRevenuePerLead > 0
      ? Math.ceil(totalCost / (avgRevenuePerLead * 26))
      : 999;

  return {
    // Уроки обычные
    lessonsRevenue,
    lessonsCost,
    lessonsProfit,
    lessonsMargin,

    // Уроки премиум
    premRevenue,
    premCost,
    premProfit,
    premMargin,

    // Цифровые продукты
    coursesRevenue,
    guidesRevenue,

    // Итоги
    totalRevenue,
    managerCostTotal,
    managerFixTotal,
    managerBonus,
    managerKpi,
    managerCostPerPerson,
    teacherCostTotal,
    totalCost,
    netProfit,
    netMargin,
    managerRoi,
    breakeven,

    // Флаг прибыльности
    isProfitable: netProfit >= 0,
  };
}
