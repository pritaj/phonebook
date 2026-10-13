/**
 * Represent a user
 */
export interface UserInfo {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  name: string;
  monogram: string;
  job_title: string;
  roles?: string[];
  attributes?: any;
}
