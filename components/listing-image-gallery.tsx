"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

function normalizeImages(images: any): string[] {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images
      .map((x) => (typeof x === "string" ? x : ""))
      .filter(Boolean);
  }
  if (typeof images === "string") return [images];

  try {
    const parsed = typeof images === "string" ? JSON.parse(images) : images;
    if (Array.isArray(parsed)) return parsed.filter(Boolean);
  } catch {}

  return [];
}

export default function ListingImageGallery(props: { images: any; title?: string }) {
  const imgs = useMemo(() => normalizeImages(props.images), [props.images]);
  const title = (props.title || "Listing").trim();

  const scroller = useRef<HTMLDivElement | null>(null);
  const [idx, setIdx] = useState(0);

  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartLeft = useRef(0);

  const isMulti = imgs.length > 1;

  function clamp(i: number) {
    if (i < 0) return 0;
    if (i > imgs.length - 1) return imgs.length - 1;
    return i;
  }

  function go(i: number) {
    const el = scroller.current;
    if (!el) return;

    const next = clamp(i);
    const w = el.clientWidth || 1;
    el.scrollTo({ left: next * w, behavior: "smooth" });
    setIdx(next);
  }

  function prev() {
    go(idx - 1);
  }

  function next() {
    go(idx + 1);
  }

  function onMouseDown(e: React.MouseEvent<HTMLDivElement>) {
    const el = scroller.current;
    if (!el || !isMulti) return;
    dragging.current = true;
    dragStartX.current = e.clientX;
    dragStartLeft.current = el.scrollLeft;
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = scroller.current;
    if (!el || !dragging.current || !isMulti) return;
    const dx = e.clientX - dragStartX.current;
    el.scrollLeft = dragStartLeft.current - dx;
  }

  function endDrag() {
    dragging.current = false;
  }
  // Keep idx synced when user swipes / scrolls
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = el.clientWidth || 1;
        const nextIdx = clamp(Math.round(el.scrollLeft / w));
        setIdx(nextIdx);
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll as any);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgs.length]);

  if (!imgs.length) {
    return (
      <div className="w-full">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
          No photos
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div
          ref={scroller}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          className="flex w-full overflow-x-auto scroll-smooth snap-x snap-mandatory select-none"
          style={{ scrollbarWidth: "none" as any, userSelect: "none", WebkitUserSelect: "none", WebkitUserDrag: "none", cursor: isMulti ? (dragging.current ? "grabbing" : "grab") : "default" } as any }
        >
          {imgs.map((src, i) => (
            <div key={i} className="relative w-full flex-shrink-0 snap-start">
              <div className="relative h-[260px] w-full md:h-[420px]">
                <Image
                  src={src}
                  alt={title}
                  fill
                  sizes="100vw"
                  className="object-cover select-none"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  unoptimized
                />
              </div>

              <div className="absolute bottom-3 right-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white">
                {i + 1}/{imgs.length}
              </div>
            </div>
          ))}
        </div>

        {/* Arrows: solid white background (NOT transparent) */}
        {isMulti && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-2 top-1/2 z-50 -translate-y-1/2 flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-white text-black shadow-sm border border-black/20"
              style={{ backgroundColor: "#ffffff", opacity: 1 } as any }
              aria-label="Previous photo"
            >
              <span className="text-[20px] leading-none">‹</span>
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-2 top-1/2 z-50 -translate-y-1/2 flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-full bg-white text-black shadow-sm border border-black/20"
              style={{ backgroundColor: "#ffffff", opacity: 1 } as any }
              aria-label="Next photo"
            >
              <span className="text-[20px] leading-none">›</span>
            </button>
          </>
        )}
      </div>

      {/* Dots: leave them alone */}
      {isMulti && (
        <div className="mt-3 flex items-center justify-center gap-2">
          {imgs.map((_, i) => {
            const active = i === clamp(idx);
            return (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`View photo ${i + 1}`}
                className="rounded-full border border-gray-300"
                style={{
                  width: active ? 12 : 10,
                  height: active ? 12 : 10,
                  backgroundColor: active ? "#1DA1F2" : "#9CA3AF",
                  boxShadow: active ? "0 0 0 2px rgba(209,213,219,0.95)" : "none",
                  transition: "all 120ms ease",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
