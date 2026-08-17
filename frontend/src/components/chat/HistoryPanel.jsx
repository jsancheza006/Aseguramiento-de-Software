import { MessageSquare } from "lucide-react";
import Card from "../layout/Card";

function formatSessionDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString(undefined, {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function HistoryPanel({
  sessions = [],
  loadingSessions = false,
  activeSessionId,
  onSelectSession,
}) {
  return (
    <Card title="History">
      {loadingSessions ? (
        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
          Loading...
        </p>
      ) : sessions.length === 0 ? (
        <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>
          There aren't any saved conversations for this repository yet.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            gap: 4,
            overflowX: "auto",
          }}
        >
          {sessions.map((s) => {
            const id = s._id ?? s.session_id;
            const active = id === activeSessionId;
            return (
              <button
                key={id}
                onClick={() => onSelectSession(id)}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 8,
                  textAlign: "left",
                  padding: "8px 9px",
                  borderRadius: 8,
                  border: "none",
                  background: active ? "var(--secondary)" : "transparent",
                  cursor: "pointer",
                  flexShrink: 0,
                  width: 220,
                }}
              >
                <MessageSquare
                  size={12}
                  style={{
                    color: active ? "var(--primary)" : "var(--muted)",
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span
                    style={{
                      display: "block",
                      fontSize: 12,
                      color: active ? "var(--fg)" : "var(--muted)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s.title || "Conversación"}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: 10,
                      fontFamily: "var(--font-mono)",
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    {formatSessionDate(s.created_at)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}