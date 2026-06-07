/** Calm inline toast, fixed lower-center. */
export function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div
      className="anim-up f-ui fixed left-1/2 z-[70]"
      style={{
        bottom: 88,
        transform: "translateX(-50%)",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow-float)",
        borderRadius: 6,
        padding: "10px 18px",
        fontSize: 13,
        color: "var(--text)",
      }}
    >
      {msg}
    </div>
  );
}
