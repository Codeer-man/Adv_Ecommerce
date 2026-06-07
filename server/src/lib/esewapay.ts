function checkEnv(name: string): string {
  const extractValue = process.env[name];

  if (!extractValue) {
    throw new Error(`Env file ${name} nof found`);
  }

  return extractValue;
}

export function EsewaPay() {}
