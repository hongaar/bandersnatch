import { command, program } from "../src/index.js";

let url: string | null = null;

const app = program();

app
  .add(
    command("connect")
      .description("Connect to a server")
      .argument("host", {
        default: "example.com",
        prompt: true,
      })
      .argument("port", {
        default: 443,
        prompt: true,
      })
      .argument("tls", {
        default: true,
        prompt: true,
      })
      .option("protocol", {
        default: "http",
        choices: ["http", "ftp", "imap", "ldap", "pop3"] as const,
      })
      .option("timeout", {
        default: 60,
      })
      .action(async ({ host, port, tls, protocol, timeout }) => {
        url = `${protocol}${tls && "s"}://${host}:${port}`;
        console.log(`Connecting to ${url} (timeout set to ${timeout}s)...`);
        app.options.prompt = `${host} > `;
      })
  )
  .add(
    command("disconnect")
      .description("Disconnect from a server")
      .action(async () => {
        if (!url) {
          throw new Error("Not connected");
        }

        console.log(`Disconnecting from ${url}...`);
        app.options.prompt = "> ";
        url = null;
      })
  );

app.runOrRepl();
