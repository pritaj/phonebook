import type { Department, Person } from "../types/sis";

export function personToVCard(person: Person, deptName: string): string {
  return `BEGIN:VCARD\r\nVERSION:3.0\r\nN:${person.LastName};${person.FirstName}\r\nFN:${person.LastName} ${person.FirstName}\r\nORG:Példa Kft.;${deptName}\r\nTEL;TYPE=WORK,VOICE:${person.Phone}\r\nEND:VCARD`;
}

export function downloadVCard(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function collectAllPeople(
  departments: Department[],
): { person: Person; deptName: string }[] {
  let result: { person: Person; deptName: string }[] = [];
  departments.forEach((dept) => {
    for (const person of dept.people) {
      result.push({ person, deptName: dept.Name_hu });
    }
    if (dept.departments.length > 0) {
      result = result.concat(collectAllPeople(dept.departments));
    }
  });
  return result;
}
