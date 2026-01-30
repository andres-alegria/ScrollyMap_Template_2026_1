import React, { useEffect, useMemo, useRef } from "react";

import "./GalleryFlipImage.css";

// GalleryFlipImage stage
//
// Adapted from the CodePen effect (mousewheel-driven horizontal gallery + CSS flip cards)
// https://codepen.io/piupiupiu/pen/YyxWpd
//
// Notes for scrolly integration:
// - We DO NOT globally disable page scrolling (no `body { overflow:hidden }`).
// - We only intercept the wheel event *while the gallery can still scroll horizontally*.
//   If the gallery is already at the left/right edge, we let the wheel event propagate so
//   the scrolly can continue to the next/previous chapter.

export default function GalleryFlipImage(props = {}) {
  // Optional config (future-proof):
  // - items: [{ title, image, body, href }]
  // - cardWidth: number (px)
  // - scrollStep: number (px)
  const { items, cardWidth = 400, scrollStep, fillWidthWhenFew = true, fillWidthMaxItems = 3 } = props;

  const rootRef = useRef(null);
  const scrollerRef = useRef(null);

  const data = useMemo(() => {
    const arr = Array.isArray(items) ? items : [];
    // Normalize items defensively
    return arr.map((d) => {
      const title = d?.title ?? d?.name ?? "";
      const image = d?.image ?? d?.img ?? d?.src ?? "";
      const body = d?.body ?? d?.text ?? d?.description ?? "";
      const href = d?.href ?? d?.url ?? "";
      return { title, image, body, href };
    });}, [items]);

  useEffect(() => {
    const root = rootRef.current;
    const scroller = scrollerRef.current;
    if (!root || !scroller) return;


  // Vertical scroll only: do NOT hijack mouse wheel for horizontal scrolling.
  // If you ever want wheel-to-horizontal again, remove the return below.
  return;
    const step = Number.isFinite(scrollStep) ? Number(scrollStep) : cardWidth / 2;

    const onWheel = (e) => {
      // Only handle vertical wheel deltas; let trackpad horizontal pass through.
      const dy = e.deltaY;
      if (!dy) return;

      const max = scroller.scrollWidth - scroller.clientWidth;
      const atLeft = scroller.scrollLeft <= 0;
      const atRight = scroller.scrollLeft >= max - 1;

      // If we can scroll horizontally in the direction of the wheel, intercept it.
      if ((dy > 0 && !atRight) || (dy < 0 && !atLeft)) {
        e.preventDefault();
        const next = scroller.scrollLeft + (dy > 0 ? step : -step);
        scroller.scrollLeft = Math.max(0, Math.min(max, next));
      }
      // else: let it bubble so the scrolly can move to the next/prev chapter
    };

    // We must set passive:false so we can call preventDefault.
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [cardWidth, scrollStep]);
  const isShort = fillWidthWhenFew && data.length > 0 && data.length <= fillWidthMaxItems;

  if (!data.length) {
    return (
      <div className="stage-flip-gallery">
        <div className="flip-gallery-empty">
          <p><strong>GalleryFlipImage:</strong> No items provided in config.js.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="stage-flip-gallery" ref={rootRef}>
      <div className={`flip-gallery-container${isShort ? " is-short" : ""}`} ref={scrollerRef}>
        <ul className={`flip-gallery${isShort ? " is-short" : ""}`} style={{ "--cardWidth": `${cardWidth}px` }}>
          {data.map((d, idx) => (
            <li key={`${d.title}-${idx}`} className="flip-gallery-item">
              <div className="flip">
                <div
                  className="front-side"
                  style={{ backgroundImage: `url(${d.image})` }}
                  role="img"
                  aria-label={d.title}
                />
                <div className="back-side">
                  <a href={d.href} onClick={(ev) => d.href === "#" && ev.preventDefault()}>
                    <div className="content">
<div className="text">
                        <h3>{d.title}</h3>
                        <p>{d.body}</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
