import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getHabitCompletions } from "../../services/habitCompletions";

export default function WeeklyProgressChart() {
  const [data, setData] = useState([]);
  useEffect(() => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  async function fetchData() {
    const completions = await getHabitCompletions();
    const weekData = days.map((day) => ({ day, completed: 0 }));

    completions.forEach((c) => {
      const date = new Date(c.completed_at);
      const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
      weekData[dayIndex].completed += 1;
    });

    setData(weekData);
  }

  fetchData();
}, []); 

  return (
    <div className="chart-card">
      <h3>Weekly Progress</h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <defs>
              <linearGradient id="weeklyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFA600" />
                <stop offset="100%" stopColor="#FFD079" />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="completed" fill="url(#weeklyGradient)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
