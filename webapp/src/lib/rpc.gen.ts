/* eslint-disable */
// snake v1.0.0 9af3bdb7a6a5d6d0bad1e1f111f61bbf213c2e2f
// --
// Code generated by webrpc-gen@v0.14.0-dev with ../../gen-typescript generator. DO NOT EDIT.
//
// webrpc-gen -schema=proto/snake.ridl -target=../../gen-typescript -client -out=webapp/src/lib/rpc.gen.ts

// WebRPC description and code-gen version
export const WebRPCVersion = "v1"

// Schema version of your RIDL schema
export const WebRPCSchemaVersion = "v1.0.0"

// Schema hash generated from your RIDL schema
export const WebRPCSchemaHash = "9af3bdb7a6a5d6d0bad1e1f111f61bbf213c2e2f"

//
// Types
//


export enum Direction {
  left = 'left',
  right = 'right',
  up = 'up',
  down = 'down'
}

export enum ItemType {
  bite = 'bite'
}

export interface State {
  width: number
  height: number
  snakes: {[key: number]: Snake}
  items: {[key: number]: Item}
}

export interface Snake {
  id: number
  name: string
  color: string
  body: Array<Square>
  direction: Direction
}

export interface Item {
  id: number
  color: string
  type: ItemType
  body: Square
}

export interface Event {
}

export interface Square {
  x: number
  y: number
}

export interface SnakeGame {
  joinGame(options: WebrpcStreamOptions<JoinGameReturn>): Promise<void>
  createSnake(args: CreateSnakeArgs, options?: WebrpcOptions): Promise<CreateSnakeReturn>
  turnSnake(args: TurnSnakeArgs, options?: WebrpcOptions): Promise<TurnSnakeReturn>
}

export interface JoinGameArgs {
}

export interface JoinGameReturn {
  state: State
  event: Event  
}
export interface CreateSnakeArgs {
  username: string
}

export interface CreateSnakeReturn {
  snakeId: number  
}
export interface TurnSnakeArgs {
  snakeId: number
  direction: Direction
}

export interface TurnSnakeReturn {  
}


  
//
// Client
//
export class SnakeGame implements SnakeGame {
  protected hostname: string
  protected fetch: Fetch
  protected path = '/rpc/SnakeGame/'

  constructor(hostname: string, fetch: Fetch) {
    this.hostname = hostname
    this.fetch = (input: RequestInfo, init?: RequestInit) => fetch(input, init)
  }

  private url(name: string): string {
    return this.hostname + this.path + name
  }
  
    joinGame = (options: WebrpcStreamOptions<JoinGameReturn>): Promise<void> => {
      return this.fetch(this.url('JoinGame'),createHTTPRequest({}, options)).then(
      async(res) => {
        await sseResponse(res, options)
      },
      (error) => {
        options.onError(error)
      })
    }
  
