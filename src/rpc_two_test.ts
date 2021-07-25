import { Buffer } from "../deps.ts";
import { assertEquals } from "../dev_deps.ts";
import { createRPC, RPC } from "./rpc_two.ts";
import { createVSCodeIO, VSCodeIO } from "./vscode_io.ts";

/**
 * Internal function used to make test without repeating the same code
 * @param callback - Function to execute (your test)
 */
async function test(
  callback: (c: RPC, s: RPC) => void | Promise<void>,
): Promise<void> {
  const buffer1 = new Buffer();
  const buffer2 = new Buffer();

  const client: RPC = createRPC(createVSCodeIO(buffer1, buffer2));
  const server: RPC = createRPC(createVSCodeIO(buffer2, buffer1));

  client.start();
  server.start();

  await callback(client, server);

  client.stop();
  server.stop();
}

Deno.test("Request succeed", async () => {
  await test(
    async (client: RPC, server: RPC): Promise<void> => {
      server.onRequest("test", (params: unknown) => {
        return params;
      });

      const request = await client.sendRequest("test", "ok");

      assertEquals(request, "ok");
    },
  );
});

Deno.test("Request failed", async () => {
  await test(
    async (client: RPC, server: RPC): Promise<void> => {
      server.onRequest("test", (_) => {
        throw new Error();
      });

      try {
        await client.sendRequest("test", "ok");
      } catch (error) {
        assertEquals(error, server.createInternalError());
      }
    },
  );
});

Deno.test("Request method was not found", async () => {
  await test(
    async (client: RPC, server: RPC): Promise<void> => {
      try {
        await client.sendRequest("test", "ok");
      } catch (error) {
        assertEquals(error, server.createMethodNotFoundError());
      }
    },
  );
});

Deno.test("Notification", async () => {
  await test(
    async (client: RPC, server: RPC): Promise<void> => {
      server.onNotification("test", (params: unknown) => {
        assertEquals(params, "ok");
      });

      await client.sendNotification("test", "ok");
    },
  );
});
