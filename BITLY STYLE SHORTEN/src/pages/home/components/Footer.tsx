export default function Footer() {
  const cols = [
    { title: "Product", links: ["Features", "Analytics", "QR codes", "API", "Changelog"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact", "Press"] },
    { title: "Resources", links: ["Docs", "Help center", "Status", "Security", "Guides"] },
    { title: "Legal", links: ["Privacy", "Terms", "Cookies", "DPA", "GDPR"] },
  ];
  return (
    <footer className="bg-secondary-100 text-foreground-800">
      <div className="max-w-6xl mx-auto px-4 md:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-lg bg-foreground-950 flex items-center justify-center">
                <i className="ri-link-m text-xl text-background-50"></i>
              </span>
              <span className="font-heading text-2xl text-foreground-950">Linkly</span>
            </div>
            <p className="mt-4 text-sm text-foreground-600 max-w-xs leading-relaxed">
              Short links with loud insights. Built for marketers, creators, and businesses who need
              to know what actually works.
            </p>
            <div className="mt-6 flex gap-3">
              {["ri-twitter-x-line", "ri-instagram-line", "ri-linkedin-line", "ri-github-line"].map((i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-background-50 border border-background-200 flex items-center justify-center text-foreground-700 hover:text-foreground-950 cursor-pointer"
                >
                  <i className={`${i} text-base`}></i>
                </a>
              ))}
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <div className="text-xs font-semibold uppercase tracking-widest text-foreground-950 mb-4">
                {c.title}
              </div>
              <ul className="space-y-2.5 text-sm">
                {c.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-foreground-600 hover:text-foreground-950 cursor-pointer">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 pt-6 border-t border-secondary-200 flex flex-col sm:flex-row justify-between gap-3 text-xs text-foreground-500">
          <span>© 2026 Linkly, Inc. All rights reserved.</span>
          <span>Made with warmth in Brooklyn &amp; Lisbon.</span>
        </div>
      </div>
    </footer>
  );
}