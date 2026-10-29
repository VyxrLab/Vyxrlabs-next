import type { Product } from "@/lib/site";

/** Small, code-drawn product screens. Illustrative data only; swap for real screenshots any time. */
export default function ProductVisual({ slug }: { slug: Product["slug"] }) {
  if (slug === "blueswan") return <BlueSwanVisual />;
  if (slug === "dialer") return <DialerVisual />;
  if (slug === "swan-ai") return <SwanAIVisual />;
  return <WhatsAppVisual />;
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-sm rounded-2xl border border-line bg-ink/85 shadow-[0_30px_80px_-30px_rgb(0_0_0/0.9)] backdrop-blur">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="h-2 w-2 rounded-full bg-fg/20" />
        <span className="h-2 w-2 rounded-full bg-fg/20" />
        <span className="h-2 w-2 rounded-full bg-fg/20" />
        <span className="ml-2 text-xs text-muted">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function BlueSwanVisual() {
  return (
    <Frame title="GoHighLevel · Conversations">
      <div className="mb-4 flex gap-1.5 text-[11px]">
        {["SMS", "iMessage", "Email"].map((c) => (
          <span
            key={c}
            className={`rounded-full px-2.5 py-1 ${c === "iMessage" ? "bg-[#0a84ff] text-white" : "bg-fg/5 text-muted"}`}
          >
            {c}
          </span>
        ))}
      </div>
      <div className="space-y-2 text-sm">
        <p className="w-fit max-w-[80%] rounded-2xl rounded-bl-md bg-fg/10 px-3.5 py-2">Is the 3pm slot still open?</p>
        <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-[#0a84ff] px-3.5 py-2 text-white">
          Yes! You&apos;re booked for 3pm today.
        </p>
        <p className="text-right text-[11px] text-muted">Delivered</p>
      </div>
    </Frame>
  );
}

function DialerVisual() {
  return (
    <Frame title="Swan Power Dialer">
      <p className="text-xs text-muted">Contact 3 of 12</p>
      <p className="mt-1 text-lg">Daniel Ortiz</p>
      <p className="font-mono text-sm text-muted">+1 (555) 014-2231</p>
      <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Connected · 00:37
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {["Connected", "No answer", "Callback", "Not interested"].map((d, i) => (
          <span
            key={d}
            className={`rounded-lg border px-3 py-2 text-center ${i === 0 ? "border-emerald-400/60 bg-emerald-400/10 text-fg" : "border-line text-muted"}`}
          >
            {d}
          </span>
        ))}
      </div>
      <p className="mt-4 text-[11px] text-muted">Tagged · note saved · next contact</p>
    </Frame>
  );
}

function WhatsAppVisual() {
  return (
    <Frame title="GoHighLevel · WhatsApp">
      <p className="mb-4 w-fit rounded-full bg-[#25d366]/10 px-2.5 py-1 text-[11px] text-[#25d366]">No template needed</p>
      <div className="space-y-2 text-sm">
        <p className="ml-auto w-fit max-w-[80%] rounded-2xl rounded-br-md bg-[#005c4b] px-3.5 py-2 text-white">
          Hi Aisha, your order shipped this morning. Want the tracking link?
        </p>
        <p className="w-fit max-w-[80%] rounded-2xl rounded-bl-md bg-fg/10 px-3.5 py-2">Yes please!</p>
        <p className="text-[11px] text-muted">Reply synced to contact</p>
      </div>
    </Frame>
  );
}

function SwanAIVisual() {
  return (
    <Frame title="Swan AI">
      <div className="mb-4 flex flex-wrap gap-1.5 text-[11px] text-muted">
        {["Case 2417", "Probate", "12 documents"].map((c) => (
          <span key={c} className="rounded-full bg-fg/5 px-2.5 py-1">
            {c}
          </span>
        ))}
      </div>
      <div className="space-y-2 text-sm">
        <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-fg/10 px-3.5 py-2">
          Where are we on the Shah probate?
        </p>
        <p className="w-fit max-w-[92%] rounded-2xl rounded-bl-md border border-[#d9a93c]/30 bg-[#d9a93c]/10 px-3.5 py-2 text-fg/90">
          Filed on 14 Oct. Still waiting on a certified death certificate from the family. Next step: send the
          executor form for signing.
        </p>
        <p className="text-[11px] text-muted">From the full case file</p>
      </div>
    </Frame>
  );
}
