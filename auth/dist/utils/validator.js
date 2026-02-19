"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validator_1 = __importDefault(require("validator"));
const validate = (data) => {
    const mandatoryField = ["email", "password"];
    const IsAllowed = mandatoryField.every((key) => Object.keys(data).includes(key));
    if (!IsAllowed)
        throw new Error("Some Field Missing");
    if (!validator_1.default.isEmail(data.email))
        throw new Error("Invalid Email");
    if (!validator_1.default.isStrongPassword(data.password))
        throw new Error("Week password");
};
exports.validate = validate;
