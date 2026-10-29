"use client";

import { useId, useState, type ReactNode } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiArrowLeft, FiCheck, FiCpu, FiHelpCircle, FiLayers, FiMail, FiRepeat, FiTool, FiZap } from "react-icons/fi";
import { contact, whatsappLink } from "@/lib/site";

const needs = [
  { id: "custom-solutions", label: "Custom solution or product", hint: "Software built around how you sell", icon: FiTool },
  { id: "automation", label: "Business automation", hint: "Take repetitive work off your team", icon: FiRepeat },
  { id: "saas", label: "SaaS platform", hint: "A product you can sell to others", icon: FiLayers },
  { id: "ai", label: "Custom AI", hint: "AI with context on every lead", icon: FiCpu },
  { id: "ghl", label: "GoHighLevel app", hint: "Extend GHL for you or your clients", icon: FiZap },
  { id: "unsure", label: "Not sure yet", hint: "We'll help you figure it out", icon: FiHelpCircle },
];
const teamSizes = ["Just me", "2–10", "11–50", "51+"];
const crms = ["GoHighLevel", "HubSpot", "Salesforce", "Other", "None yet"];
const steps = ["What you need", "Your business today", "Your details"];

type Form = {
  needs: string[];
  industry: string;
  teamSize: string;
  crm: string;
  bottleneck: string;
  name: string;
  company: string;
  email: string;
  phone: string;
};

const empty: Form = {
  needs: [],
  industry: "",
  teamSize: "",
  crm: "",
  bottleneck: "",
  name: "",
  company: "",
  email: "",
  phone: "",
};

function buildBrief(f: Form) {
  const field = (label: string, value: string) => (value.trim() ? `${label}: ${value.trim()}` : null);
  const lines = [
    "Hi VyxrLabs, I'd like to start a project.",
    "",
    field("What I need", f.needs.map((id) => needs.find((n) => n.id === id)?.label).join(", ")),
    field("Industry", f.industry),
    field("Team size", f.teamSize),
    field("CRM", f.crm),
    field("Biggest bottleneck", f.bottleneck),
    "",
    field("Name", f.name),
    field("Company", f.company),
    field("Email", f.email),
    field("Phone", f.phone),
  ];
  return lines.filter((l) => l !== null).join("\n");
}

