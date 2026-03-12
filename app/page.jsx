"use client";
import { useState, useMemo } from "react";
import { calculateModel } from "../lib/calculations.js";

const G = "#34d399";
const R = "#f87171";
const B = "#6ba1ff";
const DIM = "#64748b";

function Sl({ label, value, onChange, min, max, step = 1, unit = "" }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
        <span style={{ fontSize: 12, color: B, fontWeight: 600 }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: "#4f8cff" }}
      />
    </div>
  );
}

function Card({ title, value, sub, color = "#e2e8f0" }) {
  return (
    <div style={{
      background: "#1a1d27", borderRadius: 10, padding: "12px 16px",
      border: "1px solid #2d3348", flex: 1, minWidth: 110,
    }}>
      <div style={{ fontSize: 10, color: DIM, textTransform: "uppercase", letterSpacing: 1 }}>
        {title}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

const panel = {
  background: "#1a1d27", borderRadius: 10, padding: 14,
  border: "1px solid #2d3348", marginBottom: 10,
};

const sTitle = {
  fontSize: 11, color: DIM, textTransform: "uppercase",
  letterSpacing: 1, marginBottom: 10, fontWeight: 600,
};

function Divider() {
  return <div style={{ borderTop: "1px solid #2d3348", margin: "8px 0" }} />;
}

function Row({ label, value, color = "#94a3b8", bold = false }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      fontSize: 12, marginBottom: 3, lineHeight: 1.6,
    }}>
      <span style={{ color: "#94a3b8" }}>{label}</span>
      <span style={{ color, fontWeight: bold ? 700 : 400 }}>{value}</span>
    </div>
  );
}

function ManagerCard({ data, fix, onFix, bonusPct, onBonusPct, kpi, onKpi }) {
  return (
    <div style={{
      background: "#0f1117", borderRadius: 8, padding: 12,
      marginBottom: 8, border: "1px solid #2d3348",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 10,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>
          {data.label}
        </span>
        <span style={{ fontSize: 10, color: DIM }}>{data.shift}</span>
      </div>

      <Sl label="Фикс в месяц" value={fix} onChange={onFix} min={200} max={600} step={50} unit="$" />
      <Sl label="Бонус от продаж" value={bonusPct} onChange={onBonusPct} min={0} max={15} unit="%" />
      <Sl label="KPI бонус (ожидаемый, макс. $50)" value={kpi} onChange={onKpi} min={0} max={50} step={5} unit="$" />

      <Divider />

      <Row
        label="Продаёт через себя"
        value={`$${data.revenueShare.toLocaleString()}`}
        color="#e2e8f0"
      />
      <Row
        label={`Бонус ${data.bonusPct}% × $${data.revenueShare.toLocaleString()}`}
        value={`$${data.salesBonus}`}
        color="#e2e8f0"
      />
      <Row
        label="KPI (ответы <10 мин, конв. >25%, CRM)"
        value={`до $50 | план $${kpi}`}
      />

      <Divider />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 11, color: DIM }}>
          ${fix} фикс + ${data.salesBonus} бонус + ${kpi} KPI
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, color: G }}>
          ${data.total.toLocaleString()}/мес
        </span>
      </div>
    </div>
  );
}

