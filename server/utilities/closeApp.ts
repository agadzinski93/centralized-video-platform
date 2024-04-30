import { Server } from "http";

function terminate(server: Server, options = { coredump: false, timeout: 500 }) {
  const exit = (code: any): void => {
    options.coredump ? process.abort() : process.exit(code)
  }
  return (code: number, reason: string) => (err: Error, promise: Promise<any>) => {
    if (err && err instanceof Error) {
      console.error(`${new Date().toString()} -> App Init Failure: ${err.stack}`);
    }
    server.close()
    setTimeout(exit, options.timeout).unref()
  }
}

export {
  terminate
};