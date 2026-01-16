import { ankiClient } from "../clients/ankiClient.js";
import { cleanWithRegex, formatQuery } from "./formatters.js";
import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { basename } from "path";

export interface Card {
  cardId: number;
  question: string;
  answer: string;
  due: number;
}

/**
 * Process a media file path - if it's a local file, store it in Anki's media collection
 * @param path - Path to the media file (local path or URL)
 * @param filename - Desired filename in Anki
 * @returns The filename that can be used in Anki
 */
async function processMediaFile(path: string, filename: string): Promise<string> {
  // If it's a URL, return as-is (Anki-Connect will handle it)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // If it's a local file path, we need to upload it to Anki's media collection
  if (existsSync(path)) {
    try {
      // Read the file and convert to base64
      const fileBuffer = await readFile(path);
      const base64Data = fileBuffer.toString('base64');
      
      // Store the file in Anki's media collection
      await ankiClient.media.storeMediaFile({
        filename: filename,
        data: base64Data
      });
      
      // Return the filename (now it's in Anki's media folder)
      return filename;
    } catch (error) {
      console.error(`Failed to process media file ${path}:`, error);
      throw new Error(`Failed to process media file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  // If file doesn't exist and it's not a URL, return the path as-is
  // (might be a file already in Anki's media folder)
  return path;
}

/**
 * Find cards based on query and return them ordered by due date
 * @param query - Anki search query
 * @returns Array of cards sorted by due date
 */
export async function findCardsAndOrder(query: string): Promise<Card[]> {
  const cardIds = await ankiClient.card.findCards({
    query: formatQuery(query)
  });
  const cards: Card[] = (await ankiClient.card.cardsInfo({ cards: cardIds })).map(card => ({
    cardId: card.cardId,
    question: cleanWithRegex(card.question),
    answer: cleanWithRegex(card.answer),
    due: card.due
  })).sort((a: Card, b: Card) => a.due - b.due);

  return cards;
}

/**
 * Get card information by card ID or search query
 * @param cardIdOrQuery - Either a card ID (number) or a search query (string)
 * @returns Card information including all fields and metadata
 */
export async function getCardInfo(cardIdOrQuery: number | string): Promise<any> {
  let cardIds: number[];

  // If it's a number, treat it as a card ID
  if (typeof cardIdOrQuery === 'number') {
    cardIds = [cardIdOrQuery];
  } else {
    // If it's a string, treat it as a search query
    cardIds = await ankiClient.card.findCards({
      query: formatQuery(cardIdOrQuery)
    });

    if (cardIds.length === 0) {
      throw new Error(`No cards found matching query: "${cardIdOrQuery}"`);
    }
  }

  // Get detailed card information
  const cardsInfo = await ankiClient.card.cardsInfo({ cards: cardIds });

  if (cardsInfo.length === 0) {
    throw new Error(`Card not found with ID: ${cardIdOrQuery}`);
  }

  // Format the card information
  const formattedCards = cardsInfo.map(card => ({
    cardId: card.cardId,
    deckName: card.deckName,
    modelName: card.modelName,
    question: cleanWithRegex(card.question),
    answer: cleanWithRegex(card.answer),
    fields: card.fields,
    due: card.due,
    interval: card.interval,
    ease: card.fieldOrder,
    reps: card.reps,
    lapses: card.lapses,
    type: card.type,
    queue: card.queue,
    noteId: card.note
  }));

  return formattedCards;
}

/**
 * Generic function to add a card to Anki
 * @param deckName - Name of the deck
 * @param modelName - Name of the note model
 * @param fields - Field values for the card
 * @param tags - Comma-separated tags
 * @param audio - Optional audio attachments
 * @param picture - Optional picture attachments
 * @returns Result object with card creation info
 */
export async function addCardGeneric(
  deckName: string,
  modelName: string,
  fields: Record<string, string>,
  tags: string,
  audio?: Array<{ filename: string; path: string; fields: string[] }>,
  picture?: Array<{ filename: string; path: string; fields: string[] }>
): Promise<any> {
  // Process audio files if provided
  let processedAudio = audio;
  if (audio && audio.length > 0) {
    processedAudio = await Promise.all(
      audio.map(async (item) => {
        const processedPath = await processMediaFile(item.path, item.filename);
        return {
          ...item,
          // If it's a local file that was uploaded, use filename instead of path
          ...(processedPath === item.filename ? { filename: item.filename } : { path: processedPath, filename: item.filename })
        };
      })
    );
  }

  // Process picture files if provided
  let processedPicture = picture;
  if (picture && picture.length > 0) {
    processedPicture = await Promise.all(
      picture.map(async (item) => {
        const processedPath = await processMediaFile(item.path, item.filename);
        return {
          ...item,
          // If it's a local file that was uploaded, use filename instead of path
          ...(processedPath === item.filename ? { filename: item.filename } : { path: processedPath, filename: item.filename })
        };
      })
    );
  }

  const note = {
    note: {
      deckName,
      modelName,
      fields,
      tags: tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
      audio: processedAudio,
      picture: processedPicture
    },
  };

  const noteId = await ankiClient.note.addNote(note);
  const cardId = (await ankiClient.card.findCards({ query: `nid:${noteId}` }))[0];

  return {
    content: [{
      type: "text",
      text: `Created card successfully in deck "${deckName}" with CardID ${cardId}`
    }]
  };
}

