import { LegalLayout, LegalSection } from "@/components/legal/LegalLayout";

const libraries = [
  { name: "React", license: "MIT", url: "https://github.com/facebook/react" },
  { name: "React Router", license: "MIT", url: "https://github.com/remix-run/react-router" },
  { name: "Vite", license: "MIT", url: "https://github.com/vitejs/vite" },
  { name: "Tailwind CSS", license: "MIT", url: "https://github.com/tailwindlabs/tailwindcss" },
  { name: "Framer Motion", license: "MIT", url: "https://github.com/framer/motion" },
  { name: "GSAP", license: "Standard 'No Charge' License", url: "https://gsap.com/standard-license/" },
  { name: "Radix UI", license: "MIT", url: "https://github.com/radix-ui/primitives" },
  { name: "shadcn/ui", license: "MIT", url: "https://github.com/shadcn-ui/ui" },
  { name: "Lucide Icons", license: "ISC", url: "https://github.com/lucide-icons/lucide" },
  { name: "TanStack Query", license: "MIT", url: "https://github.com/TanStack/query" },
];

const sections: LegalSection[] = [
  {
    id: "open-source",
    title: "1. Open-Source Libraries",
    content: (
      <>
        <p>
          Chatori Jeeb is built on top of the wonderful open-source community. We gratefully
          acknowledge the following libraries:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-border mt-4">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left font-semibold p-3">Library</th>
                <th className="text-left font-semibold p-3">License</th>
              </tr>
            </thead>
            <tbody>
              {libraries.map((lib) => (
                <tr key={lib.name} className="border-t border-border">
                  <td className="p-3">
                    <a
                      href={lib.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-primary-deep font-semibold hover:underline"
                    >
                      {lib.name}
                    </a>
                  </td>
                  <td className="p-3 text-muted-foreground">{lib.license}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    ),
  },
  {
    id: "fonts",
    title: "2. Fonts",
    content: (
      <p>
        System UI fonts are used for performance and accessibility. Where custom fonts are loaded,
        they are licensed under the SIL Open Font License (OFL) or equivalent permissive licenses.
      </p>
    ),
  },
  {
    id: "icons",
    title: "3. Icons",
    content: (
      <p>
        Iconography is provided by{" "}
        <a
          href="https://lucide.dev"
          target="_blank"
          rel="noreferrer noopener"
          className="text-primary-deep font-semibold hover:underline"
        >
          Lucide
        </a>{" "}
        under the ISC license.
      </p>
    ),
  },
  {
    id: "images",
    title: "4. Images",
    content: (
      <p>
        Food and lifestyle imagery is either AI-generated, owned by Chatori Jeeb, or licensed from
        partner restaurants. Stock photography (where used) is sourced from royalty-free providers
        such as Unsplash and Pexels.
      </p>
    ),
  },
  {
    id: "trademarks",
    title: "5. Trademarks",
    content: (
      <p>
        "Chatori Jeeb" and the Chatori Jeeb logo are trademarks of Chatori Jeeb Pvt. Ltd. All other
        trademarks belong to their respective owners.
      </p>
    ),
  },
];

export default function Licenses() {
  return (
    <LegalLayout
      title="Licenses"
      description="Open-source libraries, fonts, icons, and image credits used to build Chatori Jeeb."
      lastUpdated="May 1, 2026"
      path="/licenses"
      sections={sections}
    />
  );
}