"use client";
import { useState, useMemo } from "react";

function Sl({ label, value, onChange, min, max, step = 1, unit = "" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#6ba1ff", fontWeight: 600 }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(+e.target.value)}
        style={{ width: "100%", accentColor: "#4f8cff" }} />
    </div>
  );
}

function Card({ title, value, sub, color = "#e2e8f0" }) {
  return (
    <div style={{ background: "#1a1d27", borderRadius: 10, padding: "12px 16px", border: "1px solid #2d3348", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function App() {
  const [leads, setLeads] = useState(5);
  const [conv, setConv] = useState(15);
  const [lessons, setLessons] = useState(40);
  const [price, setPrice] = useState(30);
  const [tRate, setTRate] = useState(10);
  const [premLessons, setPremLessons] = useState(0);
  const [premPrice, setPremPrice] = useState(45);
  const [premRate, setPremRate] = useState(15);
  const [courses, setCourses] = useState(5);
  const [courseP, setCourseP] = useState(70);
  const [guides, setGuides] = useState(10);
  const [guideP, setGuideP] = useState(20);
  const [mgrs, setMgrs] = useState(2);
  const [mgrFix, setMgrFix] = useState(350);
  const [mgrPct, setMgrPct] = useState(7);
  const [other, setOther] = useState(100);

  const m = useMemo(() => {
    const lr = lessons * price, lt = lessons * tRate, lp = lr - lt;
    const pr = premLessons * premPrice, pt = premLessons * premRate, pp = pr - pt;
    const cr = courses * courseP, gr = guides * guideP;
    const rev = lr + pr + cr + gr;
    const mf = mgrs * mgrFix, mb = Math.round(rev * mgrPct / 100), mk = mgrs * 35;
    const mc = mf + mb + mk, tc = lt + pt, tot = mc + tc + other;
    const net = rev - tot;
    const roi = mc > 0 ? (rev / mc).toFixed(1) : "0";
    const avgPerLead = rev / Math.max(leads * 26, 1);
    const be = avgPerLead > 0 ? Math.ceil(tot / (avgPerLead * 26)) : 999;
    return { lr, lt, lp, pr, pt, pp, cr, gr, rev, mf, mb, mk, mc, tc, tot, net, roi, be,
      lm: lr > 0 ? Math.round(lp / lr * 100) : 0, pm: pr > 0 ? Math.round(pp / pr * 100) : 0,
      nm: rev > 0 ? Math.round(net / rev * 100) : 0, mpp: mgrs > 0 ? Math.round(mc / mgrs) : 0 };
  }, [leads, conv, lessons, price, tRate, premLessons, premPrice, premRate, courses, courseP, guides, guideP, mgrs, mgrFix, mgrPct, other]);

  const ok = m.net >= 0;
  const G = "#34d399", R = "#f87171";

  const tbl = [
    { name: `Уроки обычн. (${lessons})`, rev: m.lr, cost: m.lt, prof: m.lp, mrg: m.lm },
    ...(premLessons > 0 ? [{ name: `Уроки прем. (${premLessons})`, rev: m.pr, cost: m.pt, prof: m.pp, mrg: m.pm }] : []),
    { name: `Курсы (${courses})`, rev: m.cr, cost: 0, prof: m.cr, mrg: 100 },
    { name: `Гайды (${guides})`, rev: m.gr, cost: 0, prof: m.gr, mrg: 100 },
  ];

  return (
    <div style={{ background: "#0f1117", minHeight: "100vh", padding: 20, fontFamily: "system-ui, sans-serif", color: "#e2e8f0" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>French.Super — Финансовая модель</h1>
        <p style={{ fontSize: 12, color: "#64748b", margin: "0 0 16px" }}>Двигай ползунки — цифры мгновенно пересчитываются</p>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <Card title="Выручка/мес" value={`$${m.rev.toLocaleString()}`} />
          <Card title="Расходы" value={`$${m.tot.toLocaleString()}`} color={R} sub={`Менеджеры $${m.mc} | Преп. $${m.tc} | Др. $${other}`} />
          <Card title="Прибыль" value={`${ok?"+":"−"}$${Math.abs(m.net).toLocaleString()}`} color={ok?G:R} sub={`Маржа ${m.nm}%`} />
          <Card title="ROI менеджеров" value={`×${m.roi}`} color="#6ba1ff" sub={`Безубыт.: ${m.be} заявок/день`} />
        </div>

        <div style={{ background: "#1a1d27", borderRadius: 10, padding: "10px 14px", border: "1px solid #2d3348", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#64748b", marginBottom: 6 }}>
            Безубыточность: {m.be} заявок/день | Сейчас: {leads} | {ok ? "✅ В плюсе" : `❌ Не хватает ${m.be - leads}`}
          </div>
          <div style={{ position: "relative", height: 20, background: "#1e2235", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: "100%",
              width: `${Math.min(leads / Math.max(30, m.be + 5) * 100, 100)}%`,
              background: ok ? `linear-gradient(90deg,#059669,${G})` : `linear-gradient(90deg,#dc2626,${R})`,
              borderRadius: 5, transition: "width 0.3s" }} />
            <div style={{ position: "absolute", left: `${Math.min(m.be / Math.max(30, m.be + 5) * 100, 98)}%`,
              top: 0, height: "100%", borderLeft: "2px dashed #fbbf24" }} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div style={{ background: "#1a1d27", borderRadius: 10, padding: 14, border: "1px solid #2d3348" }}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>Доходы</div>
            <Sl label="Заявок/день" value={leads} onChange={setLeads} min={1} max={50} />
            <Sl label="Конверсия %" value={conv} onChange={setConv} min={5} max={40} unit="%" />
            <div style={{ borderTop: "1px solid #2d3348", margin: "8px 0" }} />
            <Sl label="Уроков/мес (обычн.)" value={lessons} onChange={setLessons} min={0} max={300} />
            <Sl label="Цена урока €" value={price} onChange={setPrice} min={15} max={60} unit="€" />
            <Sl label="Ставка преп. €" value={tRate} onChange={setTRate} min={5} max={25} unit="€" />
            <div style={{ borderTop: "1px solid #2d3348", margin: "8px 0" }} />
            <Sl label="Уроков/мес (премиум)" value={premLessons} onChange={setPremLessons} min={0} max={200} />
            <Sl label="Цена €" value={premPrice} onChange={setPremPrice} min={25} max={80} unit="€" />
            <Sl label="Ставка преп. €" value={premRate} onChange={setPremRate} min={10} max={40} unit="€" />
            <div style={{ borderTop: "1px solid #2d3348", margin: "8px 0" }} />
            <Sl label="Курсов/мес" value={courses} onChange={setCourses} min={0} max={50} />
            <Sl label="Ср.чек курса $" value={courseP} onChange={setCourseP} min={20} max={200} unit="$" />
            <Sl label="Гайдов/мес" value={guides} onChange={setGuides} min={0} max={100} />
            <Sl label="Ср.чек гайда $" value={guideP} onChange={setGuideP} min={10} max={50} unit="$" />
          </div>

          <div style={{ background: "#1a1d27", borderRadius: 10, padding: 14, border: "1px solid #2d3348" }}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, fontWeight: 600 }}>Расходы</div>
            <Sl label="Менеджеров" value={mgrs} onChange={setMgrs} min={0} max={3} />
            <Sl label="Фикс $/чел" value={mgrFix} onChange={setMgrFix} min={200} max={600} unit="$" />
            <Sl label="Бонус от продаж %" value={mgrPct} onChange={setMgrPct} min={0} max={15} unit="%" />
            <Sl label="Сервисы, другое $" value={other} onChange={setOther} min={0} max={500} unit="$" />

            <div style={{ marginTop: 12, padding: 10, background: "#0f1117", borderRadius: 8, border: "1px solid #2d3348", fontSize: 12, color: "#94a3b8", lineHeight: 1.9 }}>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Менеджеры — детали</div>
              <div>Фикс ({mgrs}×${mgrFix}): <b style={{color:"#e2e8f0"}}>${m.mf}</b></div>
              <div>Бонус {mgrPct}%: <b style={{color:"#e2e8f0"}}>${m.mb}</b></div>
              <div>KPI ({mgrs}×$35): <b style={{color:"#e2e8f0"}}>${m.mk}</b></div>
              <div style={{borderTop:"1px solid #2d3348", paddingTop: 4, marginTop: 4}}>
                Итого: <b style={{color:"#fbbf24", fontSize: 14}}>${m.mc}/мес</b> • на 1 чел: <b style={{color:"#e2e8f0"}}>${m.mpp}</b>
              </div>
            </div>

            <div style={{ marginTop: 8, padding: 10, background: "#0f1117", borderRadius: 8, border: "1px solid #2d3348", fontSize: 12, color: "#94a3b8", lineHeight: 1.9 }}>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Зарплата 1 менеджера</div>
              <div>Фикс: <b style={{color:"#e2e8f0"}}>${mgrFix}</b></div>
              <div>7% от ~${Math.round(m.rev/Math.max(mgrs,1))}: <b style={{color:"#e2e8f0"}}>${Math.round(m.rev/Math.max(mgrs,1)*mgrPct/100)}</b></div>
              <div>KPI: <b style={{color:"#e2e8f0"}}>до $35</b></div>
              <div style={{borderTop:"1px solid #2d3348", paddingTop: 4, marginTop: 4}}>
                На руки: <b style={{color: G, fontSize: 14}}>${m.mpp}/мес</b>
              </div>
            </div>

            <div style={{ marginTop: 8, padding: 10, background: "#0f1117", borderRadius: 8, border: "1px solid #2d3348", fontSize: 12, color: "#94a3b8", lineHeight: 1.9 }}>
              <div style={{ fontSize: 10, color: "#64748b", fontWeight: 600, textTransform: "uppercase", marginBottom: 6 }}>Преподаватели</div>
              <div>Обычн. ({lessons}×€{tRate}): <b style={{color:"#e2e8f0"}}>${m.lt}</b></div>
              {premLessons > 0 && <div>Прем. ({premLessons}×€{premRate}): <b style={{color:"#e2e8f0"}}>${m.pt}</b></div>}
              <div style={{borderTop:"1px solid #2d3348", paddingTop: 4, marginTop: 4}}>
                Итого: <b style={{color:"#fbbf24", fontSize: 14}}>${m.tc}/мес</b>
                <span style={{fontSize:10, color:"#64748b", marginLeft: 8}}>Нет фикса — только за уроки</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product table */}
        <div style={{ background: "#1a1d27", borderRadius: 10, padding: 14, border: "1px solid #2d3348", marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 600 }}>Юнит-экономика</div>
          <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 0.8fr", padding: "4px 10px", fontSize: 10, color: "#64748b", borderBottom: "1px solid #2d3348" }}>
            {["Продукт","Выручка","Себест.","Прибыль","Маржа"].map(h => <span key={h} style={{textAlign: h==="Продукт"?"left":"right"}}>{h}</span>)}
          </div>
          {tbl.map((r,i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 0.8fr", padding: "6px 10px", fontSize: 12, borderBottom: "1px solid #1e2235" }}>
              <span>{r.name}</span>
              <span style={{textAlign:"right"}}>${r.rev}</span>
              <span style={{textAlign:"right", color: R}}>−${r.cost}</span>
              <span style={{textAlign:"right", color: r.prof>=0?G:R, fontWeight:600}}>${r.prof}</span>
              <span style={{textAlign:"right", color: r.mrg>=50?G:"#94a3b8"}}>{r.mrg}%</span>
            </div>
          ))}
        </div>

        <div style={{ background: ok ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
          border: `1px solid ${ok ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
          borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: ok ? G : R, marginBottom: 4 }}>
            {ok ? "✅ Школа в плюсе" : "❌ Школа пока в минусе"}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6 }}>
            {ok
              ? `Выручка $${m.rev.toLocaleString()} − расходы $${m.tot.toLocaleString()} = прибыль $${m.net.toLocaleString()}/мес. Менеджеры окупаются ×${m.roi}. Цифровые продукты (гайды, курсы) = маржа 100%, ключ к росту.`
              : `Довести до ${m.be} заявок/день или увеличить продажи цифровых продуктов (маржа 100%). Попробуй подвинуть ползунки курсов и гайдов.`}
          </div>
        </div>
      </div>
    </div>
  );
}
