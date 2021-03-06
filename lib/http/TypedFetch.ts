import Http from "./Http";

/**
 * A "Typed" fetch implementation of Http.
 */
export class TypedFetch implements Http {
  async execute<T>(url: string): Promise<T> {
    const response = await fetch(url);
    const asJson = await response.json();
    return asJson as T;
  }
}
