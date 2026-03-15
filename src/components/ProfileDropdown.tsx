"use client";

import { useState, useRef, useEffect } from "react";
import { User, X, History, Mail, Phone, Award as IdCard, ArrowLeft } from "lucide-react";
import type { Session } from "./MyMap";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  userId: string;
}

interface ProfileDropdownProps {
  user: UserProfile;
  history: Session[];
  onHistoryItemClick?: (markerId: string) => void;
}

export function ProfileDropdown({
  user,
  history,
  onHistoryItemClick,
  onRejectedSessionClick,
  isProcessingSubmit,
}: ProfileDropdownProps & {
  onRejectedSessionClick?: (sessionId: string) => void;
  isProcessingSubmit?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  type ViewMode = "sessions" | "sessionDetail" | "lakeDetail";
  const [viewMode, setViewMode] = useState<ViewMode>("sessions");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedLakeId, setSelectedLakeId] = useState<string | null>(null);
  const PAGE_SIZE = 10;
  const [sessionPage, setSessionPage] = useState(0);
  const [lakePage, setLakePage] = useState(0);
  const [pointPage, setPointPage] = useState(0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Whenever the dropdown closes, reset the history view back to sessions.
  useEffect(() => {
    if (!isOpen) {
      setViewMode("sessions");
      setSelectedSession(null);
      setSelectedLakeId(null);
      setSessionPage(0);
      setLakePage(0);
      setPointPage(0);
    }
  }, [isOpen]);

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-muted hover:bg-muted/80 transition-colors cursor-pointer"
        aria-label="Profile"
      >
        <User className="h-5 w-5 text-foreground" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
            <h3 className="font-semibold text-lg">Profile</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-muted rounded-full transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* User Details */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-sm text-muted-foreground">Water Quality Analyst</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{user.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <IdCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">ID: {user.userId}</span>
              </div>
            </div>
          </div>

          {/* History Section */}
          <div className="p-4">
            {/* Header with optional back button */}
            <div className="flex items-center gap-2 mb-3">
              {viewMode !== "sessions" && (
                <button
                  type="button"
                  onClick={() => {
                    if (viewMode === "lakeDetail" && selectedSession) {
                      // go back to this session's lake list
                      setViewMode("sessionDetail");
                      setSelectedLakeId(null);
                    } else {
                      // go back to session list
                      setViewMode("sessions");
                      setSelectedSession(null);
                      setSelectedLakeId(null);
                    }
                  }}
                  className="p-1 rounded hover:bg-muted transition-colors"
                  aria-label="Back"
                >
                  <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                </button>
              )}

              <History className="h-4 w-4 text-muted-foreground" />
              {viewMode === "sessions" && (
                <>
                  <h4 className="font-medium text-sm">Input Sessions</h4>
                  <span className="text-xs text-muted-foreground">
                    ({history.length} sessions)
                  </span>
                </>
              )}
              {viewMode === "sessionDetail" && selectedSession && (
                <h4 className="font-medium text-sm">
                  Session • {formatDate(selectedSession.createdAt)}{" "}
                  {formatTime(selectedSession.createdAt)}
                </h4>
              )}
              {viewMode === "lakeDetail" && selectedLakeId && (
                <h4 className="font-medium text-sm">Lake • {selectedLakeId}</h4>
              )}
            </div>

            {/* Content based on view mode */}
            {viewMode === "sessions" && (
              <>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No sessions recorded yet
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {history
                      .slice(sessionPage * PAGE_SIZE, sessionPage * PAGE_SIZE + PAGE_SIZE)
                      .map((session) => {
                      const totalPoints = session.markers.length;
                      return (
                        <button
                          key={session.id}
                          type="button"
                          className="w-full text-left p-3 bg-muted/50 rounded-md text-xs space-y-1 hover:bg-muted transition-colors"
                          disabled={isProcessingSubmit && session.status === "rejected"}
                          onClick={() => {
                            if (session.status === "rejected" && onRejectedSessionClick) {
                              if (isProcessingSubmit) return;
                              onRejectedSessionClick(session.id);
                              setIsOpen(false);
                              return;
                            }
                            setSelectedSession(session);
                            setSelectedLakeId(null);
                            setViewMode("sessionDetail");
                            setLakePage(0);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              Session • {formatDate(session.createdAt)}{" "}
                              {formatTime(session.createdAt)}
                            </span>
                            <span
                              className={`ml-2 text-[11px] font-medium ${
                                session.status === "rejected"
                                  ? "text-red-500"
                                  : "text-emerald-500"
                              }`}
                            >
                              {session.status === "rejected" ? "Rejected" : "Accepted"}
                            </span>
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {totalPoints} point{totalPoints !== 1 ? "s" : ""} submitted
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {history.length > PAGE_SIZE && (
                  <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
                    <button
                      type="button"
                      disabled={sessionPage === 0}
                      onClick={() => setSessionPage((p) => Math.max(0, p - 1))}
                      className="px-2 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                    >
                      Prev
                    </button>
                    <span>
                      Page {sessionPage + 1} of {Math.ceil(history.length / PAGE_SIZE)}
                    </span>
                    <button
                      type="button"
                      disabled={(sessionPage + 1) * PAGE_SIZE >= history.length}
                      onClick={() =>
                        setSessionPage((p) =>
                          (p + 1) * PAGE_SIZE >= history.length ? p : p + 1
                        )
                      }
                      className="px-2 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}

            {viewMode === "sessionDetail" && selectedSession && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {(() => {
                  const lakesMap = new Map<string, typeof selectedSession.markers>();
                  selectedSession.markers.forEach((m) => {
                    if (!m.lakeId) return;
                    if (!lakesMap.has(m.lakeId)) {
                      lakesMap.set(m.lakeId, []);
                    }
                    lakesMap.get(m.lakeId)!.push(m);
                  });

                  if (lakesMap.size === 0) {
                    return (
                      <p className="text-[11px] text-muted-foreground">
                        No lake_id associated with points in this session.
                      </p>
                    );
                  }

                  const lakeEntries = Array.from(lakesMap.entries());
                  const pagedLakes = lakeEntries.slice(
                    lakePage * PAGE_SIZE,
                    lakePage * PAGE_SIZE + PAGE_SIZE
                  );

                  return (
                    <>
                      {pagedLakes.map(([lakeId, markers]) => (
                        <button
                          key={lakeId}
                          type="button"
                          className="w-full text-left px-3 py-2 rounded-md bg-muted/40 hover:bg-muted text-xs"
                          onClick={() => {
                            setSelectedLakeId(lakeId);
                            setViewMode("lakeDetail");
                            setPointPage(0);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">lake_id: {lakeId}</span>
                            <span className="text-[11px] text-muted-foreground">
                              {markers.length} point{markers.length !== 1 ? "s" : ""} in this
                              session
                            </span>
                          </div>
                        </button>
                      ))}
                      {lakeEntries.length > PAGE_SIZE && (
                        <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
                          <button
                            type="button"
                            disabled={lakePage === 0}
                            onClick={() => setLakePage((p) => Math.max(0, p - 1))}
                            className="px-2 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                          >
                            Prev
                          </button>
                          <span>
                            Page {lakePage + 1} of{" "}
                            {Math.ceil(lakeEntries.length / PAGE_SIZE)}
                          </span>
                          <button
                            type="button"
                            disabled={(lakePage + 1) * PAGE_SIZE >= lakeEntries.length}
                            onClick={() =>
                              setLakePage((p) =>
                                (p + 1) * PAGE_SIZE >= lakeEntries.length ? p : p + 1
                              )
                            }
                            className="px-2 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            )}

            {viewMode === "lakeDetail" && selectedSession && selectedLakeId && (
              <div className="max-h-60 overflow-y-auto space-y-2">
                {selectedSession.markers
                  .filter((m) => m.lakeId === selectedLakeId)
                  .slice(pointPage * PAGE_SIZE, pointPage * PAGE_SIZE + PAGE_SIZE)
                  .map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      className="w-full text-left p-3 bg-muted/50 rounded-md text-xs space-y-1 hover:bg-muted transition-colors"
                      onClick={() => {
                        if (onHistoryItemClick) {
                          onHistoryItemClick(entry.id);
                          setIsOpen(false);
                        }
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {entry.latitude.toFixed(4)}, {entry.longitude.toFixed(4)}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(entry.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-muted-foreground">
                        <span>
                          pH: {entry.ph} | Turb: {entry.turbidity} NTU
                        </span>
                        <span>{formatTime(entry.timestamp)}</span>
                      </div>
                      <div className="text-muted-foreground">
                        Temp: {entry.temperature}°C | BOD: {entry.bod} mg/L
                        {entry.conductivity !== undefined && ` | Cond: ${entry.conductivity}`}
                        {entry.aod !== undefined && ` | AOD: ${entry.aod}`}
                      </div>
                    </button>
                  ))}
                {selectedSession.markers.filter((m) => m.lakeId === selectedLakeId).length >
                  PAGE_SIZE && (
                  <div className="flex items-center justify-between mt-3 text-[11px] text-muted-foreground">
                    <button
                      type="button"
                      disabled={pointPage === 0}
                      onClick={() => setPointPage((p) => Math.max(0, p - 1))}
                      className="px-2 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                    >
                      Prev
                    </button>
                    <span>
                      Page {pointPage + 1} of{" "}
                      {Math.ceil(
                        selectedSession.markers.filter(
                          (m) => m.lakeId === selectedLakeId
                        ).length / PAGE_SIZE
                      )}
                    </span>
                    <button
                      type="button"
                      disabled={
                        (pointPage + 1) * PAGE_SIZE >=
                        selectedSession.markers.filter(
                          (m) => m.lakeId === selectedLakeId
                        ).length
                      }
                      onClick={() =>
                        setPointPage((p) => {
                          const total = selectedSession.markers.filter(
                            (m) => m.lakeId === selectedLakeId
                          ).length;
                          return (p + 1) * PAGE_SIZE >= total ? p : p + 1;
                        })
                      }
                      className="px-2 py-1 rounded border border-border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
