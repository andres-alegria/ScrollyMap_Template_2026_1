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

const DEFAULT_ITEMS = [
  {
    title: "Xiang Yang Hong 01",
    image:
      "https://images.marinetraffic.com/collection/2946734.webp?size=800",
    body:
      "Placeholder text. Replace this with the description you want on the back side of the card.",
  },
  {
    title: "Da Yang Hao",
    image:
      "https://images.marinetraffic.com/collection/5045822.webp?size=800",
    body:
      "Placeholder text. Replace this with the description you want on the back side of the card.",
  },
  {
    title: "Da Yang Yi Hao",
    image:
      "https://images.marinetraffic.com/collection/1521684.webp?size=800",
    body:
      "Placeholder text. Replace this with the description you want on the back side of the card.",
  },
  {
    title: "Shen Hai Yi Hao",
    image:
      "https://images.marinetraffic.com/collection/6161085.webp?size=800",
    body:
      "Placeholder text. Replace this with the description you want on the back side of the card.",
  },
  {
    title: "Hai Yang Di Zhi Liu Hao",
    image:
      "https://images.marinetraffic.com/collection/1025626.webp?size=800",
    body:
      "Placeholder text. Replace this with the description you want on the back side of the card.",
  },
];

export default function GalleryFlipImage(props = {}) {
  // Optional config (future-proof):
  // - items: [{ title, image, body, href }]
  // - cardWidth: number (px)
  // - scrollStep: number (px)
  const { items, cardWidth = 400, scrollStep } = props;

  const rootRef = useRef(null);
  const scrollerRef = useRef(null);

  const data = useMemo(() => {
    const arr = Array.isArray(items) && items.length ? items : DEFAULT_ITEMS;
    // Normalize items defensively
    return arr
      .map((d) => ({
        title: d?.title ?? "",
        image: d?.image ?? "",
        body: d?.body ?? "",
        href: d?.href ?? "#",
      }))
      .filter((d) => d.image);
  }, [items]);

  useEffect(() => {
    const root = rootRef.current;
    const scroller = scrollerRef.current;
    if (!root || !scroller) return;

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

  return (
    <div className="stage-flip-gallery" ref={rootRef}>
      <div className="flip-gallery-container" ref={scrollerRef}>
        <ul className="flip-gallery" style={{ "--cardWidth": `${cardWidth}px` }}>
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
                      <div className="loader" aria-hidden="true" />
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
