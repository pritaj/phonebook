import { filterDepartment, matchesSearch, findMatchingPeople } from "./search";
import type { Department } from "../types/sis";
import { describe, it, expect } from "vitest";

describe("matchesSearch", () => {
  it("megtalálja a szót, ha pontosan egyezik", () => {
    const match = matchesSearch("Kovács Béla", "Kovács");
    expect(match).toBe(true);
  });
  it("kisbetű nagybetű keresése", () => {
    const lowerMatch = matchesSearch("NAGY attila", "NaGy");
    expect(lowerMatch).toBe(true);
  });
  it("query nélkül", () => {
    const justText = matchesSearch("Nagy Attila", "Kovács");
    expect(justText).toBe(false);
  });
});
describe("filterDepartment - rekurzió", () => {
  it("al-department-ben lévő egyezést is megtalálja", () => {
    const childDept: Department = {
      id: 1220,
      parentId: 1,
      nameHu: "QA/QC",
      nameEn: "QA/QC",
      children: [
        {
          id: 1170,
          parentId: 1220,
          nameHu: "QC labor",
          nameEn: "QC - Laboratory",
          children: [],
          employees: [
            {
              id: 589303,
              departmentId: 1170,
              firstName: "Dóra",
              lastName: "Ádám",
              phone: null,
              inside: false,
            },
          ],
        },
      ],
      employees: [
        {
          id: 79920,
          departmentId: 1190,
          firstName: "Aranka",
          lastName: "Alföldi",
          phone: "+36709771619",
          inside: false,
        },
      ],
    };

    const parentDept: Department = {
      id: 1210,
      parentId: 1,
      nameHu: "Igazgató - R&D/Director - R&D",
      nameEn: "Director -  R&D",
      children: [childDept],
      employees: [],
    };

    const result = filterDepartment(parentDept, "Ádám");

    expect(result?.children.length).toBe(1);
  });
});
describe("filterDepartment", () => {
  it("csak az egyező nevű embereket tartja meg a department-ben", () => {
    const testDept: Department = {
      id: 1240,
      parentId: 1,
      nameHu: "Beszerzés/Purchasing",
      nameEn: "Purchasing",
      children: [],
      employees: [
        {
          id: 129010,
          departmentId: 1240,
          firstName: "Adrienn",
          lastName: "Molnár",
          phone: "+36705229428",
          inside: true,
        },
        {
          id: 123,
          departmentId: 1240,
          firstName: "Rolika",
          lastName: "Kovács",
          phone: "+12305229428",
          inside: true,
        },
      ],
    };
    const test = filterDepartment(testDept, "Kovács");
    expect(test?.employees.length).toBe(1);
  });
  it("megtartja a department-et, ha csak a neve egyezik a kereséssel", () => {
    const testDept: Department = {
      id: 1040,
      parentId: 1,
      nameHu: "Pénzügy/Finance",
      nameEn: "Finance",
      children: [],
      employees: [
        {
          id: 358380,
          departmentId: 1040,
          firstName: "Bicók Éva",
          lastName: "Bajuszné",
          phone: "+36704378165",
          inside: true,
        },
      ],
    };
    const result = filterDepartment(testDept, "Pénzügy");
    expect(result).not.toBeNull();
    expect(result?.employees.length).toBe(0);
  });
  it("null-t ad vissza, ha sem a department neve, sem senki nem egyezik", () => {
    const testDept: Department = {
      id: 1130,
      parentId: 1,
      nameHu: "Karbantartás/Maintenance",
      nameEn: "Maintenance",
      children: [],
      employees: [
        {
          id: 8880,
          departmentId: 1130,
          firstName: "Zoltán",
          lastName: "Ács",
          phone: null,
          
          inside: true,
        },
      ],
    };
    const result = filterDepartment(testDept, "Marketing");
    expect(result).toBeNull();
  });
});
describe("findMatchingPeople", () => {
  it("elgépelt névre is megtalálja az embert", () => {
    const lista = [
      {
        employees: {
          id: 1,
          departmentId: 1,
          firstName: "Takashi",
          lastName: "Hara",
          phone: null,
          email:null,
          position:null,
          inside: false,
        },
        deptName: "Beszerzés",
      },
      {
        employees: {
          id: 2,
          departmentId: 1,
          firstName: "Nagy",
          lastName: "Andrea",
          phone: null,
          email: "nagy.andrea@example.hu",
          position: "Test",
          inside: false,
        },
        deptName: "Pénzügy",
      },
    ];
    const result = findMatchingPeople(lista, "Takasi");
    expect(result).toHaveLength(1);
    expect(result[0].lastName).toBe("Hara");
  });
});
