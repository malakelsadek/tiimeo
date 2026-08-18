"use client";

import type { StatusedEvent } from "@/lib/types";
import type { FreeBlock } from "@/lib/schedule";
import type { BarStyle } from "@/lib/settings";
import { formatClock, formatCountdown, formatDuration } from "@/lib/time";
import { seriesVar } from "@/lib/palette";

interface Props {
  current: StatusedEvent[];
  next: StatusedEvent | null;
  freeBlock: FreeBlock | null;
  now: Date;
  colorIndexFor: (calendarId: string) => number;
  countdownFont: string;
  barStyle: BarStyle;
}

// Back-to-back events (next starts right as the current one ends) don't
// count as a gap — only a real break shows "Next: Free block".
const GAP_EPSILON_MS = 60_000;

// Fluid size (not a fixed text-6xl) so a long countdown like "1h 24m 03s"
// never overflows or wraps awkwardly on narrow phones, while still reaching
// the full display size on larger screens.
const COUNTDOWN_TEXT_CLASS = "text-[clamp(2.25rem,12vw,3.75rem)] font-semibold";

function CurrentBlock({
  event,
  now,
  colorIndex,
  countdownFont,
}: {
  event: StatusedEvent;
  now: Date;
  colorIndex: number;
  countdownFont: string;
}) {
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
        className={`mt-3 ${COUNTDOWN_TEXT_CLASS}`}
        style={{ color: "var(--clock-color)", fontVariantNumeric: "tabular-nums", fontFamily: countdownFont }}
      >
        {formatCountdown(remaining)}
      </p>
      <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
        until {formatClock(event.end)}
      </p>
    </div>
  );
}

// A smaller, nested countdown for an event that overlaps the primary one —
// keeps concurrent events grouped into a single timer instead of stacking
// several full-size blocks.
function MiniCurrentBlock({
  event,
  now,
  colorIndex,
  countdownFont,
}: {
  event: StatusedEvent;
  now: Date;
  colorIndex: number;
  countdownFont: string;
}) {
  const remaining = event.end.getTime() - now.getTime();
  const color = seriesVar(colorIndex);
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />
        <span className="truncate text-sm" style={{ color: "var(--text-secondary)" }}>
          {event.title}
        </span>
      </span>
      <span
        className="shrink-0 text-sm font-medium"
        style={{ color: "var(--clock-color)", fontVariantNumeric: "tabular-nums", fontFamily: countdownFont }}
      >
        {formatCountdown(remaining)}
      </span>
    </div>
  );
}

function FreeBlock({
  freeBlock,
  next,
  now,
  countdownFont,
}: {
  freeBlock: FreeBlock;
  next: StatusedEvent | null;
  now: Date;
  countdownFont: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.2em]" style={{ color: "var(--status-good)" }}>
        Free
      </p>
      {next ? (
        <>
          <p
            className={`mt-3 ${COUNTDOWN_TEXT_CLASS}`}
            style={{ color: "var(--clock-color)", fontVariantNumeric: "tabular-nums", fontFamily: countdownFont }}
          >
            {formatCountdown(freeBlock.end.getTime() - now.getTime())}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            until {formatClock(freeBlock.end)}
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

function ProgressBar({ fraction, style }: { fraction: number; style: BarStyle }) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const minimal = style === "minimal";
  return (
    <div
      className={`mx-auto mt-8 w-full max-w-xs overflow-hidden rounded-full ${minimal ? "h-1" : "h-1.5 border"}`}
      style={{
        background: minimal ? "transparent" : "var(--surface-1)",
        borderColor: minimal ? undefined : "color-mix(in srgb, var(--text-primary) 25%, transparent)",
      }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${clamped * 100}%`,
          background: "var(--bar-color)",
          boxShadow: style === "glow" ? "0 0 12px var(--bar-color)" : undefined,
          transition: "width 1s linear",
        }}
      />
    </div>
  );
}

export default function CountdownScreen({
  current,
  next,
  freeBlock,
  now,
  colorIndexFor,
  countdownFont,
  barStyle,
}: Props) {
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
  // filling up (0 → 1) as elapsed time approaches the block's end. Its color
  // is always the theme's bar color (not the event's category color) so it
  // reads as one consistent UI element.
  let barFraction: number | null = null;
  if (current.length > 0) {
    const primary = current[0];
    const total = primary.end.getTime() - primary.start.getTime();
    barFraction = total > 0 ? (now.getTime() - primary.start.getTime()) / total : 0;
  } else if (freeBlock && next) {
    const total = freeBlock.end.getTime() - freeBlock.start.getTime();
    barFraction = total > 0 ? (now.getTime() - freeBlock.start.getTime()) / total : 0;
  }

  return (
    <div className="text-center">
      {current.length > 0 ? (
        <div>
          <CurrentBlock
            event={current[0]}
            now={now}
            colorIndex={colorIndexFor(current[0].calendarId)}
            countdownFont={countdownFont}
          />
          {current.length > 1 ? (
            <div className="mx-auto mt-5 flex max-w-xs flex-col gap-2.5">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Also now
              </p>
              {current.slice(1).map((e) => (
                <MiniCurrentBlock
                  key={e.id}
                  event={e}
                  now={now}
                  colorIndex={colorIndexFor(e.calendarId)}
                  countdownFont={countdownFont}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : freeBlock ? (
        <FreeBlock freeBlock={freeBlock} next={next} now={now} countdownFont={countdownFont} />
      ) : null}

      {gapAfterCurrent && currentEnd ? (
        <NextFreeLine startsAt={currentEnd} endsAt={next ? next.start : null} now={now} />
      ) : next ? (
        <NextLine event={next} now={now} colorIndex={colorIndexFor(next.calendarId)} />
      ) : null}

      {barFraction !== null ? <ProgressBar fraction={barFraction} style={barStyle} /> : null}
    </div>
  );
}
