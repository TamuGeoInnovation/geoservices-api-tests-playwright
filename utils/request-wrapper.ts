export function req(url: string) {
  const urlWithApiKey = new URL(url);
  urlWithApiKey.searchParams.set("apiKey", process.env.API_KEY || "demo");

  return fetch(urlWithApiKey.toString(), {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      throw error;
    });
}

export interface RequestOptions {
  apiKey?: string;
}
