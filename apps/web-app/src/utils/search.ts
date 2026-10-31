import Fuse from "fuse.js";
import type { Department, Employee } from "../types/sis";

export function matchesSearch(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function filterDepartment(
  dept: Department,
  query: string,
): Department | null {
  const matchingPeople = dept.employees.filter(
    (person) =>
      matchesSearch(person.firstName, query) ||
      matchesSearch(person.lastName, query),
  );
  const filteredChildren = dept.children
    .map((child) => filterDepartment(child, query))
    .filter((child) => child !== null);
  const deptNameMatches = matchesSearch(dept.nameHu, query);
  const hasMatch =
    deptNameMatches || matchingPeople.length > 0 || filteredChildren.length > 0;
  if (hasMatch) {
    return { ...dept, employees: matchingPeople, children: filteredChildren };
  } else {
    return null;
  }
}
export function findMatchingPeople(
  lista: { person: Employee; deptName: string }[],
  query: string,
) {
  const fuse = new Fuse(lista, {
    keys: [
      "person.lastName",
      "person.firstName",
      {
        name: "fullName",
        getFn: (n) => n.person.lastName + " " + n.person.firstName,
      },
    ],
    threshold: 0.3,
    ignoreDiacritics: true,
  });
  const result = fuse.search(query);
  return result.map((r) => r.item.person);
}

export function filterDepartmentByIds(
  dept: Department,
  ids: Set<number>,
): Department | null {
  const matchingPeople = dept.employees.filter((person) => ids.has(person.id));
  const filteredChildren = dept.children
    .map((child) => filterDepartmentByIds(child, ids))
    .filter((child) => child !== null);
  const hasMatch = matchingPeople.length > 0 || filteredChildren.length > 0;
  if (hasMatch) {
    return { ...dept, employees: matchingPeople, children: filteredChildren };
  } else {
    return null;
  }
}
