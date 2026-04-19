import { User } from "../../types";
import "./roleSwitch.css";

interface RoleSwitchProps {
  value: User["role"];
  onChange: (role: User["role"]) => void;
}

export function RoleSwitch({ value, onChange }: RoleSwitchProps) {
  return (
    <div className="role-switch" role="radiogroup" aria-label="Choose account type">
      <button
        type="button"
        className={value === "customer" ? "role-switch__option role-switch__option--active" : "role-switch__option"}
        onClick={() => onChange("customer")}
        aria-pressed={value === "customer"}
      >
        Customer
      </button>
      <button
        type="button"
        className={value === "admin" ? "role-switch__option role-switch__option--active" : "role-switch__option"}
        onClick={() => onChange("admin")}
        aria-pressed={value === "admin"}
      >
        Admin
      </button>
    </div>
  );
}
