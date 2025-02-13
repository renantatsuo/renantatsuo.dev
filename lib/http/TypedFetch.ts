import { HttpError } from "~/lib/http/HttpError";
import Http from "./Http";

/**
 * A "Typed" fetch implementation of Http.
 */
export class TypedFetch implements Http {
  async execute<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new HttpError(response.status, response.statusText);
    }
    const asJson = await response.json();
    return asJson as T;
  }
}
