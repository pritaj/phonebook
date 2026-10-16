import type { Department, Employee} from "../types/sis";

export function personToVCard(person: Employee, deptName: string): string {
  return `BEGIN:VCARD\r\nVERSION:3.0\r\nN:${person.lastName};${person.firstName}\r\nFN:${person.lastName} ${person.firstName}\r\nORG:Példa Kft.;${deptName}\r\nTEL;TYPE=WORK,VOICE:${person.phone}\r\nEND:VCARD`;
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
): { person: Employee; deptName: string }[] {
  let result: { person: Employee; deptName: string }[] = [];
  departments.forEach((dept) => {
    for (const person of dept.employees) {
      result.push({ person, deptName: dept.nameHu });
    }
    if (dept.children.length > 0) {
      result = result.concat(collectAllPeople(dept.children));
    }
  });
  return result;
}
