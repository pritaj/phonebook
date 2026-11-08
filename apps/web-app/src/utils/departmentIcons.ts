export const departmentIcons: Record<number, string> = {};

export function getDepartmentIcon(id: number): string {
  if (id < 0) return "more_horiz";
  return departmentIcons[id] ?? "folder";
}
