import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href: string;
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `https://betterexams.ie${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-zinc-400">
        <ol className="flex flex-wrap items-center gap-x-1 -mx-1">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center gap-x-1">
              {index > 0 && <span className="text-zinc-600">/</span>}
              {index === items.length - 1 ? (
                <span className="text-zinc-200 py-2 px-1">{item.label}</span>
              ) : (
                <Link
                  href={item.href}
                  className="text-blue-400 hover:text-blue-300 underline underline-offset-2 py-2 px-1"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
