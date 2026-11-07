import { describe, it, expect } from "vitest";
import Fuse from "fuse.js";
import { findMatchingPeople } from "./search";
import type { Employee } from "../types/sis";

type Entry = { person: Employee; deptName: string };

const lastNames = [
  "Nagy",
  "Kovács",
  "Tóth",
  "Szabó",
  "Horváth",
  "Varga",
  "Kiss",
  "Molnár",
  "Németh",
  "Farkas",
  "Balogh",
  "Papp",
  "Takács",
  "Juhász",
  "Lakatos",
  "Mészáros",
  "Oláh",
  "Simon",
  "Rácz",
  "Fekete",
  "Szilágyi",
  "Török",
  "Fehér",
  "Balázs",
  "Gál",
  "Kis",
  "Szűcs",
  "Kocsis",
  "Pintér",
  "Fodor",
  "Orosz",
  "Szalai",
  "Sipos",
  "Magyar",
  "Lukács",
  "Gulyás",
  "Biró",
  "Király",
  "Katona",
  "László",
  "Jakab",
  "Bogdán",
  "Hegedűs",
  "Vincze",
  "Szántó",
  "Boros",
  "Fazekas",
  "Lengyel",
  "Budai",
  "Máté",
];

const firstNames = [
  "Péter",
  "András",
  "Zoltán",
  "László",
  "István",
  "Gábor",
  "Attila",
  "Tamás",
  "Balázs",
  "Ferenc",
  "József",
  "János",
  "Csaba",
  "Zsolt",
  "Károly",
  "Miklós",
  "Gergely",
  "Dávid",
  "Ádám",
  "Bence",
  "Anna",
  "Katalin",
  "Éva",
  "Mária",
  "Zsuzsanna",
  "Judit",
  "Ilona",
  "Erzsébet",
  "Andrea",
  "Krisztina",
  "Eszter",
  "Nóra",
  "Réka",
  "Orsolya",
  "Viktória",
  "Edina",
  "Beáta",
  "Tímea",
  "Szilvia",
  "Dóra",
  "Lilla",
  "Fanni",
  "Petra",
  "Hajnalka",
  "Mónika",
  "Ágnes",
  "Róbert",
  "Márk",
  "Levente",
  "Norbert",
];

function generateEntries(count: number): Entry[] {
  const entries: Entry[] = [];
  for (let i = 0; i < count; i++) {
    const lastName = lastNames[i % lastNames.length];
    const firstName =
      firstNames[Math.floor(i / lastNames.length) % firstNames.length];
    entries.push({
      person: {
        id: i + 1,
        lastName,
        firstName,
        departmentId: 1,
        phone: null,
        email: null,
        position: null,
        inside: true,
      },
      deptName: "Teszt",
    });
  }
  return entries;
}

function searchWith(threshold: number, list: Entry[], query: string) {
  const fuse = new Fuse(list, {
    keys: [
      "person.lastName",
      "person.firstName",
      {
        name: "fullName",
        getFn: (n) => n.person.lastName + " " + n.person.firstName,
      },
    ],
    threshold,
    ignoreDiacritics: true,
  });
  return fuse.search(query).map((r) => r.item.person);
}

function averageMs(action: () => void, runs = 10): number {
  action();
  action();
  const start = performance.now();
  for (let i = 0; i < runs; i++) {
    action();
  }
  return (performance.now() - start) / runs;
}

const cases = [
  { query: "Kovács András", target: "Kovács András" },
  { query: "kovacs andras", target: "Kovács András" },
  { query: "kovac andras", target: "Kovács András" },
  { query: "Horvat Zoltan", target: "Horváth Zoltán" },
];
const hardCases = [
  { query: "kovacs andrs", target: "Kovács András" },
  { query: "hovacs andras", target: "Kovács András" },
  { query: "Horvat Zolatn", target: "Horváth Zoltán" },
  { query: "nagy pter", target: "Nagy Péter" },
];

describe("A keresés sebessége", () => {
  it("méréssorozat 100, 1000 és 5000 munkatárssal", () => {
    for (const size of [100, 1000, 5000]) {
      const list = generateEntries(size);
      for (const query of ["kovacs andras", "kovac andras"]) {
        let count = 0;
        const ms = averageMs(() => {
          count = findMatchingPeople(list, query).length;
        });
        console.log(
          `SEBESSEG | ${size} fő | "${query}" | ${ms.toFixed(1)} ms | ${count} találat`,
        );
        expect(ms).toBeLessThan(1000);
      }
    }
  });
});

describe("A küszöbérték hatása", () => {
  it("összehasonlítás 0,2 / 0,3 / 0,4 küszöbbel 1000 munkatársnál", () => {
    const list = generateEntries(1000);
    for (const threshold of [0.2, 0.3, 0.4]) {
      for (const { query, target } of [...cases, ...hardCases]) {
        const results = searchWith(threshold, list, query);
        const found = results.some(
          (p) => `${p.lastName} ${p.firstName}` === target,
        );
        console.log(
          `KUSZOB | ${threshold} | "${query}" | cél megtalálva: ${found ? "igen" : "nem"} | ${results.length} találat`,
        );
      }
      const noise = searchWith(threshold, list, "xyzxyz");
      console.log(`KUSZOB | ${threshold} | "xyzxyz" | ${noise.length} találat`);
    }
  });
});

describe("A használt küszöb (0,3) helyessége", () => {
  it("megtalálja az ékezet nélkül és elírással megadott neveket", () => {
    const list = generateEntries(1000);
    for (const { query, target } of cases) {
      const results = findMatchingPeople(list, query);
      const found = results.some(
        (p) => `${p.lastName} ${p.firstName}` === target,
      );
      expect(found, query).toBe(true);
    }
  });
});
