import { findCardsAndOrder } from "../utils/index.js";

/**
 * Handler for listing all available Anki card resources
 */
export function handleListResources() {
  return {
    resources: [
      {
        uri: "anki://search/deckcurrent",
        mimeType: "application/json",
        name: "Current Deck",
        description: "Current Anki deck"
      },
      {
        uri: "anki://search/isdue",
        mimeType: "application/json",
        name: "Due cards",
        description: "Cards in review and learning waiting to be studied"
      },
      {
        uri: "anki://search/isnew",
        mimeType: "application/json",
        name: "New cards",
        description: "All unseen cards"
      }
    ]
  };
}

/**
 * Handler for reading a specific resource by URI
 */
export async function handleReadResource(uri: string) {
  const url = new URL(uri);
  const query = url.pathname.split("/").pop();
  
  if (!query) {
    throw new Error("Invalid resource URI");
  }

  const cards = await findCardsAndOrder(query);

  return {
    contents: [{
      uri: uri,
      mimeType: "application/json",
      text: JSON.stringify(cards)
    }]
  };
}