    createSnake = (args: CreateSnakeArgs, options?: WebrpcOptions): Promise<CreateSnakeReturn> => {
      return this.fetch(this.url('CreateSnake'),createHTTPRequest(args, options)).then((res) => {
        return buildResponse(res).then(_data => {
          return {
            snakeId: <number>(_data.snakeId),
          }
        })}, (error) => {throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })})
    }
  
    turnSnake = (args: TurnSnakeArgs, options?: WebrpcOptions): Promise<TurnSnakeReturn> => {
      return this.fetch(this.url('TurnSnake'),createHTTPRequest(args, options)).then((res) => {
        return buildResponse(res).then(_data => {
          return {}
        })}, (error) => {throw WebrpcRequestFailedError.new({ cause: `fetch(): ${error.message || ''}` })})
    }
  
}

    
const sseResponse = async (
    res: Response,
    options: WebrpcStreamOptions<any>
) => {
    const {onMessage, onOpen, onClose, onError} = options;

    if (!res.ok) {
        try {
            await buildResponse(res);
        } catch (error) {
            onError(error as WebrpcError);
        }
        return;
    }

    if (!res.body) {
        onError(
            WebrpcBadResponseError.new({
                status: res.status,
                cause: "Invalid response, missing body",
            })
        );
        return;
    }

    onOpen && onOpen();

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    const timeout = (10 + 1) * 1000;

    while (true) {
        let value;
        let done;
        try {
            //@ts-ignore
            ({value, done} = await Promise.race([
                reader.read(),
                new Promise((_, reject) =>
                    setTimeout(
                        () =>
                            reject(WebrpcStreamLostError.new({cause: "Stream timed out"})),
                        timeout
                    )
                ),
            ]));
            buffer += decoder.decode(value, {stream: true});
        } catch (error) {
            let message = "";
            if (error instanceof Error) {
                message = error.message;
            }

            if (error instanceof WebrpcStreamLostError) {
                onError(error);
            } else if (error instanceof DOMException && error.name === "AbortError") {
                onError(
                    WebrpcRequestFailedError.new({
                        message: "AbortError",
                        cause: `AbortError: ${message}`,
                    })
                );
            } else {
                onError(
                    WebrpcStreamLostError.new({
                        cause: `reader.read(): ${message}`,
                    })
                );
            }
            return;
        }

        let lines = buffer.split("\n");
        for (let i = 0; i < lines.length - 1; i++) {
            if (lines[i].length == 0) {
                continue;
            }
            try {
                let data = JSON.parse(lines[i]);
                if (data.hasOwnProperty("webrpcError")) {
                    const error = data.webrpcError;
                    const code: number = typeof error.code === "number" ? error.code : 0;
                    onError((webrpcErrorByCode[code] || WebrpcError).new(error));
                } else {
                    onMessage(data);
                }
            } catch (error) {
                let message = "";
                if (error instanceof Error) {
                    message = error.message;
                }
                onError(
                    WebrpcBadResponseError.new({
                        status: res.status,
                        cause: `JSON.parse(): ${message}`,
                    })
                );
            }
        }

        if (!done) {
            buffer = lines[lines.length - 1];
            continue;
        }

        onClose && onClose();
        return;
    }
};

  
  const createHTTPRequest = (body: object = {}, options?: WebrpcOptions): object => {
  return {
    method: 'POST',
    headers: { ...options?.headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body || {}),
    signal: options?.signal
  }
}

const buildResponse = (res: Response): Promise<any> => {
  return res.text().then(text => {
    let data
    try {
      data = JSON.parse(text)
    } catch(error) {
      let message = ''
      if (error instanceof Error)  {
        message = error.message
      }
      throw WebrpcBadResponseError.new({
        status: res.status,
        cause: `JSON.parse(): ${message}: response text: ${text}`},
      )
    }
    if (!res.ok) {
      const code: number = (typeof data.code === 'number') ? data.code : 0
      throw (webrpcErrorByCode[code] || WebrpcError).new(data)
    }
    return data
  })
}

//
// Errors
//

export class WebrpcError extends Error {
  name: string
  code: number
  message: string
  status: number
  cause?: string

  /** @deprecated Use message instead of msg. Deprecated in webrpc v0.11.0. */
  msg: string

  constructor(name: string, code: number, message: string, status: number, cause?: string) {
    super(message)
    this.name = name || 'WebrpcError'
    this.code = typeof code === 'number' ? code : 0
    this.message = message || `endpoint error ${this.code}`
    this.msg = this.message
    this.status = typeof status === 'number' ? status : 0
    this.cause = cause
    Object.setPrototypeOf(this, WebrpcError.prototype)
  }

  static new(payload: any): WebrpcError {
    return new this(payload.error, payload.code, payload.message || payload.msg, payload.status, payload.cause)
  }
}

// Webrpc errors

export class WebrpcEndpointError extends WebrpcError {
  constructor(
    name: string = 'WebrpcEndpoint',
    code: number = 0,
    message: string = `endpoint error`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcEndpointError.prototype)
  }
}

export class WebrpcRequestFailedError extends WebrpcError {
  constructor(
    name: string = 'WebrpcRequestFailed',
    code: number = -1,
    message: string = `request failed`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcRequestFailedError.prototype)
  }
}

