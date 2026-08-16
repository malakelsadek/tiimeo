"use client";

import type { StatusedEvent } from "@/lib/types";
import type { FreeBlock } from "@/lib/schedule";
import { formatClock, formatCountdown, formatDuration } from "@/lib/time";
import { seriesVar } from "@/lib/palette";

interface Props {
  current: StatusedEvent[];
  next: StatusedEvent | null;
  freeBlock: FreeBlock | null;
  now: Date;
  colorIndexFor: (calendarId: string) => number;
}

// Back-to-back events (next starts right as the current one ends) don't
// count as a gap — only a real break shows "Next: Free block".
const GAP_EPSILON_MS = 60_000;

function CurrentBlock({ event, now, colorIndex }: { event: StatusedEvent; now: Date; colorIndex: number }) {
  const remaining = event.end.getTime() - now.getTime();
  const color = seriesVar(colorIndex);
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color }}>
        Now
      </p>
      <p className="mt-2 text-xl font-medium" style={{ color: "var(--text-primary)" }}>
        {event.title}
      </p>
      <p
        className="mt-3 text-6xl font-semibold"
        style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}
      >
        {formatCountdown(remaining)}
      </p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        left · until {formatClock(event.end)}
      </p>
    </div>
  );
}

function FreeBlock({
  freeBlock,
  next,
  now,
}: {
  freeBlock: FreeBlock;
  next: StatusedEvent | null;
  now: Date;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--status-good)" }}>
        Free
      </p>
      {next ? (
        <>
          <p
            className="mt-3 text-6xl font-semibold"
            style={{ color: "var(--text-primary)", fontVariantNumeric: "tabular-nums" }}
          >
            {formatCountdown(freeBlock.end.getTime() - now.getTime())}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            left · until {formatClock(freeBlock.end)}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
          for the rest of the day
        </p>
      )}
    </div>
  );
}

function NextLine({ event, now, colorIndex }: { event: StatusedEvent; now: Date; colorIndex: number }) {
  const untilStart = event.start.getTime() - now.getTime();
  const duration = event.end.getTime() - event.start.getTime();
  const color = seriesVar(colorIndex);
  return (
    <p className="mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
      Next:{" "}
      <span style={{ color }}>{event.title}</span> in{" "}
      <span style={{ color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
        {formatCountdown(untilStart)}
      </span>{" "}
      · {formatDuration(duration)} long
    </p>
  );
}

function NextFreeLine({ startsAt, endsAt, now }: { startsAt: Date; endsAt: Date | null; now: Date }) {
  const untilStart = startsAt.getTime() - now.getTime();
  return (
    <p className="mt-8 text-sm" style={{ color: "var(--text-muted)" }}>
      Next: <span style={{ color: "var(--status-good)" }}>Free block</span> in{" "}
      <span style={{ color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
        {formatCountdown(untilStart)}
      </span>{" "}
      · {endsAt ? `${formatDuration(endsAt.getTime() - startsAt.getTime())} long` : "rest of the day"}
    </p>
  );
}

function ProgressBar({ fraction, color }: { fraction: number; color: string }) {
  const clamped = Math.max(0, Math.min(1, fraction));
  return (
    <div
      className="mx-auto mt-8 h-1.5 w-full max-w-xs overflow-hidden rounded-full"
      style={{ background: "var(--surface-1)" }}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${clamped * 100}%`, background: color, transition: "width 1s linear" }}
      />
    </div>
  );
}

export default function CountdownScreen({ current, next, freeBlock, now, colorIndexFor }: Props) {
  if (current.length === 0 && !next) {
    return (
      <p className="text-lg" style={{ color: "var(--text-muted)" }}>
        Nothing scheduled today
      </p>
    );
  }

  const currentEnd =
    current.length > 0 ? new Date(Math.max(...current.map((e) => e.end.getTime()))) : null;
  const gapAfterCurrent =
    currentEnd !== null &&
    (!next || next.start.getTime() - currentEnd.getTime() > GAP_EPSILON_MS);

  // The bar always tracks whichever countdown is the primary one above,
  // filling up (0 → 1) as elapsed time approaches the block's end.
  let barFraction: number | null = null;
  let barColor = "var(--text-primary)";
  if (current.length > 0) {
    const primary = current[0];
    const total = primary.end.getTime() - primary.start.getTime();
    barFraction = total > 0 ? (now.getTime() - primary.start.getTime()) / total : 0;
    barColor = seriesVar(colorIndexFor(primary.calendarId));
  } else if (freeBlock && next) {
    const total = freeBlock.end.getTime() - freeBlock.start.getTime();
    barFraction = total > 0 ? (now.getTime() - freeBlock.start.getTime()) / total : 0;
    barColor = "var(--status-good)";
  }

  return (
    <div className="text-center">
      {current.length > 0 ? (
        <div className="flex flex-col gap-8">
          {current.map((e) => (
            <CurrentBlock key={e.id} event={e} now={now} colorIndex={colorIndexFor(e.calendarId)} />
          ))}
        </div>
      ) : freeBlock ? (
        <FreeBlock freeBlock={freeBlock} next={next} now={now} />
      ) : null}

      {gapAfterCurrent && currentEnd ? (
        <NextFreeLine startsAt={currentEnd} endsAt={next ? next.start : null} now={now} />
      ) : next ? (
        <NextLine event={next} now={now} colorIndex={colorIndexFor(next.calendarId)} />
      ) : null}

      {barFraction !== null ? <ProgressBar fraction={barFraction} color={barColor} /> : null}
    </div>
  );
}
