"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  const [isDragging, setIsDragging] = useState(false);

  const dragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartLeft = useRef(0);

  const isMulti = imgs.length > 1;

  const clamp = useCallback((i: number) => {
    if (i < 0) return 0;
    if (i > imgs.length - 1) return imgs.length - 1;
    return i;
  }, [imgs.length]);

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
    setIsDragging(true);
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
    setIsDragging(false);
  }

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
      el.removeEventListener("scroll", onScroll as EventListener);
    };
  }, [imgs.length, clamp]);

  if (!imgs.length) {
    return (
      <div className="w-full">
        <div className="overflow-hidden rounded-[28px] border border-black/10 bg-gradient-to-br from-neutral-50 to-neutral-100 shadow-sm">
          <div className="flex h-[260px] items-center justify-center px-6 text-center md:h-[420px]">
            <div className="max-w-sm">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-black/10 bg-white text-sm font-semibold text-neutral-800 shadow-sm">
                Photo
              </div>
              <div className="text-lg font-semibold text-neutral-900">No gallery photos yet</div>
              <div className="mt-1 text-sm text-neutral-600">
                This seller has not added gallery images yet. Review the description and message the seller if you need more detail.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-sm">
        <div
          ref={scroller}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          className="flex w-full overflow-x-auto scroll-smooth snap-x snap-mandatory select-none bg-neutral-100"
          style={{
            scrollbarWidth: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitUserDrag: "none",
            cursor: isMulti ? (isDragging ? "grabbing" : "grab") : "default"
          } as React.CSSProperties}
        >
          {imgs.map((src, i) => (
            <div key={i} className="relative w-full flex-shrink-0 snap-start">
              <div className="relative h-[280px] w-full bg-[#F1F5F9] sm:h-[360px] md:h-[440px] xl:h-[480px]">
                <Image
                  src={src}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 900px"
                  className="object-contain select-none"
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  unoptimized
                />

                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/35 to-transparent" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />

                <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 sm:left-4 sm:top-4">
                  <span className="rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-neutral-900 shadow-sm ring-1 ring-black/5">
                    Gallery
                  </span>
                  {isMulti ? (
                    <span className="rounded-full bg-black/75 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm ring-1 ring-white/20">
                      {idx + 1} of {imgs.length}
                    </span>
                  ) : null}
                </div>

                <div className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/75 px-3 py-1.5 text-xs font-extrabold text-white shadow-sm ring-1 ring-white/20 sm:bottom-4 sm:right-4">
                  Photo {i + 1} / {imgs.length}
                </div>
              </div>
            </div>
          ))}
        </div>

        {isMulti ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 z-50 flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white text-black shadow-xl backdrop-blur transition hover:scale-[1.03] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] sm:left-4 sm:min-h-14 sm:min-w-14"
              aria-label="Previous photo"
            >
              <span className="text-[28px] leading-none sm:text-[32px]">&lsaquo;</span>
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-50 flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-white text-black shadow-xl backdrop-blur transition hover:scale-[1.03] hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] sm:right-4 sm:min-h-14 sm:min-w-14"
              aria-label="Next photo"
            >
              <span className="text-[28px] leading-none sm:text-[32px]">&rsaquo;</span>
            </button>
          </>
        ) : null}
      </div>

      {isMulti ? (
        <div className="mt-3 flex items-center justify-center gap-2 overflow-x-auto px-1 pb-1">
          {imgs.map((src, i) => {
            const active = i === clamp(idx);
            return (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`View photo ${i + 1}`}
                className={active ? "relative h-14 w-16 flex-none overflow-hidden rounded-xl border-2 border-[#0F172A] bg-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]" : "relative h-14 w-16 flex-none overflow-hidden rounded-xl border border-[#CBD5E1] bg-white opacity-75 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"}
              >
                <Image
                  src={src}
                  alt={`${title} photo ${i + 1}`}
                  fill
                  sizes="64px"
                  className="object-cover"
                  draggable={false}
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
