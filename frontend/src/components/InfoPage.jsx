import { FadeIn } from "./Motion";
import { Link } from "react-router-dom";

export default function InfoPage({ title, icon: Icon, description, sections = [], links = [] }) {
  return (
    <div className="pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="text-center mb-12">
            {Icon && (
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
                <Icon size={32} weight="fill" className="text-primary" />
              </div>
            )}
            <h1 className="font-heading font-black text-4xl sm:text-5xl tracking-tighter">{title}</h1>
            {description && <p className="text-muted-foreground mt-4 max-w-xl mx-auto">{description}</p>}
          </div>
        </FadeIn>

        {sections.length > 0 && (
          <FadeIn delay={0.1}>
            <div className="space-y-6">
              {sections.map((s, i) => (
                <div key={i} className="border border-border rounded-2xl p-6">
                  <h2 className="font-heading font-bold text-xl mb-3">{s.heading}</h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.content}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        )}

        {links.length > 0 && (
          <FadeIn delay={0.2}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              {links.map((l, i) => (
                <Link key={i} to={l.to} className="px-5 py-2 border border-border rounded-full text-sm hover:bg-secondary transition-colors">{l.label}</Link>
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
