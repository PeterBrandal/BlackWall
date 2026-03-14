import { useState, useCallback } from "react";

export interface ScanLine {
  id: number;
  text: string;
}

export function useSSE() {
  const [lines, setLines] = useState<ScanLine[]>([]);
  const [scanning, setScanning] = useState(false);
  const [done, setDone] = useState(false);
  const [coords, setCoords] = useState<[number, number] | null>(null)


  const startScan = useCallback((target: string) => {
    setLines([]);
    setDone(false);
    setScanning(true);

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

      if (text.startsWith("[geo]")) {
        const [lat, lon] = text.replace("[geo]", "").trim().split(",").map(Number);
        setCoords([lon, lat]);
        return;
      } 

      setLines((prev) => [...prev, { id: counter++, text }]);
    };

    es.onerror = () => {
      // The connection dropped — could be network, could be server crash
      es.close();
      setScanning(false);
      setLines((prev) => [...prev, { id: counter++, text: "CONNECTION LOST" }]);
    };
  }, []);

return { lines, scanning, done, startScan, coords }

}

