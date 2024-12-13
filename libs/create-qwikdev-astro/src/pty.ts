import { spawn } from "node-pty";
import stripAnsi from "strip-ansi";

export function $(
  command: string,
  args: string[] = [],
  interactions: Record<string, string> = {},
  options = {
    cwd: process.cwd(),
    env: { ...process.env }
  }
): Promise<string> {
  return new Promise((resolve, reject) => {
    options.env.CI = "true";

    const shell = spawn(command, args, {
      name: "xterm-256color",
      cols: 80,
      rows: 30,
      ...options
    });

    const timeout = setTimeout(() => {
      shell.kill("SIGKILL");
      console.error("Process killed due to timeout");
    }, 5000);

    let stdout = "";
    const prompts = Object.entries(interactions);
    const promptsCount = prompts.length;
    let promptIndex = 0;
    const commands = {
      "Ctrl+C": "\u0003",
      "Ctrl+D": "\u0004"
    } as Record<string, string>;

    shell.onData((data) => {
      const output = stripAnsi(data);
      stdout += output;

      for (let i = promptIndex; i < promptsCount; i++) {
        const [prompt, input] = prompts[i];
        if (output.includes(prompt)) {
          shell.write(commands[input] ?? `${input}\n`);
          break;
        }
        promptIndex++;
      }
    });

    shell.onExit(({ exitCode }) => {
      clearTimeout(timeout);
      if (exitCode !== 0) {
        reject(new Error(`Command failed with exit code ${exitCode}`));
      } else {
        resolve(stdout);
      }
    });
  });
}
