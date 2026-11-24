import AdminLayout from "@/components/admin/AdminLayout";

const influences = [
  { id: "time-of-day", name: "Time of day", desc: "Considers when a driver travels and how Time of day may influence their overall score.", level: "Very low influence", weight: 1, note: "This has a minimal contribution to the overall Driver Score." },
  { id: "time-on-task", name: "Time on task", desc: "Considers journey duration and speed to assess how they may contribute to Time on task risk.", level: "Very low influence", weight: 1, note: "This has a minimal contribution to the overall Driver Score." },
  { id: "mobile-use", name: "Mobile use", desc: "Measures how much a driver interacts with their phone, including voice and physical interaction.", level: "Moderate influence", weight: 3, note: "This has a balanced contribution to the overall Driver Score." },
  { id: "smooth-driving", name: "Smooth driving", desc: "Measures how smoothly a driver accelerates and brakes throughout their journey.", level: "Very high influence", weight: 5, note: "This has the greatest contribution to the overall Driver Score." },
  { id: "speed", name: "Speed", desc: "Measures how well a driver manages their speed, including speed consistency and higher-speed driving.", level: "Moderate influence", weight: 3, note: "This has a balanced contribution to the overall Driver Score." },
];

const situations = [
  ["Phone interaction while driving", "Mobile use considers voice interaction and physical interaction with the phone.", "Avoid handling the phone while driving and use appropriate hands-free options."],
  ["Harsh acceleration or braking", "Smooth driving considers how far acceleration or braking exceeds the defined thresholds.", "Accelerate and brake progressively where conditions allow."],
  ["Inconsistent speed", "Speed considers how consistently speed is maintained at lower speeds.", "Maintain a steady, appropriate speed where possible."],
  ["Driving above the configured high-speed threshold", "Higher speeds above the configured threshold always influence Speed.", "Stay within the applicable speed limit and avoid unnecessary higher speeds."],
  ["Time of day", "Time of day considers characteristics relating to when the journey takes place.", "Where practical, choose a lower-risk time to travel."],
  ["Longer periods of driving", "Time on task considers journey duration and speed as factors associated with fatigue over time.", "Take appropriate breaks during longer journeys."],
];

const scenarios = [
  ["Strong performance across all influences", "A driver accelerates and brakes smoothly, maintains their speed well, doesn't interact with their phone and has limited influence from the other journey factors.", "The different influences have a limited effect on the overall Driver Score, resulting in a stronger overall score."],
  ["Several influences affect the score", "A driver brakes harshly several times and also spends part of the journey travelling above the configured high-speed threshold.", "Both Smooth driving and Speed contribute to a lower overall Driver Score. The score isn't based on just one of these behaviours, both influences are combined."],
  ["One influence changes", "A driver's driving behaviour remains consistent, but they have a longer journey than usual.", "The Time on task influence may be greater because of the increased journey duration, which can contribute to a lower overall Driver Score."],
  ["Different factors contribute together", "A driver has a good Smooth driving score but has significant Mobile use influence and higher Speed influence during the journey.", "The positive Smooth driving behaviour doesn't remove the other influences. The Driver Score reflects the combined effect of all applicable factors."],
  ["Understanding the score breakdown", "A customer sees that their overall Driver Score is lower than expected. The individual influences show: Smooth driving: High, Speed: Moderate, Mobile use: Low, Time on task: High, Time of day: High.", "The customer achieved high scores for most contributing factors. They can see that a lower Mobile use score was the main driver of the reduced overall score, rather than assuming braking or acceleration was the cause. The overall Driver Score provides the summary, while the individual scores explain what contributed to it."],
];

