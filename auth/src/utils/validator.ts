import validator from 'validator'
import { IUser } from '../model/User';

export const validate = (data:IUser) => {
    const mandatoryField = ["email", "password"];

    const IsAllowed = mandatoryField.every((key) =>
      Object.keys(data).includes(key),
    );

    if (!IsAllowed) throw new Error("Some Field Missing");

    if (!validator.isEmail(data.email)) throw new Error("Invalid Email");

    if (!validator.isStrongPassword(data.password))
      throw new Error("Week password");
}