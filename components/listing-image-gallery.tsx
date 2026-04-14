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
        <div className="overflow-hidden rounded-3xl border border-black/10 bg-gradient-to-br from-neutral-50 to-neutral-100">
          <div className="flex h-[260px] items-center justify-center px-6 text-center md:h-[420px]">
            <div className="max-w-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-black/10 bg-white text-xl shadow-sm">
                Photo
              </div>
              <div className="text-base font-semibold text-neutral-900">Photos coming soon</div>
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
      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm">
        <div
          ref={scroller}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endDrag}
          onMouseLeave={endDrag}
          className="flex w-full overflow-x-auto scroll-smooth snap-x snap-mandatory select-none bg-neutral-50"
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
              <div className="relative h-[280px] w-full md:h-[460px]">
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

              <div className="absolute bottom-3 right-3 rounded-full bg-black/75 px-2.5 py-1 text-xs font-medium text-white shadow-sm">
                {i + 1} / {imgs.length}
              </div>
            </div>
          ))}
        </div>

        {isMulti ? (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 z-50 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/95 text-black shadow-md backdrop-blur"
              aria-label="Previous photo"
            >
              <span className="text-[20px] leading-none">‹</span>
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 z-50 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/95 text-black shadow-md backdrop-blur"
              aria-label="Next photo"
            >
              <span className="text-[20px] leading-none">›</span>
            </button>
          </>
        ) : null}
      </div>

      {isMulti ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          {imgs.map((_, i) => {
            const active = i === clamp(idx);
            return (
              <button
                key={i}
                type="button"
                onClick={() => go(i)}
                aria-label={`View photo ${i + 1}`}
                className={active ? "h-2.5 w-6 rounded-full bg-neutral-900 transition-all" : "h-2.5 w-2.5 rounded-full bg-neutral-300 transition-all"}
              />
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
