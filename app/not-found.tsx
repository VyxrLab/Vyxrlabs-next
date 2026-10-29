import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[80svh] flex-col justify-center pt-32">
      <p className="eyebrow mb-6">{"// 404"}</p>
      <h1 className="display text-[clamp(2.8rem,7vw,7rem)]">This page doesn&apos;t exist.</h1>
      <p className="mt-6 max-w-md text-lg text-muted">
        The link may be old or mistyped. Head back home, or tell us what you were looking for.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/" className="btn-primary">
          Go to homepage
        </Link>
        <Link href="/contact" className="btn-ghost">
          Contact us
        </Link>
      </div>
    </section>
  );
}
