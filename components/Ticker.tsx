/** Broadcast chyron — belt is doubled for a seamless loop. */
export default function Ticker({ items }: { items: string[] }) {
  const belt = [...items, ...items];
  return (
    <div className="chyron" aria-label="Coaxis Sports live ticker">
      <div className="chyron-tag">
        <span className="dot" />
        COAXIS WIRE
      </div>
      <div className="chyron-track">
        <div className="chyron-belt">
          {belt.map((item, i) => (
            <span
              key={i}
              className="item"
              aria-hidden={i >= items.length}
              // ticker strings are authored in lib/snapshot.ts / lib/wc.ts (trusted)
              dangerouslySetInnerHTML={{ __html: item }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
