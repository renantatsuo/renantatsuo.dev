import { HttpError } from "~/lib/http/HttpError";
import { HttpClient } from "./HttpClient";

/**
 * A "Typed" fetch implementation of Http.
 */
export class TypedFetch implements HttpClient {
  private async execute<T>(req: Request): Promise<T> {
    const response = await fetch(req);
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }
    try {
      const asJson = await response.json();
      return asJson as T;
    } catch (error) {
      throw new HttpError(500, "Failed to parse JSON response");
    }
  }

  async get<T>(url: string, opts?: RequestInit): Promise<T> {
    return this.execute<T>(new Request(url, { ...opts, method: "GET" }));
  }
}
