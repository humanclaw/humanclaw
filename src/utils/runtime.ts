export interface RuntimeEnv {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  exit: (code: number) => void;
}

export const defaultRuntime: RuntimeEnv = {
  log: console.log,
  error: console.error,
  exit: process.exit,
};
