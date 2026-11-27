import { NAV_TABS, type NavTab } from "@phrenia/shared";

export const DEFAULT_TAB: NavTab = "timeline";

/** Reads a tab name from a URL hash such as "#/kanban". Unknown values fall back to the timeline. */
export function tabFromHash(hash: string): NavTab {
  const name = hash.replace(/^#\/?/, "");
  return (NAV_TABS as readonly string[]).includes(name) ? (name as NavTab) : DEFAULT_TAB;
}
