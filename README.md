# deno-json-rpc

Deno implementation of [JSON-RPC Specification](https://www.jsonrpc.org/).
Currently support **Spec 2.0**.

## Usage

Import the module in your TypeScript file.

```ts
import {
  createRPC,
  RPC,
} from "https://deno.land/x/deno_json_rpc/src/rpc_two.ts";
// vscode_io is an implementation of VSCode-style I/O.
import {
  createVSCodeIO,
} from "https://deno.land/x/deno_json_rpc/src/vscode_io.ts";

// Create your RPC actor
const rpc: RPC = createRPC(createVSCodeIO(Deno.stdin, Deno.stdout));

// add a listener for methods you will receive (requests/notifications)
rpc.onRequest("CalculateOneAndOne", (_params: unknown) => {
  // Will automatically respond, assuming the return as the result
  return 1 + 1;
});

// Start the service
rpc.start();
```

## Documentation

Documentation is available on
[doc.deno.land](https://doc.deno.land/https/deno.land%2Fx%2Fdeno_json_rpc%2Fsrc%2Frpc_two.ts).

## License

Project under the MIT License, read [LICENSE](LICENSE) for more information.
