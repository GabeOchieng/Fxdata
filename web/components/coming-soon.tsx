import Link from "next/link";

export function ComingSoon({
  emoji,
  title,
  blurb,
}: {
  emoji: string;
  title: string;
  blurb: string;
}) {
  return (
    <section className="container-content flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-line bg-white/[0.03] text-3xl">
        {emoji}
      </div>
      <span className="kicker mt-6">In build · migrating from the static prototype</span>
      <h1 className="mt-5 max-w-2xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
        {title}
      </h1>
      <p className="mt-4 max-w-lg text-muted">{blurb}</p>
      <Link href="/" className="btn-ghost mt-8">
        ← Back home
      </Link>
    </section>
  );
}
