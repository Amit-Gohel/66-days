import { Icon } from "@/components/ui/Icon";

export function ComingSoon({ title, note }: { title: string; note?: string }) {
  return (
    <div
      className="anim-fade flex flex-col items-center justify-center text-center"
      style={{ minHeight: "70vh", padding: 24 }}
    >
      <Icon name="feather" size={28} style={{ color: "var(--text-3)", marginBottom: 12 }} />
      <h1 className="f-hand" style={{ fontSize: 26, color: "var(--text)", marginBottom: 6 }}>
        {title}
      </h1>
      <p className="f-serif" style={{ fontSize: 15, color: "var(--text-2)", maxWidth: "42ch", lineHeight: 1.6 }}>
        {note ?? "Coming soon."}
      </p>
    </div>
  );
}