const Section = ({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="bg-portal-panel border border-portal-border rounded-lg p-6 scroll-mt-6">
    <h2 className="text-xl font-bold text-portal-navy mb-4">{title}</h2>
    {children}
  </section>
);

const DriverScorePage = () => (
  <AdminLayout
    title="Driver score"
    crumbs={[{ label: "Home", to: "/admin/overview" }, { label: "Documentation", to: "/admin/documentation" }, { label: "Driver score" }]}
  >
    <div className="flex gap-6 items-start">
      <nav className="hidden lg:block w-48 shrink-0 sticky top-6 bg-portal-panel border border-portal-border rounded-lg p-3 text-sm">
        <a href="#overview" className="block px-2 py-1.5 font-semibold text-portal-navy">Driver score</a>
        {influences.map((i) => (
          <a key={i.id} href={`#${i.id}`} className="block px-2 py-1.5 text-portal-muted hover:text-portal-navy">{i.name}</a>
        ))}
      </nav>
      <div className="flex-1 space-y-6 min-w-0">
        <Section id="overview" title="How it works">
          <h3 className="font-semibold text-portal-navy mb-1">What it is</h3>
          <p className="text-sm text-portal-muted mb-2">The Driver Score provides an indication of driving risk based on several aspects of a driver's journey. Mobile use, Smooth driving, Speed, Time of day and Time on task each contribute to the overall score.</p>
          <p className="text-sm text-portal-muted mb-4">The score brings these different factors together to provide an overall view of the characteristics of a journey that may be associated with greater or lower driving risk.</p>
          <h3 className="font-semibold text-portal-navy mb-1">What it is not</h3>
          <p className="text-sm text-portal-muted mb-2">The Driver Score is not a measure of whether a driver has followed the law or whether a particular behaviour is legal. A behaviour can be legally permitted and still influence the score if it is considered relevant to driving risk.</p>
          <p className="text-sm text-portal-muted">The score is also not a definitive judgement of how safe a driver is. It is an indication of risk based on the specific driving and journey characteristics considered by the scoring model.</p>
        </Section>

        <Section title="Driver score influences">
          <p className="text-sm text-portal-muted bg-portal-surface border border-portal-border rounded-md p-3 mb-4">
            <strong className="text-portal-navy">Note:</strong> Scoring information shown here is intended to explain the key factors that influence the score. The exact scoring algorithm and thresholds are not disclosed to protect the integrity of the scoring model.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {influences.map((i) => (
              <div key={i.id} id={i.id} className="border border-portal-border rounded-md p-4 scroll-mt-6">
                <h3 className="font-bold text-portal-navy mb-1">{i.name}</h3>
                <p className="text-sm text-portal-muted">{i.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Relative influence on the overall Driver score">
          <p className="text-sm text-portal-muted mb-4">The chart below shows the relative influence of each Driver Score influence on the overall Driver Score. Influences with a greater weighting contribute more than those with a lower weighting.</p>
          <div className="space-y-3">
            {[...influences].sort((a, b) => b.weight - a.weight).map((i) => (
              <div key={i.id} className="grid grid-cols-[8rem_1fr_9rem] gap-3 items-center text-sm">
                <span className="font-medium text-portal-navy">{i.name}</span>
                <div className="h-3 rounded-full bg-portal-surface border border-portal-border overflow-hidden">
                  <div className="h-full bg-portal-navy" style={{ width: `${i.weight * 20}%` }} />
                </div>
                <span className="text-portal-muted" title={i.note}>{i.level}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section title="What influences the Driver score?">
          <p className="text-sm text-portal-muted mb-4">Not every aspect of a journey will influence the Driver Score. These common situations explain what is and isn't considered when calculating the overall score.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-portal-navy border-b border-portal-border">
                  <th className="py-2 pr-3">Driver situation</th><th className="py-2 pr-3">Influences score?</th><th className="py-2 pr-3">What this means</th><th className="py-2">How to avoid influencing the score</th>
                </tr>
              </thead>
              <tbody>
                {situations.map(([s, m, a]) => (
                  <tr key={s} className="border-b border-portal-border align-top">
                    <td className="py-2 pr-3 font-medium text-portal-navy">{s}</td>
                    <td className="py-2 pr-3"><span className="px-2 py-0.5 rounded bg-portal-surface border border-portal-border text-portal-navy">Yes</span></td>
                    <td className="py-2 pr-3 text-portal-muted">{m}</td>
                    <td className="py-2 text-portal-muted">{a}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        <Section title="Example scenarios">
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {scenarios.map(([t, d, r], idx) => (
              <div key={t} className="border border-portal-border rounded-md p-4">
                <div className="text-xs font-semibold text-portal-muted mb-1">SCENARIO #{idx + 1}</div>
                <h3 className="font-bold text-portal-navy mb-2">{t}</h3>
                <p className="text-sm text-portal-muted mb-3">{d}</p>
                <p className="text-sm"><strong className="text-portal-navy">Result: </strong><span className="text-portal-muted">{r}</span></p>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  </AdminLayout>
);

export default DriverScorePage;
