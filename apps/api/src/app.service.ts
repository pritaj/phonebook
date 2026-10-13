import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Hello World!',
    };
  }
  /*getPeople() {}
  async getToken(): Promise<string> {
    const reguestBody = {
      UserName: process.env.SIS_API_USER,
      Password: process.env.SIS_API_PASSWORD,
      VID: process.env.SIS_API_VID,
    };

    const response = await fetch(`${process.env.SIS_API_URL}login`, {
      method: 'POST',
      body: JSON.stringify(reguestBody),
    });
    this.apikey = (await response.json()) as string;
    return (await response.json()) as string;
  } */
}
