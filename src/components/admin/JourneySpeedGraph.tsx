import { useMemo } from "react";
import { format } from "date-fns";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useUnits } from "@/hooks/useUnits";
import { exampleJourneySpeed } from "@/lib/journeySpeed";
import type { Journey } from "@/lib/userJourneys";

export default function JourneySpeedGraph({ journey }: { journey: Journey }) {
  const { speedValue, speedLabel } = useUnits();
  const points = useMemo(() => exampleJourneySpeed(journey), [journey.id, journey.startedAt, journey.duration, journey.mode]);
  const data = points.map(({ time, mph }) => ({ time, speed: speedValue(mph) }));
  return <section aria-label="Journey speed graph" className="space-y-4 pt-2">
    <div className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-2xl font-semibold text-portal-navy">Speed graph</h2>
      <p className="text-xs text-portal-muted">Example speeds · Not recorded GPS data</p>
    </div>
    <div className="rounded-md border border-portal-border/60 bg-background px-2 pb-4 pt-6 shadow-sm sm:px-6">
      <div className="mb-3 flex items-center justify-end gap-2 pr-4 text-xs text-foreground"><span className="h-0.5 w-4 bg-destructive" />Speed</div>
      <div className="h-[320px] w-full sm:h-[460px]" role="img" aria-label={`Example speed over time for journey ${journey.id}, in ${speedLabel}`}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 30 }}>
            <CartesianGrid stroke="hsl(var(--portal-border))" strokeDasharray="2 2" />
            <XAxis dataKey="time" type="number" domain={["dataMin", "dataMax"]} tickCount={8} minTickGap={35}
              tickFormatter={(value) => format(new Date(value), "HH:mm")} tick={{ fontSize: 11, fill: "hsl(var(--portal-muted))" }}
              stroke="hsl(var(--portal-border))" label={{ value: "Time", position: "bottom", offset: 14, fill: "hsl(var(--foreground))", fontSize: 12 }} />
            <YAxis width={54} domain={[0, "auto"]} tick={{ fontSize: 11, fill: "hsl(var(--portal-muted))" }} stroke="hsl(var(--portal-border))"
              label={{ value: `Speed (${speedLabel === "mph" ? "MPH" : "KPH"})`, angle: -90, position: "insideLeft", fill: "hsl(var(--foreground))", fontSize: 12 }} />
            <Tooltip labelFormatter={(value) => format(new Date(Number(value)), "HH:mm:ss")} formatter={(value) => [`${value} ${speedLabel}`, "Speed"]}
              contentStyle={{ backgroundColor: "hsl(var(--background))", borderColor: "hsl(var(--portal-border))", color: "hsl(var(--foreground))", borderRadius: 6 }} />
            <Line type="linear" dataKey="speed" name="Speed" stroke="hsl(var(--destructive))" strokeWidth={1.5} dot={false} activeDot={{ r: 4 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  </section>;
}