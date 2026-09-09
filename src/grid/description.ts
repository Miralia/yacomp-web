/** Exact HDBits description cells, not the entire #details table (which also
 *  holds cast portraits, subtitle flags, Requests, and other page metadata).
 *  Shared by title inference and description-image click coverage. */
export function descriptionImageContainers(): HTMLElement[] {
  if (!document.querySelector("div.torrent-title, table#details")) return [];
  const roots = new Set<HTMLElement>();
  for (const label of document.querySelectorAll("div.label")) {
    if (!/^description$/i.test((label.textContent || "").trim())) continue;
    const td = label.closest("td");
    if (td && !td.closest("td.text, td.comment")) roots.add(td);
  }
  const details = document.querySelector("table#details");
  for (const row of details?.querySelectorAll(":scope > tbody > tr, :scope > tr") ?? []) {
    const label = row.querySelector(":scope > td > div.label");
    if (!/^tags$/i.test((label?.textContent || "").trim())) continue;
    const td = row.nextElementSibling?.querySelector<HTMLElement>(":scope > td");
    const nextLabel = td?.querySelector(":scope > div.label");
    if (td && (!nextLabel || /^description$/i.test((nextLabel.textContent || "").trim()))) roots.add(td);
  }
  return [...roots].filter((root) => ![...roots].some((other) => other !== root && other.contains(root)));
}
