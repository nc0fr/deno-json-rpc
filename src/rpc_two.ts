/**
 * Parameters for the rpc call. **MUST be provided as a Structured value. Either by-position through an Array or by-name through an Object.
 */
export type Parameter = unknown[] | Record<string, unknown>;
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
  params?: Parameter;
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
export type Notification = Omit<Request, "id">;

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

// todo(n1c00o) !!! PREDEFINED ERRORS https://www.jsonrpc.org/specification#error_object !!!

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
