import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { getHabits } from "../../services/habits";
import { getHabitCompletions } from "../../services/habitCompletions";

export default function HabitsCompletedChart() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const habits = await getHabits();
      const completions = await getHabitCompletions();
      const today = new Date().toISOString().slice(0, 10);
      const completedToday = completions.filter((c) => c.completed_at === today).length;
      const total = habits.length || 1;
      setPercent(Math.round((completedToday / total) * 100));
    }

    fetchData();
  }, []);

  const data = [
    { name: "Done", value: percent },
    { name: "Left", value: 100 - percent },
  ];

  return (
    <div className="chart-card">
      <h3>Habits Completed</h3>
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