/** `initialNeed` preselects a card when arriving from a service page (/contact?need=automation). */
export default function ContactWizard({ initialNeed }: { initialNeed?: string }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Form>(() =>
    initialNeed && needs.some((n) => n.id === initialNeed) ? { ...empty, needs: [initialNeed] } : empty,
  );
  const [error, setError] = useState("");
  const [sentVia, setSentVia] = useState<"WhatsApp" | "email" | null>(null);
  const uid = useId();

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError("");
  };

  const toggleNeed = (id: string) => {
    setError("");
    setForm((f) => {
      if (id === "unsure") return { ...f, needs: f.needs.includes("unsure") ? [] : ["unsure"] };
      const without = f.needs.filter((n) => n !== "unsure" && n !== id);
      return { ...f, needs: f.needs.includes(id) ? without : [...without, id] };
    });
  };

  const validate = () => {
    if (step === 0 && form.needs.length === 0) return "Pick at least one option to continue.";
    if (step === 2) {
      if (!form.name.trim()) return "Add your name so we know who to reply to.";
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter a valid email, like you@company.com.";
    }
    return "";
  };

  const next = () => {
    const problem = validate();
    if (problem) return setError(problem);
    setStep((s) => s + 1);
  };

  const send = (via: "WhatsApp" | "email") => {
    const problem = validate();
    if (problem) return setError(problem);
    const brief = buildBrief(form);
    if (via === "WhatsApp") {
      window.open(whatsappLink(brief), "_blank", "noopener,noreferrer");
    } else {
      const subject = encodeURIComponent(`New project: ${form.company || form.name}`);
      window.location.href = `mailto:${contact.email}?subject=${subject}&body=${encodeURIComponent(brief)}`;
    }
    setSentVia(via);
  };

  if (sentVia) {
    return (
      <Card>
        <div className="py-10 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-signal/15 text-signal-hi">
            <FiCheck className="h-6 w-6" aria-hidden />
          </span>
          <h2 className="display-tight mt-6 text-3xl">Your brief is ready</h2>
          <p className="mx-auto mt-3 max-w-sm text-muted">
            We opened {sentVia} with everything filled in. Press send there and we&apos;ll take it from here.
          </p>
          <button
            type="button"
            onClick={() => {
              setForm(empty);
              setStep(0);
              setSentVia(null);
            }}
            className="btn-ghost mt-8"
          >
            Start a new brief
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="display-tight text-2xl sm:text-3xl">Tell us about your business</h2>

      {/* Progress */}
      <ol className="mt-6 grid grid-cols-3 gap-3" aria-label="Progress">
        {steps.map((label, i) => (
          <li key={label} aria-current={i === step ? "step" : undefined}>
            <span className="block h-1 overflow-hidden rounded-full bg-line">
              <span
                className="block h-full rounded-full bg-signal transition-[width] duration-700 ease-out-expo"
                style={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }}
              />
            </span>
            <span className={`mt-2 block text-xs ${i === step ? "text-fg" : "text-muted"}`}>
              {i + 1}. {label}
            </span>
          </li>
        ))}
      </ol>

      <form
        className="mt-8"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (step < 2) next();
          else send("WhatsApp");
        }}
      >
        <div key={step} className="animate-fade-in">
          {step === 0 && (
            <fieldset>
              <legend className="mb-4 text-lg">
                What do you need? <span className="text-sm text-muted">Pick one or more</span>
              </legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {needs.map(({ id, label, hint, icon: Icon }) => {
                  const checked = form.needs.includes(id);
                  return (
                    <label
                      key={id}
                      className={`relative flex cursor-pointer gap-3 rounded-2xl border p-4 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal-hi ${
                        checked ? "border-signal bg-signal/10" : "border-line hover:border-fg/25"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleNeed(id)}
                      />
                      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${checked ? "text-signal-hi" : "text-muted"}`} aria-hidden />
                      <span>
                        <span className="block font-medium">{label}</span>
                        <span className="block text-sm text-muted">{hint}</span>
                      </span>
                      {checked && <FiCheck className="absolute right-4 top-4 text-signal-hi" aria-hidden />}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <Field label="Industry" htmlFor={`${uid}-industry`}>
                <input
                  id={`${uid}-industry`}
                  value={form.industry}
                  onChange={(e) => set("industry", e.target.value)}
                  placeholder="e.g. Real estate, coaching, agency"
                  className="input"
                />
              </Field>
              <Chips legend="Team size" options={teamSizes} value={form.teamSize} onChange={(v) => set("teamSize", v)} />
              <Chips legend="Which CRM do you use?" options={crms} value={form.crm} onChange={(v) => set("crm", v)} />
              <Field label="What's slowing you down the most?" htmlFor={`${uid}-bottleneck`}>
                <textarea
                  id={`${uid}-bottleneck`}
                  rows={4}
                  value={form.bottleneck}
                  onChange={(e) => set("bottleneck", e.target.value)}
                  placeholder="e.g. We lose leads because follow-up is manual"
                  className="input resize-y"
                />
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Name" htmlFor={`${uid}-name`} required>
                <input
                  id={`${uid}-name`}
                  autoComplete="name"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  className="input"
                  required
                />
              </Field>
              <Field label="Company" htmlFor={`${uid}-company`}>
                <input
                  id={`${uid}-company`}
                  autoComplete="organization"
                  value={form.company}
                  onChange={(e) => set("company", e.target.value)}
                  className="input"
                />
              </Field>
              <Field label="Email" htmlFor={`${uid}-email`} required>
                <input
                  id={`${uid}-email`}
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="input"
                  required
                />
              </Field>
              <Field label="Phone or WhatsApp" htmlFor={`${uid}-phone`}>
                <input
                  id={`${uid}-phone`}
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="input"
                />
              </Field>
            </div>
          )}
        </div>

        <p role="alert" aria-live="assertive" className="mt-5 min-h-6 text-sm text-[#ff8a8a]">
          {error}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
              <FiArrowLeft aria-hidden /> Back
            </button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <button type="submit" className="btn-primary">
              Next
            </button>
          ) : (
            <div className="flex flex-wrap gap-3">
              <button type="button" onClick={() => send("email")} className="btn-ghost">
                <FiMail aria-hidden /> Send by email
              </button>
              <button type="submit" className="btn-primary">
                <FaWhatsapp aria-hidden /> Send on WhatsApp
              </button>
            </div>
          )}
        </div>
      </form>
    </Card>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-[28px] border border-line bg-ink-2 p-6 sm:p-8">{children}</div>;
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm">
        {label}
        {required && <span className="text-muted"> (required)</span>}
      </label>
      {children}
    </div>
  );
}

function Chips({
  legend,
  options,
  value,
  onChange,
}: {
  legend: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label
            key={o}
            className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-signal-hi ${
              value === o ? "border-signal bg-signal/15 text-fg" : "border-line text-muted hover:text-fg"
            }`}
          >
            <input
              type="radio"
              name={legend}
              className="sr-only"
              checked={value === o}
              onChange={() => onChange(o)}
            />
            {o}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
