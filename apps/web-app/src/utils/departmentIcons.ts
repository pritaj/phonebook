export const departmentIcons: Record<number, string> = {
  1240: "shopping_cart_checkout",
  1030: "diversity_1",
  1110: "podium",
  1120: "podium",
  1210: "podium",
  1020: "bring_your_own_ip",
  1960: "lightbulb",
  1130: "construction",
  2337: "engineering",
  1040: "payments",
  1220: "verified",
  1230: "science",
  1080: "sell",
  1060: "local_shipping",
  2322: "eco",
  1140: "factory",
};

export function getDepartmentIcon(id: number): string {
  if (id < 0) return "more_horiz";
  return departmentIcons[id] ?? "folder";
}
