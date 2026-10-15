import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { infoPages } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return Object.keys(infoPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = infoPages[(await params).slug];
  return p ? { title: p.title } : {};
}

export default async function Page({ params }: Props) {
  const page = infoPages[(await params).slug];
  if (!page) notFound();
  return (
    <>
      <section className="container page-hero">
        <h1 className="display h2">{page.title}</h1>
        <p className="lead">{page.intro}</p>
      </section>
      <section className="container prose" style={{ paddingBottom: 120 }}>
        {page.sections.map((s) => (
          <div key={s.h} className="reveal">
            <h2>{s.h}</h2>
            {s.p.map((t, i) => (
              <p key={i}>{t}</p>
            ))}
          </div>
        ))}
      </section>
    </>
  );
}