export class WebrpcBadRouteError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadRoute',
    code: number = -2,
    message: string = `bad route`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadRouteError.prototype)
  }
}

export class WebrpcBadMethodError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadMethod',
    code: number = -3,
    message: string = `bad method`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadMethodError.prototype)
  }
}

export class WebrpcBadRequestError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadRequest',
    code: number = -4,
    message: string = `bad request`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadRequestError.prototype)
  }
}

export class WebrpcBadResponseError extends WebrpcError {
  constructor(
    name: string = 'WebrpcBadResponse',
    code: number = -5,
    message: string = `bad response`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcBadResponseError.prototype)
  }
}

export class WebrpcServerPanicError extends WebrpcError {
  constructor(
    name: string = 'WebrpcServerPanic',
    code: number = -6,
    message: string = `server panic`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcServerPanicError.prototype)
  }
}

export class WebrpcInternalErrorError extends WebrpcError {
  constructor(
    name: string = 'WebrpcInternalError',
    code: number = -7,
    message: string = `internal error`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcInternalErrorError.prototype)
  }
}

export class WebrpcClientDisconnectedError extends WebrpcError {
  constructor(
    name: string = 'WebrpcClientDisconnected',
    code: number = -8,
    message: string = `client disconnected`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcClientDisconnectedError.prototype)
  }
}

export class WebrpcStreamLostError extends WebrpcError {
  constructor(
    name: string = 'WebrpcStreamLost',
    code: number = -9,
    message: string = `stream lost`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcStreamLostError.prototype)
  }
}

export class WebrpcStreamFinishedError extends WebrpcError {
  constructor(
    name: string = 'WebrpcStreamFinished',
    code: number = -10,
    message: string = `stream finished`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, WebrpcStreamFinishedError.prototype)
  }
}


// Schema errors

export class ErrorTODOError extends WebrpcError {
  constructor(
    name: string = 'ErrorTODO',
    code: number = 100,
    message: string = `TODO`,
    status: number = 0,
    cause?: string
  ) {
    super(name, code, message, status, cause)
    Object.setPrototypeOf(this, ErrorTODOError.prototype)
  }
}


export enum errors {
  WebrpcEndpoint = 'WebrpcEndpoint',
  WebrpcRequestFailed = 'WebrpcRequestFailed',
  WebrpcBadRoute = 'WebrpcBadRoute',
  WebrpcBadMethod = 'WebrpcBadMethod',
  WebrpcBadRequest = 'WebrpcBadRequest',
  WebrpcBadResponse = 'WebrpcBadResponse',
  WebrpcServerPanic = 'WebrpcServerPanic',
  WebrpcInternalError = 'WebrpcInternalError',
  WebrpcClientDisconnected = 'WebrpcClientDisconnected',
  WebrpcStreamLost = 'WebrpcStreamLost',
  WebrpcStreamFinished = 'WebrpcStreamFinished',
  ErrorTODO = 'ErrorTODO',
}

const webrpcErrorByCode: { [code: number]: any } = {
  [0]: WebrpcEndpointError,
  [-1]: WebrpcRequestFailedError,
  [-2]: WebrpcBadRouteError,
  [-3]: WebrpcBadMethodError,
  [-4]: WebrpcBadRequestError,
  [-5]: WebrpcBadResponseError,
  [-6]: WebrpcServerPanicError,
  [-7]: WebrpcInternalErrorError,
  [-8]: WebrpcClientDisconnectedError,
  [-9]: WebrpcStreamLostError,
  [-10]: WebrpcStreamFinishedError,
  [100]: ErrorTODOError,
}

export type Fetch = (input: RequestInfo, init?: RequestInit) => Promise<Response>

export interface WebrpcOptions {
  headers?: HeadersInit;
  signal?: AbortSignal;
}


export interface WebrpcStreamOptions<T> extends WebrpcOptions {
  onMessage: (message: T) => void;
  onError: (error: WebrpcError) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

