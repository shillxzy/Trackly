import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getFocusSessions } from "../../services/focusSessions";

export default function FocusTimeChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    async function fetchData() {
      const sessions = await getFocusSessions();

      const weekData = days.map((day) => ({ day, minutes: 0 }));

      sessions.forEach((s) => {
        if (s.status !== "active") {
          const date = new Date(s.started_at);
          const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
          weekData[dayIndex].minutes += s.actual_duration_minutes;
        }
      });

      setData(weekData);
    }

    fetchData();
  }, []);

  return (
    <div className="chart-card">
      <h3>Focus Time</h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3D6FDB" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#3864AF" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="day" />
            {/* Фіксована вісь Y від 0 до 25 */}
            <YAxis domain={[0, 25]} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#3D6FDB"
              fill="url(#focusGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
