"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { calculateModel } from "../lib/calculations.js";
import { encodeStateToUrl, decodeStateFromUrl } from "../lib/urlState.js";
import { createClient } from "../lib/supabase.js";

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

function TeacherCard({ teacher, onUpdate, onRemove, canRemove }) {
  const revenue = teacher.lessonsPerMonth * teacher.pricePerLesson;
  const cost = teacher.lessonsPerMonth * teacher.ratePerLesson;
  const margin = revenue > 0 ? Math.round(((revenue - cost) / revenue) * 100) : 0;
  const studentsEstimate = teacher.avgLessonsPerStudent > 0
    ? Math.round(teacher.lessonsPerMonth / teacher.avgLessonsPerStudent)
    : 0;

  return (
    <div style={{
      background: "#0f1117", borderRadius: 8, padding: 12,
      marginBottom: 8, border: "1px solid #2d3348",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 10,
      }}>
        <input
          value={teacher.name}
          onChange={e => onUpdate(teacher.id, "name", e.target.value)}
          style={{
            background: "transparent", border: "none", borderBottom: "1px solid #2d3348",
            color: "#e2e8f0", fontSize: 13, fontWeight: 700, outline: "none",
            width: "70%", paddingBottom: 2,
          }}
        />
        {canRemove && (
          <button
            onClick={() => onRemove(teacher.id)}
            style={{
              background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
              color: R, borderRadius: 5, padding: "2px 8px", fontSize: 10,
              cursor: "pointer", fontWeight: 600,
            }}
          >
            Удалить
          </button>
        )}
      </div>

      <Sl
        label="Уроков/мес"
        value={teacher.lessonsPerMonth}
        onChange={v => onUpdate(teacher.id, "lessonsPerMonth", v)}
        min={0} max={300}
      />
      <Sl
        label="Цена урока для ученика"
        value={teacher.pricePerLesson}
        onChange={v => onUpdate(teacher.id, "pricePerLesson", v)}
        min={15} max={80} unit="$"
      />
      <Sl
        label="Ставка преподавателя"
        value={teacher.ratePerLesson}
        onChange={v => onUpdate(teacher.id, "ratePerLesson", v)}
        min={5} max={40} unit="$"
      />
      <Sl
        label="Уроков на ученика в мес"
        value={teacher.avgLessonsPerStudent}
        onChange={v => onUpdate(teacher.id, "avgLessonsPerStudent", v)}
        min={1} max={20}
      />

      <Divider />

      <Row label="Выручка" value={`$${revenue.toLocaleString()}`} color="#e2e8f0" />
      <Row label="Себестоимость" value={`$${cost.toLocaleString()}`} color={R} />
      <Row
        label="Маржа"
        value={`${margin}%`}
        color={margin >= 50 ? G : "#94a3b8"}
      />
      <Row label="Учеников (оценка)" value={`${studentsEstimate}`} color={B} />

      <Divider />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 11, color: DIM }}>
          Итого выплата преподавателю
        </span>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#fbbf24" }}>
          ${cost.toLocaleString()}/мес
        </span>
      </div>
    </div>
  );
}

