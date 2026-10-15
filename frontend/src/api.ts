/** A client instance keeps its session token private to one workspace lifecycle. */
export function createApiClient() {
  let csrf = "";
  return {
    setCsrf(value: string) {
      csrf = value;
    },
    async request<T>(
      path: string,
      method = "GET",
      body?: unknown,
      signal?: AbortSignal,
    ): Promise<T> {
      const response = await fetch(path, {
        method,
        signal,
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Request failed. Please try again.");
      }
      return response.status === 204 ? (undefined as T) : response.json();
    },
  };
}
