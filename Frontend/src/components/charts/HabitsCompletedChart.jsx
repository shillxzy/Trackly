import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useT } from "../../translations/LanguageContext";

const DAY_MASK = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32, 0: 64 };

export default function HabitsCompletedChart({ habits = [], completions = [] }) {
  const t = useT();

  const percent = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayMask = DAY_MASK[new Date().getDay()];

    const scheduledToday = habits.filter(
      (h) =>
        h.schedules &&
        h.schedules.length > 0 &&
        (h.schedules[0].day_of_week & todayMask) !== 0
    );

    const completedToday = completions.filter(
      (c) =>
        c.completed_at === today &&
        scheduledToday.some((h) => h.id === c.habit)
    ).length;

    const total = scheduledToday.length || 1;
    return Math.round((completedToday / total) * 100);
  }, [habits, completions]);

  const data = [
    { name: "Done", value: percent },
    { name: "Left", value: 100 - percent },
  ];

  return (
    <div className="chart-card">
      <h3>{t("charts.habitsCompleted")}</h3>
      <div style={{ width: "100%", height: 220, position: "relative" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              <Cell fill="#FFA600" />
              <Cell fill="#EFEFEF" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          {percent}%
        </div>
      </div>
    </div>
  );
}
