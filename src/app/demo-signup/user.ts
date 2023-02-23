export interface AuthenticationObject {
  lastname: string;
  firstname: string;
  email: string;
  // password:string;
}
export interface UserObject {
  name: string;
  email: string;
  checkBoxes: string[];
}
export interface FirestoreUser {
  name: string;
  email: string;
  purpose: string[];
  verified: boolean;
}
export interface SignUpState {
  currentState?: SignUpStateEnum;
  error?: string;
}

// eslint-disable-next-line no-shadow
export enum SignUpStateEnum {
  default = 'Default',
  emailSent = 'Sent',
  userExists = 'Exists',
  successfulSignup = 'Successful',
  loading = 'Loading',
  //Requests user to input email when accessing the signup link on a different device
  differentDevice = 'Different',
}
