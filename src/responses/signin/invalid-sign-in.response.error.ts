import { HttpError } from "routing-controllers";

export class InvalidSignInResponseError extends HttpError {
  constructor() {
    super(422, "invalid credentials");
  }
}
