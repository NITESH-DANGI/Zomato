import validator from 'validator'
import { IUser } from '../model/User.js';

export const validate = (data: IUser) => {
  const mandatoryField = ["email", "password"];

  const IsAllowed = mandatoryField.every((key) =>
    Object.keys(data).includes(key),
  );

  if (!IsAllowed) {
    console.error("Validation failed: Missing mandatory fields");
    throw new Error("Some Field Missing");
  }

  if (!validator.isEmail(data.email)) {
    console.error("Validation failed: Invalid email", data.email);
    throw new Error("Invalid Email");
  }

  if (!data.password || data.password.length < 6) {
    console.error("Validation failed: Password too short");
    throw new Error("Password must be at least 6 characters long");
  }
};