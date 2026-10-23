import ky from "ky";

export const api = ky.create({
  baseUrl: import.meta.env.VITE_API_URL,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = localStorage.getItem("token");
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      ({ response }) => {
        if (response.status === 401) {
          localStorage.removeItem("token");
          window.location.reload();
        }
      },
    ],
  },
});
