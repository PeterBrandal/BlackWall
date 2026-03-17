import { useState, useCallback } from "react";

export type ProbeStatus = "idle" | "scanning" | "done" | "failed";

export interface ProbeState {
  status: ProbeStatus;
  lines: string[];
}

export interface ProfileData {
  name: string;
  emails: string[];
  probes: Record<string, ProbeState>;
  scanning: boolean;
  complete: boolean;
}

const INITIAL_PROBES: Record<string, ProbeState> = {
  github: { status: "idle", lines: [] },
  brreg:  { status: "idle", lines: [] },
  wayback: {status: "idle", lines: []},
};

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    emails: [],
    probes: INITIAL_PROBES,
    scanning: false,
    complete: false,
  });

  const startProfile = useCallback((name: string) => {
    setProfile({
      name,
      emails: [],
      probes: INITIAL_PROBES,
      scanning: true,
      complete: false,
    });

    const es = new EventSource(
      `/api/profile?name=${encodeURIComponent(name)}`
    );

    es.onmessage = (event: MessageEvent) => {
      const text = event.data as string;

      if (text === "PROFILE COMPLETE") {
        es.close();
        setProfile((prev) => ({ ...prev, scanning: false, complete: true }));
        return;
      }

      // Email permutations
      if (text.startsWith("[emails]")) {
        const emails = text.replace("[emails]", "").trim().split(", ");
        setProfile((prev) => ({ ...prev, emails }));
        return;
      }

      // Probe lifecycle events
      if (text.startsWith("[probe:start]")) {
        const probe = text.replace("[probe:start]", "").trim();
        setProfile((prev) => ({
          ...prev,
          probes: {
            ...prev.probes,
            [probe]: { ...prev.probes[probe], status: "scanning" },
          },
        }));
        return;
      }

      if (text.startsWith("[probe:done]")) {
        const probe = text.replace("[probe:done]", "").trim();
        setProfile((prev) => ({
          ...prev,
          probes: {
            ...prev.probes,
            [probe]: { ...prev.probes[probe], status: "done" },
          },
        }));
        return;
      }

      if (text.startsWith("[probe:fail]")) {
        const probe = text.replace("[probe:fail]", "").trim();
        setProfile((prev) => ({
          ...prev,
          probes: {
            ...prev.probes,
            [probe]: { ...prev.probes[probe], status: "failed" },
          },
        }));
        return;
      }

      // Probe data lines — route by prefix e.g. "[github]" or "[brreg]"
      const match = text.match(/^\[(\w+)\]/);
      if (match) {
        const probe = match[1];
        setProfile((prev) => {
          const existing = prev.probes[probe] ?? { status: "scanning", lines: [] };
          return {
            ...prev,
            probes: {
              ...prev.probes,
              [probe]: { ...existing, lines: [...existing.lines, text] },
            },
          };
        });
      }
    };

    es.onerror = () => {
      es.close();
      setProfile((prev) => ({ ...prev, scanning: false }));
    };
  }, []);

  return { profile, startProfile };
}
