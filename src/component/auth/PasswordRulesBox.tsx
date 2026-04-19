import { passwordRules } from "./passwordRules";
import "./passwordRules.css";

interface PasswordRulesBoxProps {
  value: string;
}

export function PasswordRulesBox({ value }: PasswordRulesBoxProps) {
  const hasInput = value.length > 0;

  return (
    <div className="rulesBox">
      {passwordRules.map((rule, index) => {
        const passed = hasInput && rule.test(value);
        const failed = hasInput && !rule.test(value);

        return (
          <div key={index} className="ruleRow">
            <div
              className={`ruleIconCircle ${
                passed
                  ? "ruleIconValid"
                  : failed
                    ? "ruleIconInvalid"
                    : "ruleIconNeutral"
              }`}
            >
              {failed ? "✕" : "✓"}
            </div>

            <span
              className={`ruleLabel ${
                passed
                  ? "ruleLabelValid"
                  : failed
                    ? "ruleLabelInvalid"
                    : "ruleLabelNeutral"
              }`}
            >
              {rule.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
