import { useState, useCallback } from "react";

export interface ScanLine {
  id: number;
  text: string;
}

export interface LangEntry {
  name: string;
  pct: number;
}

export function useSSE() {
  const [lines, setLines]     = useState<ScanLine[]>([]);
  const [scanning, setScanning] = useState(false);
  const [done, setDone]       = useState(false);
  const [coords, setCoords]   = useState<[number, number][]>([]);
  const [langs, setLangs]     = useState<LangEntry[]>([]);

  const startScan = useCallback((target: string) => {
    setLines([]);
    setDone(false);
    setScanning(true);
    setCoords([]);
    setLangs([]);

    const es = new EventSource(
      `/api/scan?target=${encodeURIComponent(target)}`,
    );

    let counter = 0;

    es.onmessage = (event: MessageEvent) => {
      const text = event.data as string;

      if (text === "SCAN COMPLETE") {
        es.close();
        setScanning(false);
        setDone(true);
        return;
      }

      // Geo coordinates — accumulate multiple markers
      if (text.startsWith("[geo]")) {
        const [lat, lon] = text.replace("[geo]", "").trim().split(",").map(Number);
        setCoords((prev) => [...prev, [lon, lat]]);
        return;
      }

      // GitHub language distribution
      if (text.startsWith("[github:langs]")) {
        const raw = text.replace("[github:langs]", "").trim();
        const parsed = raw.split("|").map((item) => {
          const [name, pct] = item.split(":");
          return { name, pct: parseInt(pct) };
        });
        setLangs(parsed);
        return;
      }

      setLines((prev) => [...prev, { id: counter++, text }]);
    };

    es.onerror = () => {
      es.close();
      setScanning(false);
      setLines((prev) => [...prev, { id: counter++, text: "CONNECTION LOST" }]);
    };
  }, []);

  return { lines, scanning, done, startScan, coords, langs };
}
