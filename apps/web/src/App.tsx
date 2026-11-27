import { useEffect, useState } from "react";
import { NAV_TABS, type NavTab } from "@phrenia/shared";
import { tabFromHash } from "./nav";

export default function App() {
  const [tab, setTab] = useState<NavTab>(() => tabFromHash(window.location.hash));

  useEffect(() => {
    const onHash = () => setTab(tabFromHash(window.location.hash));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  return (
    <>
      <a className="skip" href="#content">Skip to content</a>
      <nav className="nav" aria-label="Project">
        <strong style={{ fontWeight: 500 }}>phrenia</strong>
        <span className="dim">/ term project</span>
        <span style={{ flex: 1 }} />
        {NAV_TABS.map((t) => (
          <a key={t} href={`#/${t}`} aria-current={t === tab ? "page" : undefined}>{t}</a>
        ))}
      </nav>
      <main id="content" className="main">
        <h1 style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{tab}</h1>
        <p className="dim">Step 0 skeleton. Screens arrive one step at a time; see docs/ARCHITECTURE.md.</p>
      </main>
    </>
  );
}
