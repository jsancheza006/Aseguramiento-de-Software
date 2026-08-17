import { useMemo, useState } from "react";
import { GitBranch, ShieldAlert, RefreshCw, Check, Search } from "lucide-react";
import Card from "../layout/Card";

const SEVERITY_COLORS = {
  critical: "var(--critical)",
  high: "var(--high)",
  medium: "var(--medium)",
  low: "var(--low)",
};

const REPO_LIST_MAX_HEIGHT = 240;

function severityCounts(vulns) {
  return vulns.reduce((acc, v) => {
    acc[v.severity] = (acc[v.severity] ?? 0) + 1;
    return acc;
  }, {});
}

export default function ContextPanel({
  scans,
  selectedScanId,
  onSelectScan,
  vulnerabilities,
  loadingScans,
  loadingVulns,
  onNewChat,
}) {
  const [repoQuery, setRepoQuery] = useState("");

  const counts = severityCounts(vulnerabilities);
  const total = vulnerabilities.length;
  const selectedScan = scans.find(
    (s) => (s._id ?? s.scan_id) === selectedScanId,
  );

  const filteredScans = useMemo(() => {
    const q = repoQuery.trim().toLowerCase();
    if (!q) return scans;
    return scans.filter((s) =>
      (s.repo_name ?? s.name ?? "").toLowerCase().includes(q),
    );
  }, [scans, repoQuery]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        width: 280,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "12px 14px",
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: "var(--muted)",
            margin: "0 0 8px",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          Active repository
        </p>

        {loadingScans ? (
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
            Cargando...
          </p>
        ) : !selectedScan ? (
          <p
            style={{
              fontSize: 12,
              color: "var(--muted)",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Choose a repository below to start chatting about your findings.
          </p>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                background:
                  "color-mix(in srgb, var(--primary) 14%, var(--card))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <GitBranch size={14} style={{ color: "var(--primary)" }} />
            </div>
            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "var(--font-mono)",
                color: "var(--fg)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selectedScan.repo_name ?? selectedScan.name}
            </span>
          </div>
        )}
      </div>

      {selectedScanId && !loadingVulns && total > 0 && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            padding: "12px 14px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: "var(--fg)",
              marginBottom: 8,
            }}
          >
            <ShieldAlert size={13} style={{ color: "var(--primary)" }} />
            {total} finding{total !== 1 ? "s" : ""} as context
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(counts).map(([sev, n]) => (
              <span
                key={sev}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  color: "var(--fg)",
                  background: "var(--secondary)",
                  borderRadius: 999,
                  padding: "3px 9px",
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: SEVERITY_COLORS[sev] ?? "var(--muted)",
                  }}
                />
                {n} {sev}
              </span>
            ))}
          </div>
        </div>
      )}

      <Card title="Choose repository">
        {loadingScans ? (
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
            Loading scans...
          </p>
        ) : scans.length === 0 ? (
          <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
            No scans yet. Run one first.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scans.length > 6 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid var(--border)",
                }}
              >
                <Search size={12} style={{ color: "var(--muted)", flexShrink: 0 }} />
                <input
                  value={repoQuery}
                  onChange={(e) => setRepoQuery(e.target.value)}
                  placeholder="Filter repositories..."
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: 12,
                    color: "var(--fg)",
                    fontFamily: "var(--font-mono)",
                  }}
                />
              </div>
            )}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                maxHeight: REPO_LIST_MAX_HEIGHT,
                overflowY: "auto",
              }}
            >
              {filteredScans.length === 0 ? (
                <p style={{ fontSize: 12, color: "var(--muted)", margin: "4px 2px" }}>
                  No repositories match "{repoQuery}"
                </p>
              ) : (
                filteredScans.map((s) => {
                  const id = s._id ?? s.scan_id;
                  const active = id === selectedScanId;
                  return (
                    <button
                      key={id}
                      onClick={() => onSelectScan(id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        textAlign: "left",
                        padding: "8px 9px",
                        borderRadius: 8,
                        border: "none",
                        background: active ? "var(--secondary)" : "transparent",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <GitBranch
                        size={12}
                        style={{ color: "var(--muted)", flexShrink: 0 }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 12,
                          fontFamily: "var(--font-mono)",
                          color: active ? "var(--fg)" : "var(--muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {s.repo_name ?? s.name ?? "scan sin nombre"}
                      </span>
                      {active && (
                        <Check
                          size={13}
                          style={{ color: "var(--primary)", flexShrink: 0 }}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Card>

      {selectedScanId && (
        <button
          onClick={onNewChat}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 12,
            color: "var(--muted)",
            background: "transparent",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 10px",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={12} /> New chat
        </button>
      )}
    </div>
  );
}