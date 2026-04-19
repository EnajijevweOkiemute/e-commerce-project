export function hasRepeatedSequence(value: string) {
  for (let size = 1; size <= Math.floor(value.length / 2); size += 1) {
    for (let index = 0; index <= value.length - size * 2; index += 1) {
      const current = value.slice(index, index + size);
      const next = value.slice(index + size, index + size * 2);

      if (current && current === next) {
        return true;
      }
    }
  }

  return false;
}

export const passwordRules = [
  {
    label: "At least 8 characters",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "At least one uppercase letter",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "At least one lowercase letter",
    test: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "At least one numeric digit",
    test: (value: string) => /[0-9]/.test(value),
  },
  {
    label: "At least one special character",
    test: (value: string) => /[\W_]/.test(value),
  },
  {
    label: "No repeated sequences",
    test: (value: string) => !hasRepeatedSequence(value),
  },
];
