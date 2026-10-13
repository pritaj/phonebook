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
      ID: 1220,
      IdFrom: 1,
      Name_hu: "QA/QC",
      Name_en: "QA/QC",
      departments: [
        {
          ID: 1170,
          IdFrom: 1220,
          Name_hu: "QC labor",
          Name_en: "QC - Laboratory",
          departments: [],
          people: [
            {
              ID: 589303,
              DepID: 1170,
              FirstName: "Dóra",
              LastName: "Ádám",
              Phone: null,
              inside: false,
            },
          ],
        },
      ],
      people: [
        {
          ID: 79920,
          DepID: 1190,
          FirstName: "Aranka",
          LastName: "Alföldi",
          Phone: "+36709771619",
          inside: false,
        },
      ],
    };

    const parentDept: Department = {
      ID: 1210,
      IdFrom: 1,
      Name_hu: "Igazgató - R&D/Director - R&D",
      Name_en: "Director -  R&D",
      departments: [childDept],
      people: [],
    };

    const result = filterDepartment(parentDept, "Ádám");

    expect(result?.departments.length).toBe(1);
  });
});
describe("filterDepartment", () => {
  it("csak az egyező nevű embereket tartja meg a department-ben", () => {
    const testDept: Department = {
      ID: 1240,
      IdFrom: 1,
      Name_hu: "Beszerzés/Purchasing",
      Name_en: "Purchasing",
      departments: [],
      people: [
        {
          ID: 129010,
          DepID: 1240,
          FirstName: "Adrienn",
          LastName: "Molnár",
          Phone: "+36705229428",
          inside: true,
        },
        {
          ID: 123,
          DepID: 1240,
          FirstName: "Rolika",
          LastName: "Kovács",
          Phone: "+12305229428",
          inside: true,
        },
      ],
    };
    const test = filterDepartment(testDept, "Kovács");
    expect(test?.people.length).toBe(1);
  });
  it("megtartja a department-et, ha csak a neve egyezik a kereséssel", () => {
    const testDept: Department = {
      ID: 1040,
      IdFrom: 1,
      Name_hu: "Pénzügy/Finance",
      Name_en: "Finance",
      departments: [],
      people: [
        {
          ID: 358380,
          DepID: 1040,
          FirstName: "Bicók Éva",
          LastName: "Bajuszné",
          Phone: "+36704378165",
          inside: true,
        },
      ],
    };
    const result = filterDepartment(testDept, "Pénzügy");
    expect(result).not.toBeNull();
    expect(result?.people.length).toBe(0);
  });
  it("null-t ad vissza, ha sem a department neve, sem senki nem egyezik", () => {
    const testDept: Department = {
      ID: 1130,
      IdFrom: 1,
      Name_hu: "Karbantartás/Maintenance",
      Name_en: "Maintenance",
      departments: [],
      people: [
        {
          ID: 8880,
          DepID: 1130,
          FirstName: "Zoltán",
          LastName: "Ács",
          Phone: "",
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
        person: {
          ID: 1,
          DepID: 1,
          FirstName: "Takashi",
          LastName: "Hara",
          Phone: null,
          inside: false,
        },
        deptName: "Beszerzés",
      },
      {
        person: {
          ID: 2,
          DepID: 1,
          FirstName: "Nagy",
          LastName: "Andrea",
          Phone: null,
          inside: false,
        },
        deptName: "Pénzügy",
      },
    ];
    const result = findMatchingPeople(lista, "Takasi");
    expect(result).toHaveLength(1);
    expect(result[0].LastName).toBe("Hara");
  });
});
