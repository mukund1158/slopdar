// Maps internal scanner signal categories to the display labels used on the
// result page's "receipts" list.
export const CATEGORY_LABEL: Record<string, string> = {
  fingerprint: "Tool fingerprint",
  "default-stack": "Default asset",
  copy: "Copy tell",
  layout: "Layout tell",
  leftover: "Leftover junk",
  stack: "Stack tell",
};

export function categoryLabel(category: string): string {
  return CATEGORY_LABEL[category] ?? category;
}