export default function App() {
  // Воронка
  const [leads, setLeads] = useState(5);
  const [conv, setConv] = useState(15);
  const [avgCheck, setAvgCheck] = useState(50);

  // Уроки обычные
  const [lessons, setLessons] = useState(40);
  const [price, setPrice] = useState(30);
  const [tRate, setTRate] = useState(10);

  // Уроки премиум
  const [premLessons, setPremLessons] = useState(0);
  const [premPrice, setPremPrice] = useState(45);
  const [premRate, setPremRate] = useState(15);

  // Цифровые продукты
  const [courses, setCourses] = useState(5);
  const [courseP, setCourseP] = useState(70);
  const [guides, setGuides] = useState(10);
  const [guideP, setGuideP] = useState(20);

  // Менеджеры
  const [managerCount, setManagerCount] = useState(2);
  const [mgr1Fix, setMgr1Fix] = useState(350);
  const [mgr1Bonus, setMgr1Bonus] = useState(7);
  const [mgr1Kpi, setMgr1Kpi] = useState(30);
  const [mgr2Fix, setMgr2Fix] = useState(350);
  const [mgr2Bonus, setMgr2Bonus] = useState(7);
  const [mgr2Kpi, setMgr2Kpi] = useState(30);

  // Прочее
  const [other, setOther] = useState(100);

  const m = useMemo(() => calculateModel({
    leads, conv, avgCheck,
    lessons, price, teacherRate: tRate,
    premLessons, premPrice, premTeacherRate: premRate,
    courses, coursePrice: courseP,
    guides, guidePrice: guideP,
    managerCount,
    mgr1Fix, mgr1BonusPct: mgr1Bonus, mgr1Kpi,
    mgr2Fix, mgr2BonusPct: mgr2Bonus, mgr2Kpi,
    otherCosts: other,
  }), [
    leads, conv, avgCheck,
    lessons, price, tRate,
    premLessons, premPrice, premRate,
    courses, courseP, guides, guideP,
    managerCount, mgr1Fix, mgr1Bonus, mgr1Kpi, mgr2Fix, mgr2Bonus, mgr2Kpi,
    other,
  ]);

  const ok = m.isProfitable;

  const tbl = [
    {
      name: `Уроки обычн. (${lessons})`,
      rev: m.lessonsRevenue, cost: m.lessonsCost,
      prof: m.lessonsProfit, mrg: m.lessonsMargin,
    },
    ...(premLessons > 0 ? [{
      name: `Уроки прем. (${premLessons})`,
      rev: m.premRevenue, cost: m.premCost,
      prof: m.premProfit, mrg: m.premMargin,
    }] : []),
    {
      name: `Курсы (${courses})`,
      rev: m.coursesRevenue, cost: 0, prof: m.coursesRevenue, mrg: 100,
    },
    {
      name: `Гайды (${guides})`,
      rev: m.guidesRevenue, cost: 0, prof: m.guidesRevenue, mrg: 100,
    },
  ];

  return (
    <div style={{
      background: "#0f1117", minHeight: "100vh", padding: 20,
      fontFamily: "system-ui, sans-serif", color: "#e2e8f0",
    }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
          French.Super — Финансовая модель
        </h1>
        <p style={{ fontSize: 12, color: DIM, margin: "0 0 16px" }}>
          Двигай ползунки — цифры мгновенно пересчитываются
        </p>

        {/* ── Summary cards ── */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Card
            title="Выручка/мес (по продуктам)"
            value={`$${m.totalRevenue.toLocaleString()}`}
            sub={`Воронка (оценка): $${m.funnelRevenue.toLocaleString()}`}
          />
          <Card
            title="Расходы"
            value={`$${m.totalCost.toLocaleString()}`}
            color={R}
            sub={`Менедж. $${m.managerCostTotal} | Преп. $${m.teacherCostTotal} | Др. $${other}`}
          />
          <Card
            title="Прибыль"
            value={`${ok ? "+" : "−"}$${Math.abs(m.netProfit).toLocaleString()}`}
            color={ok ? G : R}
            sub={`Маржа ${m.netMargin}%`}
          />
          <Card
            title="ROI менеджеров"
            value={`×${m.managerRoi}`}
            color={B}
            sub={`Безубыт.: ${m.breakeven} заявок/день`}
          />
        </div>

        {/* ── Breakeven bar ── */}
        <div style={{ ...panel, marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: DIM, marginBottom: 6 }}>
            Безубыточность: {m.breakeven} заявок/день | Сейчас: {leads} |{" "}
            {ok ? "✅ В плюсе" : `❌ Нужно ещё ${Math.max(m.breakeven - leads, 0)}`}
          </div>
          <div style={{
            position: "relative", height: 20, background: "#1e2235",
            borderRadius: 5, overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%",
              width: `${Math.min(leads / Math.max(30, m.breakeven + 5) * 100, 100)}%`,
              background: ok
                ? `linear-gradient(90deg,#059669,${G})`
                : `linear-gradient(90deg,#dc2626,${R})`,
              borderRadius: 5, transition: "width 0.3s",
            }} />
            <div style={{
              position: "absolute",
              left: `${Math.min(m.breakeven / Math.max(30, m.breakeven + 5) * 100, 98)}%`,
              top: 0, height: "100%", borderLeft: "2px dashed #fbbf24",
            }} />
          </div>
        </div>

        {/* ── Main grid ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14,
        }}>

          {/* Left: Доходы */}
          <div>
            {/* Воронка */}
            <div style={panel}>
              <div style={sTitle}>Воронка продаж</div>
              <Sl label="Заявок в день" value={leads} onChange={setLeads} min={1} max={50} />
              <Sl label="Конверсия в оплату" value={conv} onChange={setConv} min={1} max={40} unit="%" />
              <Sl label="Средний чек" value={avgCheck} onChange={setAvgCheck} min={20} max={200} step={5} unit="$" />
              <Divider />
              <Row label="Продаж в день" value={`${m.dailySales}`} color={B} />
              <Row
                label="Выручка (оценка воронки)"
                value={`$${m.funnelRevenue.toLocaleString()}/мес`}
                color={B}
              />
              <Row
                label="Выручка (по продуктам)"
                value={`$${m.totalRevenue.toLocaleString()}/мес`}
                color="#e2e8f0"
              />
            </div>

            {/* Уроки обычные */}
            <div style={panel}>
              <div style={sTitle}>Уроки обычные</div>
              <Sl label="Уроков/мес" value={lessons} onChange={setLessons} min={0} max={300} />
              <Sl label="Цена урока" value={price} onChange={setPrice} min={15} max={60} unit="€" />
              <Sl label="Ставка преподавателя" value={tRate} onChange={setTRate} min={5} max={25} unit="€" />
              <Divider />
              <Row label="Выручка" value={`$${m.lessonsRevenue}`} color="#e2e8f0" />
              <Row
                label="Маржа"
                value={`${m.lessonsMargin}%`}
                color={m.lessonsMargin >= 50 ? G : "#94a3b8"}
              />
            </div>

            {/* Уроки премиум */}
            <div style={panel}>
              <div style={sTitle}>Уроки премиум</div>
              <Sl label="Уроков/мес" value={premLessons} onChange={setPremLessons} min={0} max={200} />
              <Sl label="Цена урока" value={premPrice} onChange={setPremPrice} min={25} max={80} unit="€" />
              <Sl label="Ставка преподавателя" value={premRate} onChange={setPremRate} min={10} max={40} unit="€" />
              {premLessons > 0 && (
                <>
                  <Divider />
                  <Row label="Выручка" value={`$${m.premRevenue}`} color="#e2e8f0" />
                  <Row
                    label="Маржа"
                    value={`${m.premMargin}%`}
                    color={m.premMargin >= 50 ? G : "#94a3b8"}
                  />
                </>
              )}
            </div>

            {/* Цифровые продукты */}
            <div style={panel}>
              <div style={sTitle}>Цифровые продукты</div>
              <Sl label="Курсов продано/мес" value={courses} onChange={setCourses} min={0} max={50} />
              <Sl label="Средний чек курса" value={courseP} onChange={setCourseP} min={20} max={200} unit="$" />
              <Sl label="Гайдов продано/мес" value={guides} onChange={setGuides} min={0} max={100} />
              <Sl label="Средний чек гайда" value={guideP} onChange={setGuideP} min={10} max={50} unit="$" />
              <Divider />
              <Row label="Выручка курсы" value={`$${m.coursesRevenue}`} color="#e2e8f0" />
              <Row label="Выручка гайды" value={`$${m.guidesRevenue}`} color="#e2e8f0" />
              <Row label="Маржа цифровых продуктов" value="100%" color={G} />
            </div>
          </div>

          {/* Right: Расходы */}
          <div>
            {/* Менеджеры */}
            <div style={panel}>
              <div style={sTitle}>Менеджеры</div>

              {/* Количество */}
              <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                {[0, 1, 2].map(n => (
                  <button
                    key={n}
                    onClick={() => setManagerCount(n)}
                    style={{
                      flex: 1, padding: "6px 0", borderRadius: 6,
                      cursor: "pointer", border: "1px solid", fontSize: 11, fontWeight: 600,
                      borderColor: managerCount === n ? B : "#2d3348",
                      background: managerCount === n ? "rgba(79,140,255,0.1)" : "#0f1117",
                      color: managerCount === n ? B : DIM,
                    }}
                  >
                    {n === 0 ? "Без менедж." : n === 1 ? "1 менеджер" : "2 менеджера"}
                  </button>
                ))}
              </div>

              {/* Карточки менеджеров */}
              {m.managersList[0] && (
                <ManagerCard
                  data={m.managersList[0]}
                  fix={mgr1Fix} onFix={setMgr1Fix}
                  bonusPct={mgr1Bonus} onBonusPct={setMgr1Bonus}
                  kpi={mgr1Kpi} onKpi={setMgr1Kpi}
                />
              )}
              {m.managersList[1] && (
                <ManagerCard
                  data={m.managersList[1]}
                  fix={mgr2Fix} onFix={setMgr2Fix}
                  bonusPct={mgr2Bonus} onBonusPct={setMgr2Bonus}
                  kpi={mgr2Kpi} onKpi={setMgr2Kpi}
                />
              )}

              {managerCount > 0 && (
                <div style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "6px 0", marginTop: 2,
                }}>
                  <span style={{ fontSize: 12, color: DIM }}>
                    Итого расходы на менеджеров
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>
                    ${m.managerCostTotal.toLocaleString()}/мес
                  </span>
                </div>
              )}
            </div>

            {/* Преподаватели */}
            <div style={panel}>
              <div style={sTitle}>Преподаватели</div>
              <Row
                label={`Обычные (${lessons} × €${tRate})`}
                value={`$${m.lessonsCost}`}
                color="#e2e8f0"
              />
              {premLessons > 0 && (
                <Row
                  label={`Премиум (${premLessons} × €${premRate})`}
                  value={`$${m.premCost}`}
                  color="#e2e8f0"
                />
              )}
              <Divider />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, color: DIM }}>Итого</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>
                  ${m.teacherCostTotal.toLocaleString()}/мес
                </span>
              </div>
              <div style={{ fontSize: 10, color: DIM, marginTop: 4 }}>
                Только за проведённые уроки, фикс отсутствует
              </div>
            </div>

            {/* Прочие расходы */}
            <div style={panel}>
              <div style={sTitle}>Прочие расходы</div>
              <Sl
                label="Сервисы, реклама, прочее"
                value={other} onChange={setOther}
                min={0} max={500} unit="$"
              />
              <div style={{ fontSize: 10, color: DIM, marginTop: 2 }}>
                CRM (Alfa), Chatwoot, хостинг, инструменты
              </div>
            </div>

            {/* Сводка расходов */}
            <div style={{
              ...panel,
              background: ok ? "rgba(52,211,153,0.05)" : "rgba(248,113,113,0.05)",
              border: `1px solid ${ok ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
            }}>
              <div style={sTitle}>Сводка</div>
              <Row label="Менеджеры" value={`$${m.managerCostTotal.toLocaleString()}`} color="#e2e8f0" />
              <Row label="Преподаватели" value={`$${m.teacherCostTotal.toLocaleString()}`} color="#e2e8f0" />
              <Row label="Прочее" value={`$${other}`} color="#e2e8f0" />
              <Divider />
              <Row label="Итого расходы" value={`$${m.totalCost.toLocaleString()}`} color={R} bold />
              <Row label="Выручка" value={`$${m.totalRevenue.toLocaleString()}`} color="#e2e8f0" />
              <Row
                label="Прибыль"
                value={`${ok ? "+" : "−"}$${Math.abs(m.netProfit).toLocaleString()}`}
                color={ok ? G : R}
                bold
              />
            </div>
          </div>
        </div>

        {/* ── Юнит-экономика ── */}
        <div style={{ ...panel, marginBottom: 14 }}>
          <div style={sTitle}>Юнит-экономика</div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "2.5fr 1fr 1fr 1fr 0.8fr",
            padding: "4px 10px", fontSize: 10, color: DIM,
            borderBottom: "1px solid #2d3348",
          }}>
            {["Продукт", "Выручка", "Себест.", "Прибыль", "Маржа"].map((h, i) => (
              <span key={h} style={{ textAlign: i === 0 ? "left" : "right" }}>{h}</span>
            ))}
          </div>
          {tbl.map((r, i) => (
            <div key={i} style={{
              display: "grid",
              gridTemplateColumns: "2.5fr 1fr 1fr 1fr 0.8fr",
              padding: "6px 10px", fontSize: 12,
              borderBottom: "1px solid #1e2235",
            }}>
              <span>{r.name}</span>
              <span style={{ textAlign: "right" }}>${r.rev}</span>
              <span style={{ textAlign: "right", color: r.cost > 0 ? R : DIM }}>
                {r.cost > 0 ? `−$${r.cost}` : "—"}
              </span>
              <span style={{ textAlign: "right", color: r.prof >= 0 ? G : R, fontWeight: 600 }}>
                ${r.prof}
              </span>
              <span style={{ textAlign: "right", color: r.mrg >= 50 ? G : "#94a3b8" }}>
                {r.mrg}%
              </span>
            </div>
          ))}
        </div>

        {/* ── Итоговый вывод ── */}
        <div style={{
          background: ok ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
          border: `1px solid ${ok ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
          borderRadius: 10, padding: 14,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: ok ? G : R, marginBottom: 4 }}>
            {ok ? "✅ Школа в плюсе" : "❌ Школа пока в минусе"}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>
            {ok
              ? `Выручка $${m.totalRevenue.toLocaleString()} − расходы $${m.totalCost.toLocaleString()} = прибыль $${m.netProfit.toLocaleString()}/мес. `
              + `Менеджеры окупаются ×${m.managerRoi}. `
              + `Цифровые продукты (гайды, курсы) — маржа 100%, ключ к росту.`
              : `Нужно ${m.breakeven} заявок/день, сейчас ${leads}. `
              + `Попробуй увеличить конверсию, средний чек или продажи цифровых продуктов (маржа 100%).`}
          </div>
        </div>
      </div>
    </div>
  );
}