function ProductCard({ product, computed, onUpdate, onRemove, canRemove }) {
  const margin = computed?.margin ?? 0;
  const isPhysical = product.unitCost > 0;

  return (
    <div style={{
      background: "#0f1117", borderRadius: 8, padding: 12,
      marginBottom: 8, border: "1px solid #2d3348",
    }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 10,
      }}>
        <input
          value={product.name}
          onChange={e => onUpdate(product.id, "name", e.target.value)}
          style={{
            background: "transparent", border: "none", borderBottom: "1px solid #2d3348",
            color: "#e2e8f0", fontSize: 13, fontWeight: 700, outline: "none",
            width: "75%", paddingBottom: 2,
          }}
        />
        {canRemove && (
          <button
            onClick={() => onRemove(product.id)}
            style={{
              background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)",
              color: R, borderRadius: 5, padding: "2px 8px", fontSize: 10,
              cursor: "pointer", fontWeight: 600,
            }}
          >
            Удалить
          </button>
        )}
      </div>

      <Sl
        label="Продано / мес"
        value={product.unitsSoldPerMonth}
        onChange={v => onUpdate(product.id, "unitsSoldPerMonth", v)}
        min={0} max={100}
      />
      <Sl
        label="Цена за единицу"
        value={product.unitPrice}
        onChange={v => onUpdate(product.id, "unitPrice", v)}
        min={5} max={300} step={5} unit="$"
      />
      <Sl
        label="Себестоимость (0 = цифровой)"
        value={product.unitCost}
        onChange={v => onUpdate(product.id, "unitCost", v)}
        min={0} max={200} step={1} unit="$"
      />

      <Divider />

      <Row label="Выручка" value={`$${(computed?.revenue ?? 0).toLocaleString()}`} color="#e2e8f0" />
      {isPhysical && (
        <Row label="Себестоимость" value={`$${(computed?.cost ?? 0).toLocaleString()}`} color={R} />
      )}
      <Row
        label="Прибыль"
        value={`$${(computed?.profit ?? 0).toLocaleString()}`}
        color={margin >= 50 ? G : "#94a3b8"}
        bold
      />
      <Row
        label="Маржа"
        value={`${margin}%`}
        color={margin >= 70 ? G : margin >= 40 ? "#fbbf24" : "#94a3b8"}
      />
    </div>
  );
}

