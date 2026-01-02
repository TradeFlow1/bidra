"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type Img = { url: string };

function looksLikeImageUrl(u: string): boolean {
  if (!u) return false;
  const s = String(u).trim().toLowerCase();

  if (s.includes("/sell/edit/")) return false;
  if (s.startsWith("javascript:")) return false;

  if (s.startsWith("data:image/")) return true;
  if (s.startsWith("blob:")) return true;
  if (s.startsWith("/")) return true;

  if (s.startsWith("http://") || s.startsWith("https://")) {
    if (/\.(png|jpg|jpeg|webp|gif|avif)(\?|#|$)/i.test(s)) return true;
    if (/(\?|&)(w|width|h|height|format)=/i.test(s)) return true;
    if (/public\.blob\.vercel-storage\.com/i.test(s)) return true;
  }

  return false;
}

function normalizeImages(images: any): Img[] {
  if (!images) return [];
  const arr = Array.isArray(images)
    ? images
    : Array.isArray(images?.images)
      ? images.images
      : [];

  const out: Img[] = [];
  for (const it of arr) {
    if (!it) continue;
    let url = "";
    if (typeof it === "string") url = it;
    else if (typeof it?.url === "string") url = it.url;
    else if (typeof it?.src === "string") url = it.src;
    else if (typeof it?.path === "string") url = it.path;

    if (!url) continue;
    if (!looksLikeImageUrl(url)) continue;
    out.push({ url });
  }

  const seen = new Set<string>();
  return out.filter((x) => {
    if (!x.url) return false;
    if (seen.has(x.url)) return false;
    seen.add(x.url);
    return true;
  });
}

export default function ListingThumbCarousel(props: { images: any; title: string }) {
  const imgs = useMemo(() => normalizeImages(props.images), [props.images]);
  const scroller = useRef<HTMLDivElement | null>(null);
  const [idx, setIdx] = useState(0);

  const drag = useRef<{ down: boolean; startX: number; startLeft: number } | null>(null);
  const moved = useRef(false); // <— key: suppress Link click only if user dragged
  const isMulti = imgs.length > 1;

  function clamp(i: number) {
    return Math.max(0, Math.min(imgs.length - 1, i));
  }

  function syncIndex() {
    const el = scroller.current;
    if (!el) return;
    const w = el.clientWidth || 1;
    setIdx(clamp(Math.round(el.scrollLeft / w)));
  }

  function scrollTo(i: number) {
    const el = scroller.current;
    if (!el) return;
    const next = clamp(i);
    const w = el.clientWidth || 1;
    el.scrollTo({ left: w * next, behavior: "smooth" });
    setIdx(next);
  }

  useEffect(() => {
    if (!isMulti) return;
    const el = scroller.current;
    if (!el) return;

    const onScroll = () => syncIndex();
    const onEnd = () => setTimeout(syncIndex, 80);

    el.addEventListener("scroll", onScroll, { passive: true } as any);
    el.addEventListener("touchend", onEnd, { passive: true } as any);
    el.addEventListener("mouseup", onEnd, { passive: true } as any);

    return () => {
      el.removeEventListener("scroll", onScroll as any);
      el.removeEventListener("touchend", onEnd as any);
      el.removeEventListener("mouseup", onEnd as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgs.length]);

  if (!imgs.length) {
    return (
      <div className="flex h-full w-full items-center justify-center text-xs text-neutral-500">
        No image
      </div>
    );
  }

  return (
    <div
      className="relative h-full w-full"
      // IMPORTANT: if user dragged, block the Link navigation click
      onClickCapture={(e) => {
        if (moved.current) {
          e.preventDefault();
          e.stopPropagation();
          moved.current = false;
        }
      }}
    >
      <div
        ref={scroller}
        className="flex h-full w-full overflow-x-auto snap-x snap-mandatory"
        style={{
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none" as any,
          msOverflowStyle: "none" as any,
          touchAction: "pan-y",
          cursor: "grab",
        }}
        onPointerDown={(e) => {
          const el = scroller.current;
          if (!el) return;
          (e as any).preventDefault?.();
          drag.current = { down: true, startX: e.clientX, startLeft: el.scrollLeft };
          moved.current = false;
          (e.currentTarget as any).setPointerCapture?.(e.pointerId);
        }}
        onPointerMove={(e) => {
          const el = scroller.current;
          const d = drag.current;
          if (!el || !d || !d.down) return;

          const dx = e.clientX - d.startX;
          if (Math.abs(dx) > 6) moved.current = true;

          el.scrollLeft = d.startLeft - dx;
        }}
        onPointerUp={() => {
          const d = drag.current;
          if (d) d.down = false;
          setTimeout(syncIndex, 50);
          // moved.current stays true until clickCapture runs (so it can suppress)
        }}
        onPointerCancel={() => {
          const d = drag.current;
          if (d) d.down = false;
          setTimeout(syncIndex, 50);
        }}
        onDragStart={(e) => e.preventDefault()}
      >
        {imgs.map((im, i) => (
          <div key={im.url + ":" + i} className="relative h-full w-full flex-none snap-center">
            <Image
              src={im.url}
              alt={props.title}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover select-none"
              draggable={false}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {isMulti && (
        <>
          <div className="absolute right-2 bottom-2 rounded-full bg-black/75 px-2 py-1 text-[10px] text-white shadow">
            {idx + 1}/{imgs.length}
          </div>

          {/* BIG, HIGH-CONTRAST ARROWS (desktop) */}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); moved.current = true; scrollTo(idx - 1); }}
            className="flex absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white text-black text-3xl shadow-xl ring-2 ring-black/30"
            aria-label="Prev photo"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black text-[34px] leading-none shadow-md ring-1 ring-black/20">‹</span>
          </button>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); moved.current = true; scrollTo(idx + 1); }}
            className="flex absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-white text-black text-3xl shadow-xl ring-2 ring-black/30"
            aria-label="Next photo"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black text-[34px] leading-none shadow-md ring-1 ring-black/20">›</span>
          </button>
        </>
      )}
    </div>
  );
}
