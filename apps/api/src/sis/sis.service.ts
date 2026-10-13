import { Injectable } from '@nestjs/common';
import { Agent, fetch } from 'undici';
import { ConfigService } from '@nestjs/config';

interface RawPerson {
  ID: number;
  DepID: number;
  FirstName: string;
  LastName: string;
  Phone: string;
}

interface Person {
  ID: number;
  DepID: number;
  FirstName: string;
  LastName: string;
  Phone: string;
  inside: boolean;
}

interface PersonsResponse {
  PersonList: RawPerson[];
}

interface RawDepartment {
  ID: number;
  StateCode: string;
  TypeCode: string;
  IdFrom: number;
  Code: string;
  Name: string;
  Description: string;
}

interface DepartmentsResponse {
  DepartmentList: RawDepartment[];
}

export interface Department {
  ID: number;
  IdFrom: number;
  Name_hu: string;
  Name_en: string;
  departments: Department[];
  people: Person[];
}

interface RawPersonInDoorList {
  EventTypeCode: string;
  EventDate: Date;
  EventRecDate: Date;
  DeviceID: number;
  PersonID: number;
  TagID: number;
  Direction: string;
}

interface PersonInDoorListResponse {
  personIndoorList: RawPersonInDoorList[];
}

@Injectable()
export class SisService {
  private cachedApiKey: string | null = null;

  constructor(private readonly configServices: ConfigService) {}

  private readonly httpsAgent = new Agent({
    connect: {
      rejectUnauthorized: false,
    },
  });

  private async login(): Promise<string> {
    const baseUrl = this.configServices.get<string>('SIS_API_URL');

    const response = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        UserName: this.configServices.get<string>('SIS_API_USER'),
        Password: this.configServices.get<string>('SIS_API_PASSWORD'),
        VID: this.configServices.get<string>('SIS_API_VID'),
      }),
      dispatcher: this.httpsAgent,
    });

    const token = await response.text();
    this.cachedApiKey = token;
    return token;
  }

  private async sisRequest({
    method,
    url,
    body,
  }: {
    method: string;
    url: string;
    body?: unknown;
  }) {
    if (!this.cachedApiKey) {
      await this.login();
    }

    const doFetch = () =>
      fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          apikey: this.cachedApiKey!,
        },
        body: body ? JSON.stringify(body) : undefined,
        dispatcher: this.httpsAgent,
      });

    let response = await doFetch();

    if (response.status === 401) {
      await this.login();
      response = await doFetch();
    }

    return response;
  }

  async getPersons() {
    const baseUrl = this.configServices.get<string>('SIS_API_URL');
    const response = await this.sisRequest({
      method: 'GET',
      url: `${baseUrl}/persons`,
    });
    const data = (await response.json()) as PersonsResponse;
    return data.PersonList;
  }

  async getDepartments() {
    const baseUrl = this.configServices.get<string>('SIS_API_URL');
    const response = await this.sisRequest({
      method: 'GET',
      url: `${baseUrl}/departments`,
    });
    const data = (await response.json()) as DepartmentsResponse;
    return data.DepartmentList;
  }
  async getPersonsInDoorList(areaId: number) {
    const baseUrl = this.configServices.get<string>('SIS_API_URL');
    const response = await this.sisRequest({
      method: 'POST',
      url: `${baseUrl}/personInDoorList`,
      body: {
        AreaID: areaId,
      },
    });
    const data = (await response.json()) as PersonInDoorListResponse;
    return data.personIndoorList;
  }

  private mapPersons(
    rawPersons: RawPerson[],
    indoorList: RawPersonInDoorList[],
  ): Person[] {
    const people: Person[] = [];
    rawPersons.forEach((person) => {
      const inSide = indoorList.some((entry) => entry.PersonID === person.ID);
      people.push({
        ID: person.ID,
        DepID: person.DepID,
        FirstName: person.FirstName,
        LastName: person.LastName,
        Phone: person.Phone,
        inside: inSide,
      });
    });
    return people;
  }

  private buildDepartmentNode(
    rawDep: RawDepartment,
    allDeps: RawDepartment[],
    people: Person[],
  ): Department {
    return {
      ID: rawDep.ID,
      IdFrom: rawDep.IdFrom,
      Name_hu: rawDep.Name,
      Name_en: rawDep.Description,
      departments: allDeps
        .filter((w) => w.IdFrom == rawDep.ID)
        .map((dep) => this.buildDepartmentNode(dep, allDeps, people)),
      people: people.filter((p) => p.DepID == rawDep.ID),
    };
  }
  async getDepartmentTree(areaId: number): Promise<Department[]> {
    const rawPersons = await this.getPersons();
    const rawDepartments = await this.getDepartments();
    const indoorList = await this.getPersonsInDoorList(areaId);
    const rootDepartments = rawDepartments.filter(
      (dep) => !rawDepartments.some((d) => d.ID === dep.IdFrom),
    );
    const people = this.mapPersons(rawPersons, indoorList);
    return rootDepartments.map((dep) =>
      this.buildDepartmentNode(dep, rawDepartments, people),
    );
  }
}
