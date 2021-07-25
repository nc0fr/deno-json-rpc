/**
 * Parameters for the rpc call. **MUST be provided as a Structured value. Either by-position through an Array or by-name through an Object.
 */
export type Parameters = unknown | unknown[] | Record<string, unknown>;
/**
 * Types for an ID
 * The value **SHOULD** normally not be `Null` [1] and `Numbers` **SHOULD NOT** contain fractional parts [2]
 *
 * NOTES:
 *
 * [1] The use of Null as a value for the id member in a Request object is discouraged,
 * because this specification uses a value of Null for Responses with an unknown id.
 * Also, because JSON-RPC 1.0 uses an id value of Null for Notifications this could cause confusion in handling.
 * [2] Fractional parts may be problematic, since many decimal fractions cannot be represented exactly as binary fractions.
 */
export type ID = string | number | null;

/**
 * Represents a RPC call to a Server.
 */
export interface RequestObject {
  /**
   * A `String` specifying the version of the protocol. **MUST** be "2.0"
   */
  readonly jsonrpc: "2.0";
  /**
   * A `String` containing the name of the method to be invoked.
   * Method names that begin with the word rpc followed by a period character (U+002E or ASCII 46)
   * are reserved for rpc-internal methods and extensions and **MUST NOT** be used for anything else.
   */
  method: string;
  /**
   * A Structured value that holds the parameter values to be used during the invocation of the method. This member **MAY** be omitted.
   */
  params?: Parameters;
  /**
   * An identifier established by the Client that **MUST** contain a `String`, `Number`, or `NULL` value if included.
   * If it is not included it is assumed to be a notification.
   * The value **SHOULD** normally not be `Null` [1] and `Numbers` **SHOULD NOT** contain fractional parts [2]
   *
   * NOTES:
   *
   * [1] The use of Null as a value for the id member in a Request object is discouraged,
   * because this specification uses a value of Null for Responses with an unknown id.
   * Also, because JSON-RPC 1.0 uses an id value of Null for Notifications this could cause confusion in handling.
   * [2] Fractional parts may be problematic, since many decimal fractions cannot be represented exactly as binary fractions.
   */
  id: ID;
}

/**
 * A Notification is a Request object without an "id" member.
 * A Request object that is a Notification signifies the Client's lack of interest in the corresponding Response object,
 * and as such no Response object needs to be returned to the client.
 * The Server **MUST NOT** reply to a Notification, including those that are within a batch request.
 *
 * Notifications are not confirmable by definition, since they do not have a Response object to be returned.
 * As such, the Client would not be aware of any errors (like e.g. "Invalid params","Internal error").
 */
export type Notification = {
  /**
   * A `String` specifying the version of the protocol. **MUST** be "2.0"
   */
  readonly jsonrpc: "2.0";
  /**
   * A `String` containing the name of the method to be invoked.
   * Method names that begin with the word rpc followed by a period character (U+002E or ASCII 46)
   * are reserved for rpc-internal methods and extensions and **MUST NOT** be used for anything else.
   */
  method: string;
  /**
   * A Structured value that holds the parameter values to be used during the invocation of the method. This member **MAY** be omitted.
   */
  params?: Parameters;
};

/**
 * When a rpc call encounters an error.
 */
export interface ErrorObject {
  /**
   * A `Number` that indicates the error type that occurred.
   */
  code: number;
  /**
   * A `String` providing a short description of the error.
   */
  message: string;
  /**
   * A Primitive or Structured value that contains additional information about the error.
   * The value of this member is defined by the Server (e.g. detailed error information, nested errors etc.).
   */
  data?: unknown;
}

/**
 * When a rpc call is made, the Server **MUST** reply with a Response, except for in the case of Notifications.
 */
export interface ResponseObject {
  /**
   * A `String` specifying the version of the protocol. **MUST** be "2.0"
   */
  readonly jsonrpc: "2.0";
  /**
    * The value of this member is determined by the method invoked on the Server.
    * **REQUIRED** on success, **MUST NOT** exit if there was an error invoking the method.
    */
  result?: unknown;
  /**
    * When a rpc call encounters an error.
    * **REQUIRED** on error, **MUST NOT** exit if there was no an error invoking the method.
    */
  error?: ErrorObject;
  /**
    * It **MUST** be the same as the value of the id member in the Request Object.
    * If there was an error in detecting the id in the Request object (e.g. Parse error/Invalid Request), it **MUST** be `Null`.
    */
  id: ID;
}

/**
 * Represents I/O
 */
export interface IO {
  /**
   * Receive and resolve messages
   * @returns the message
   */
  read(): Promise<string | void>;
  /**
   * Send a message
   * @param message
   */
  write(message: string): Promise<void>;
}

