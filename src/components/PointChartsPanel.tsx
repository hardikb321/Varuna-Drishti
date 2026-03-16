"use client";

import { useEffect, useMemo, useRef } from "react";
import Chart from "chart.js/auto";

export function PointChartsPanel({
  availableYears,
  year,
  onYearChange,
}: {
  availableYears: number[];
  year: number | null;
  onYearChange: (year: number) => void;
}) {
  const selectedYear = year ?? availableYears[0] ?? new Date().getFullYear();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  const monthLabels = useMemo(
    () => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    []
  );

  const wqiByMonth = useMemo(() => {
    // Deterministic-ish random data based on selected year so it doesn't change
    // on every re-render, only when the year changes.
    let seed = selectedYear * 9301 + 49297;
    const rand = () => {
      seed = (seed * 233280 + 49297) % 1000000;
      return seed / 1000000;
    };

    const values: number[] = [];
    for (let i = 0; i < 12; i++) {
      // WQI 0-100 with a small seasonal wave
      const seasonal = 10 * Math.sin((i / 12) * Math.PI * 2);
      const base = 60 + seasonal;
      const noise = (rand() - 0.5) * 20;
      values.push(Math.max(0, Math.min(100, Math.round(base + noise))));
    }
    return values;
  }, [selectedYear]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Recreate chart when year changes.
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    chartRef.current = new Chart(canvas, {
      type: "line",
      data: {
        labels: monthLabels,
        datasets: [
          {
            label: `WQI (${selectedYear})`,
            data: wqiByMonth,
            borderColor: "#3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.15)",
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.35,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "nearest", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            enabled: true,
            callbacks: {
              label: (ctx) => `WQI: ${ctx.parsed.y}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: "#a1a1aa" },
          },
          y: {
            min: 0,
            max: 100,
            ticks: { color: "#a1a1aa" },
            grid: { color: "rgba(161,161,170,0.15)" },
            title: {
              display: true,
              text: "WQI",
              color: "#a1a1aa",
            },
          },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [monthLabels, selectedYear, wqiByMonth]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-foreground">Year</p>
          <p className="text-xs text-muted-foreground">Month vs WQI (hover to see values)</p>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs text-muted-foreground">Select year</label>
        <select
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {availableYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-lg border border-border bg-muted/10 p-3">
        <div className="h-56 w-full">
          <canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
}

