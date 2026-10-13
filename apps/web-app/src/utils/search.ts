import Fuse from "fuse.js";
import type { Department, Person } from "../types/sis";

export function matchesSearch(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

export function filterDepartment(
  dept: Department,
  query: string,
): Department | null {
  const matchingPeople = dept.people.filter(
    (person) =>
      matchesSearch(person.FirstName, query) ||
      matchesSearch(person.LastName, query),
  );
  const filteredChildren = dept.departments
    .map((child) => filterDepartment(child, query))
    .filter((child) => child !== null);
  const deptNameMatches = matchesSearch(dept.Name_hu, query);
  const hasMatch =
    deptNameMatches || matchingPeople.length > 0 || filteredChildren.length > 0;
  if (hasMatch) {
    return { ...dept, people: matchingPeople, departments: filteredChildren };
  } else {
    return null;
  }
}
export function findMatchingPeople(
  lista: { person: Person; deptName: string }[],
  query: string,
) {
  const fuse = new Fuse(lista, {
    keys: [
      "person.LastName",
      "person.FirstName",
      {
        name: "fullName",
        getFn: (n) => n.person.LastName + " " + n.person.FirstName,
      },
    ],
    threshold: 0.3,
  });
  const result = fuse.search(query);
  return result.map((r) => r.item.person);
}

export function filterDepartmentByIds(
  dept: Department,
  ids: Set<number>,
): Department | null {
  const matchingPeople = dept.people.filter((person) => ids.has(person.ID));
  const filteredChildren = dept.departments
    .map((child) => filterDepartmentByIds(child, ids))
    .filter((child) => child !== null);
  const hasMatch = matchingPeople.length > 0 || filteredChildren.length > 0;
  if (hasMatch) {
    return { ...dept, people: matchingPeople, departments: filteredChildren };
  } else {
    return null;
  }
}