function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button onClick={handleCopy} style={{
      background: copied ? "rgba(52,211,153,0.1)" : "rgba(79,140,255,0.08)",
      border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "#2d3348"}`,
      color: copied ? "#34d399" : "#6ba1ff",
      borderRadius: 6, padding: "5px 12px",
      fontSize: 11, fontWeight: 600, cursor: "pointer",
    }}>
      {copied ? "✓ Скопировано" : "⎘ Копировать ссылку"}
    </button>
  );
}

function AuthPanel({ user, onLogout }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    setSent(true);
  }

  if (user) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: "#34d399" }}>✓ {user.email}</span>
        <button onClick={onLogout} style={{
          background: "transparent", border: "1px solid #2d3348",
          color: DIM, borderRadius: 6, padding: "3px 8px",
          fontSize: 11, cursor: "pointer",
        }}>Выйти</button>
      </div>
    );
  }

  if (sent) {
    return <span style={{ fontSize: 11, color: "#34d399" }}>✓ Ссылка отправлена на {email}</span>;
  }

  return (
    <form onSubmit={handleLogin} style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <input
        type="email" required placeholder="Email для входа" value={email}
        onChange={e => setEmail(e.target.value)}
        style={{
          background: "#1a1d27", border: "1px solid #2d3348", color: "#e2e8f0",
          borderRadius: 6, padding: "4px 10px", fontSize: 11, outline: "none", width: 180,
        }}
      />
      <button type="submit" disabled={loading} style={{
        background: "rgba(79,140,255,0.15)", border: "1px solid #2d3348",
        color: "#6ba1ff", borderRadius: 6, padding: "4px 12px",
        fontSize: 11, fontWeight: 600, cursor: "pointer",
      }}>
        {loading ? "..." : "Войти"}
      </button>
    </form>
  );
}

export default function App() {
  // Воронка
  const [leads, setLeads] = useState(5);
  const [conv, setConv] = useState(15);
  const [avgCheck, setAvgCheck] = useState(50);

  // Уроки обычные (сохранены для обратной совместимости с calculateModel)
  const [lessons, setLessons] = useState(40);
  const [price, setPrice] = useState(30);
  const [tRate, setTRate] = useState(10);

  // Уроки премиум (сохранены для обратной совместимости с calculateModel)
  const [premLessons, setPremLessons] = useState(0);
  const [premPrice, setPremPrice] = useState(45);
  const [premRate, setPremRate] = useState(15);

  // Продукты (динамический список)
  const [products, setProducts] = useState([
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
  ]);

  // Менеджеры
  const [managerCount, setManagerCount] = useState(2);
  const [mgr1Fix, setMgr1Fix] = useState(350);
  const [mgr1Bonus, setMgr1Bonus] = useState(7);
  const [mgr1Kpi, setMgr1Kpi] = useState(30);
  const [mgr2Fix, setMgr2Fix] = useState(350);
  const [mgr2Bonus, setMgr2Bonus] = useState(7);
  const [mgr2Kpi, setMgr2Kpi] = useState(30);

  // Преподаватели
  const [teachers, setTeachers] = useState([
    { id: "t1", name: "Преподаватель А", lessonsPerMonth: 40, pricePerLesson: 30, ratePerLesson: 10, avgLessonsPerStudent: 8 },
  ]);

  // Прочее
  const [other, setOther] = useState(100);

  // Авторизация
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const supabase = createClient();

  function applyState(s) {
    if (s.leads != null) setLeads(s.leads);
    if (s.conv != null) setConv(s.conv);
    if (s.avgCheck != null) setAvgCheck(s.avgCheck);
    if (s.lessons != null) setLessons(s.lessons);
    if (s.price != null) setPrice(s.price);
    if (s.tRate != null) setTRate(s.tRate);
    if (s.premLessons != null) setPremLessons(s.premLessons);
    if (s.premPrice != null) setPremPrice(s.premPrice);
    if (s.premRate != null) setPremRate(s.premRate);
    if (s.products != null) setProducts(s.products);
    if (s.managerCount != null) setManagerCount(s.managerCount);
    if (s.mgr1Fix != null) setMgr1Fix(s.mgr1Fix);
    if (s.mgr1Bonus != null) setMgr1Bonus(s.mgr1Bonus);
    if (s.mgr1Kpi != null) setMgr1Kpi(s.mgr1Kpi);
    if (s.mgr2Fix != null) setMgr2Fix(s.mgr2Fix);
    if (s.mgr2Bonus != null) setMgr2Bonus(s.mgr2Bonus);
    if (s.mgr2Kpi != null) setMgr2Kpi(s.mgr2Kpi);
    if (s.teachers != null) setTeachers(s.teachers);
    if (s.other != null) setOther(s.other);
  }

  // Следим за сессией
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Загрузка состояния: из Supabase если залогинен, иначе из URL
  useEffect(() => {
    if (!authReady) return;
    if (user) {
      supabase.from("model_state").select("state").eq("user_id", user.id).single()
        .then(({ data }) => { if (data?.state) applyState(data.state); });
    } else {
      const hash = window.location.hash.slice(1);
      if (!hash) return;
      const state = decodeStateFromUrl(hash);
      if (state) applyState(state);
    }
  }, [authReady, user]);

  // Автосохранение: в Supabase если залогинен, иначе в URL
  const debounceTimer = useRef(null);
  useEffect(() => {
    if (!authReady) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      const state = {
        leads, conv, avgCheck, lessons, price, tRate,
        premLessons, premPrice, premRate,
        products, managerCount,
        mgr1Fix, mgr1Bonus, mgr1Kpi,
        mgr2Fix, mgr2Bonus, mgr2Kpi,
        teachers, other,
      };
      if (user) {
        supabase.from("model_state").upsert(
          { user_id: user.id, state, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      } else {
        window.location.hash = encodeStateToUrl(state);
      }
    }, 1000);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [leads, conv, avgCheck, lessons, price, tRate, premLessons, premPrice, premRate,
      products, managerCount, mgr1Fix, mgr1Bonus, mgr1Kpi, mgr2Fix, mgr2Bonus, mgr2Kpi,
      teachers, other, user, authReady]);

  function addTeacher() {
    setTeachers(prev => [...prev, {
      id: `t${Date.now()}`,
      name: `Преподаватель ${String.fromCharCode(64 + prev.length + 1)}`,
      lessonsPerMonth: 40, pricePerLesson: 30, ratePerLesson: 10, avgLessonsPerStudent: 8,
    }]);
  }

  function removeTeacher(id) {
    setTeachers(prev => prev.filter(t => t.id !== id));
  }

  function updateTeacher(id, field, value) {
    setTeachers(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  }

  function addProduct() {
    setProducts(prev => [...prev, {
      id: `p${Date.now()}`,
      name: "Новый продукт",
      unitPrice: 20,
      unitsSoldPerMonth: 0,
      unitCost: 0,
    }]);
  }

  function removeProduct(id) {
    setProducts(prev => prev.filter(p => p.id !== id));
  }

  function updateProduct(id, field, value) {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  }

  const m = useMemo(() => calculateModel({
    leads, conv, avgCheck,
    lessons, price, teacherRate: tRate,
    premLessons, premPrice, premTeacherRate: premRate,
    managerCount,
    mgr1Fix, mgr1BonusPct: mgr1Bonus, mgr1Kpi,
    mgr2Fix, mgr2BonusPct: mgr2Bonus, mgr2Kpi,
    otherCosts: other,
    teachers,
    products,
  }), [
    leads, conv, avgCheck,
    lessons, price, tRate,
    premLessons, premPrice, premRate,
    managerCount, mgr1Fix, mgr1Bonus, mgr1Kpi, mgr2Fix, mgr2Bonus, mgr2Kpi,
    other,
    teachers,
    products,
  ]);

  const ok = m.isProfitable;

  // Агрегаты по преподавателям (для отображения итогов)
  const teachersCostTotal = teachers.reduce((sum, t) => sum + t.lessonsPerMonth * t.ratePerLesson, 0);
  const teachersStudentsTotal = teachers.reduce((sum, t) =>
    sum + (t.avgLessonsPerStudent > 0 ? Math.round(t.lessonsPerMonth / t.avgLessonsPerStudent) : 0), 0);

  const tbl = [
    {
      name: `Инд. занятия (${teachers.reduce((s, t) => s + t.lessonsPerMonth, 0)} ур.)`,
      rev: m.lessonsRevenue, cost: m.lessonsCost,
      prof: m.lessonsProfit, mrg: m.lessonsMargin,
    },
    ...m.productsList.filter(p => p.unitsSoldPerMonth > 0).map(p => ({
      name: `${p.name} (×${p.unitsSoldPerMonth})`,
      rev: p.revenue, cost: p.cost, prof: p.profit, mrg: p.margin,
    })),
  ];

  return (
    <div style={{
      background: "#0f1117", minHeight: "100vh", padding: 20,
      fontFamily: "system-ui, sans-serif", color: "#e2e8f0",
    }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>
            French.Super — Финансовая модель
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <AuthPanel user={user} onLogout={() => supabase.auth.signOut()} />
            {!user && <CopyLinkButton />}
          </div>
        </div>
        <p style={{ fontSize: 12, color: DIM, margin: "0 0 16px" }}>
          {user ? "Данные сохраняются автоматически" : "Войдите чтобы сохранять данные между устройствами"}
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
            sub={`Менедж. $${m.managerCostTotal} | Преп. $${m.teacherCostTotal} | Др. $${other} | ${m.teachersStudentsTotal || teachersStudentsTotal} учеников`}
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

            {/* Продукты */}
            <div style={panel}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={sTitle}>Продукты</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: G }}>
                  ${m.productsRevenue.toLocaleString()}/мес
                </span>
              </div>

              {products.map(product => {
                const computed = m.productsList.find(p => p.id === product.id);
                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    computed={computed}
                    onUpdate={updateProduct}
                    onRemove={removeProduct}
                    canRemove={products.length > 1}
                  />
                );
              })}

              <button
                onClick={addProduct}
                style={{
                  width: "100%", padding: "7px 0", borderRadius: 6,
                  cursor: "pointer", border: "1px solid #2d3348", fontSize: 11,
                  fontWeight: 600, background: "#0f1117", color: DIM,
                  marginTop: 4,
                }}
              >
                + Добавить продукт
              </button>
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

              {teachers.map(teacher => (
                <TeacherCard
                  key={teacher.id}
                  teacher={teacher}
                  onUpdate={updateTeacher}
                  onRemove={removeTeacher}
                  canRemove={teachers.length > 1}
                />
              ))}

              {/* Кнопка добавления */}
              <button
                onClick={addTeacher}
                style={{
                  width: "100%", padding: "7px 0", borderRadius: 6,
                  cursor: "pointer", border: "1px solid #2d3348", fontSize: 11,
                  fontWeight: 600, background: "#0f1117", color: DIM,
                  marginTop: 4,
                }}
              >
                + Добавить преподавателя
              </button>

              <Divider />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 12, color: DIM }}>
                  Итого ({teachersStudentsTotal} учеников)
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>
                  ${teachersCostTotal.toLocaleString()}/мес
                </span>
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