/**
 * Type for listeners
 */
export type ListenerFunction = (
  ...params: unknown[]
) => unknown | Promise<unknown>;

export interface UnresolvedRequest {
  resolve(v: unknown): void;
  reject(v: unknown): void;
}

/**
 * Represents a RPC Actor (Client/Server)
 */
export interface RPC {
  /**
   * I/O
   */
  _io: IO;
  /**
   * Whether or not the Actor is running
   */
  _isRunning: boolean;
  /**
   * ID of the last send request
   */
  _requestID: number;
  /**
   * Functions to execute when receiving a request with a specific method
   */
  _requestListeners: Map<string, ListenerFunction>;
  /**
   * Functions to execute when receiving a notification with a specific method
   */
  _notificationListeners: Map<string, ListenerFunction>;
  /**
   * Internal store of requests sent by this actor which are not resolved yet
   */
  _unresolvedRequests: Map<number, UnresolvedRequest>;
  /**
   * Internal function which handles received messages
   * @param msg - received msg
   * @returns Returns the response of a request, otherwise does not return
   */
  _handleMessage(msg: string): Promise<void | ResponseObject>;
  /**
   * Internal function which handles received requests
   * @param msg - received msg
   */
  _handleRequest(msg: RequestObject): Promise<void>;
  /**
   * Internal function which handles received notifications
   * @param msg - received msg
   */
  _handleNotification(msg: Notification): Promise<void>;
  /**
   * Internal function which handles received responses
   * @param msg - received msg
   */
  _handleResponse(msg: ResponseObject): void;
  /**
   * Internal function to write to the Output
   * @param msg - msg
   */
  _write(msg: unknown): Promise<void>;
  /**
   * Add a listener to execute when receiving a request
   * @param method - The method to attach the listener to
   * @param listener - The function to execute
   * @returns Index of the listener in the array
   */
  onRequest(method: string, listener: ListenerFunction): void;
  /**
   * Add a listener to execute when receiving a notification
   * @param method - The method to attach the listener to
   * @param listener - The function to execute
   * @returns Index of the listener in the array
   */
  onNotification(method: string, listener: ListenerFunction): void;
  /**
   * Request the recipient
   * @param method - method
   * @param params - params
   */
  sendRequest(
    method: string,
    params: RequestObject["params"],
  ): Promise<UnresolvedRequest>;
  /**
   * Notify the recipient
   * @param method - method
   * @param params - params
   */
  sendNotification(
    method: string,
    params: RequestObject["params"],
  ): Promise<void>;
  /**
   * Reply to the recipient
   * @param id - request id
   * @param result - result. Set to `undefined` if an error occured
   * @param error - error. Set to `undefined` if no error occured
   */
  sendResponse(
    id: number | null,
    result: ResponseObject["result"],
    error: ResponseObject["error"],
  ): Promise<void>;
  /**
   * Create a RPC error for a response.
   * Some Errors are pre-defined by this implemenation or the protocol, use them instead of custom errors if they serve the same purprose!
   * @param code - error code
   * @param message - message
   * @param data - Primitive or structured data in addition of the message (stack...)
   */
  createError(
    code: ErrorObject["code"],
    message: ErrorObject["message"],
    data: ErrorObject["data"],
  ): ErrorObject;
  /**
   * Create a Parse Error.
   * See https://www.jsonrpc.org/specification#error_object
   */
  createParseError(): ErrorObject;
  /**
   * Create an Invalid Request error.
   * See https://www.jsonrpc.org/specification#error_object
   */
  createInvalidRequestError(): ErrorObject;
  /**
   * Create an Method not found error.
   * See https://www.jsonrpc.org/specification#error_object
   */
  createMethodNotFoundError(): ErrorObject;
  /**
   * Create an Invalid params error.
   * See https://www.jsonrpc.org/specification#error_object
   */
  createInvalidParamsError(): ErrorObject;
  /**
   * Create an Internal error error.
   * See https://www.jsonrpc.org/specification#error_object
   */
  createInternalError(): ErrorObject;
  /**
   * Start the RPC
   */
  start(): Promise<void>;
  /**
   * Stop the RPC
   */
  stop(): void;
}

// Using `function`-keyword allows us to access `this`
/**
 * Create a RPC actor
 * @param io - I/O
 */
