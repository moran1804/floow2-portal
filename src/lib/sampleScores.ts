/** Illustrative per-driver scores until a live scoring source is connected. */
const NAMES: string[] = ["Mobile use", "Smooth driving", "Speed", "Time of day", "Time on task"];
function seed(id: string) { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
export function sampleDriverScores(id: string) {
  const s = seed(id);
  const influences = NAMES.map((name, i) => ({ name, score: 55 + ((s >>> (i * 3)) % 44) }));
  const overall = Math.round(influences.reduce((a, b) => a + b.score, 0) / influences.length);
  return { overall, influences };
}
export function averageScores(list: ReturnType<typeof sampleDriverScores>[]) {
  if (!list.length) return null;
  const influences = NAMES.map((name, i) => ({ name, score: Math.round(list.reduce((a, d) => a + d.influences[i].score, 0) / list.length) }));
  return { overall: Math.round(influences.reduce((a, b) => a + b.score, 0) / influences.length), influences };
}
