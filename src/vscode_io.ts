import { IO } from "./rpc_two.ts";
import { readLines } from "../deps.ts";

/**
 * VSCode-like implemenation of JSON-RPC I/O
 */
export interface VSCodeIO extends IO {
  _encoder: TextEncoder;
  _decoder: TextDecoder;
  _reader: Deno.Reader;
  _writer: Deno.Writer;
  _lines: AsyncIterableIterator<string>;
  write(message: string): Promise<void>;
  read(): Promise<string | void>;
}

/**
 * Create a VSCode-like I/O implemenation
 * @param reader - reader
 * @param writer - writer
 * @returns the implementation
 */
export function createVSCodeIO(
  reader: Deno.Reader,
  writer: Deno.Writer,
): VSCodeIO {
  return {
    _decoder: new TextDecoder(),
    _encoder: new TextEncoder(),
    _reader: reader,
    _writer: writer,
    _lines: readLines(reader),

    read: async function (): Promise<string | void> {
      const line = await lines.next();
      if (line.done) return decoder.decode();
      return line.value;
    },

    write: async function (m: string): Promise<void> {
      await this._writer.write(this._encoder.encode(m));
    },
  };
}