export function createRPC(io: IO): RPC {
  return {
    _io: io,
    _isRunning: false,
    _notificationListeners: new Map<string, ListenerFunction>(),
    _requestID: 0,
    _requestListeners: new Map<string, ListenerFunction>(),
    _unresolvedRequests: new Map<number, UnresolvedRequest>(),

    _handleMessage: async function (
      msg: string,
    ): Promise<void | ResponseObject> {
      try {
        const message = JSON.parse(msg);
        // check if the message is a notification (no id), request (method + id) or an error (id + result/error)
        if ("id" in message) {
          if ("method" in message) {
            await this._handleRequest(message);
          } else {
            return await this._handleResponse(message);
          }
        } else {
          await this._handleNotification(message);
        }
      } catch (_error) {
        // In case we can't parse the JSON
        await this.sendResponse(null, undefined, this.createParseError());
      }
    },

    _handleNotification: async function (
      msg: Notification,
    ): Promise<void> {
      // On notification, the implemenation should not care about errors (Invalid method...)
      if (!this._notificationListeners.has(msg.method)) return;
      try {
        await (this._notificationListeners.get(msg.method) as ListenerFunction)(
          msg.params,
        );
      } catch (error) {
        throw error;
      }
    },

    _handleRequest: async function (
      msg: RequestObject,
    ): Promise<void> {
      // we assume that every registered methods for requestListeners are all of the method the actor can receive
      if (!this._requestListeners.has(msg.method)) {
        await this.sendResponse(
          Number(msg.id),
          undefined,
          this.createMethodNotFoundError(),
        );
      } else {
        // we run the listener attached to the method
        const listener: ListenerFunction = this._requestListeners.get(
          msg.method,
        ) as ListenerFunction;
        try {
          const result = await listener(msg.params);

          await this.sendResponse(Number(msg.id), result, undefined);
        } catch (error) {
          await this.sendResponse(
            Number(msg.id),
            undefined,
            this.createInternalError(),
          );

          throw error;
        }
      }
    },

    _handleResponse: function (
      msg: ResponseObject,
    ): void {
      const storedRequest: UnresolvedRequest | undefined = this
        ._unresolvedRequests.get(Number(msg.id));

      if (storedRequest) {
        "error" in msg
          ? storedRequest.reject(msg.error)
          : storedRequest.resolve(msg.result);
        this._unresolvedRequests.delete(Number(msg.id));
      }
    },

    _write: async function (msg: unknown): Promise<void> {
      await this._io.write(JSON.stringify(msg));
    },

    onNotification: function (
      method: string,
      listener: ListenerFunction,
    ): void {
      if (this._notificationListeners.has(method)) {
        throw new Error(
          `Method ${method} already has a notification listener!`,
        );
      } else {
        this._notificationListeners.set(method, listener);
      }
    },

    onRequest: function (
      method: string,
      listener: ListenerFunction,
    ): void {
      if (this._requestListeners.has(method)) {
        throw new Error(
          `Method ${method} already has a request listener!`,
        );
      } else {
        this._requestListeners.set(method, listener);
      }
    },

    createError: function (
      code: number,
      message: string,
      data: unknown,
    ): ErrorObject {
      return {
        code,
        message,
        data,
      };
    },

    createInternalError: function (): ErrorObject {
      return {
        code: -32603,
        message: "Internal error",
      };
    },

    createInvalidParamsError: function (): ErrorObject {
      return {
        code: -32602,
        message: "Invalid params",
      };
    },

    createInvalidRequestError: function (): ErrorObject {
      return {
        code: -32600,
        message: "Invalid Request",
      };
    },

    createMethodNotFoundError: function (): ErrorObject {
      return {
        code: -32601,
        message: "Method not found",
      };
    },

    createParseError: function (): ErrorObject {
      return {
        code: -32700,
        message: "Parse error",
      };
    },

    sendNotification: async function (
      method: string,
      params: Parameters | undefined,
    ): Promise<void> {
      const notification: Notification = {
        jsonrpc: "2.0",
        method,
        params,
      };
      await this._write(notification);
    },

    sendRequest: function (
      method: string,
      params: Parameters | undefined,
    ): Promise<UnresolvedRequest> {
      this._requestID++;
      const request: RequestObject = {
        jsonrpc: "2.0",
        id: this._requestID,
        method,
        params,
      };

      return new Promise((resolve, reject) => {
        this._unresolvedRequests.set(this._requestID, { resolve, reject });
        this._write(request);
      });
    },

    sendResponse: async function (
      id: number | null,
      result: unknown,
      error: ErrorObject | undefined,
    ): Promise<void> {
      const response: ResponseObject = {
        jsonrpc: "2.0",
        id,
      };

      if (error) {
        response.error = error;
      } else {
        response.result = result || [];
      }

      await this._write(response);
    },

    start: async function (): Promise<void> {
      this._isRunning = true;
      while (true) {
        if (!this._isRunning) break;
        const msg = await this._io.read();
        if (msg) this._handleMessage(msg);
      }
    },

    stop: function (): void {
      this._isRunning = false;
    },
  };
}
