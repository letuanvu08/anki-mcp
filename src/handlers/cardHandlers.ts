import { ankiClient } from "../clients/index.js";
import {
  findCardsAndOrder,
  getCardInfo,
  addCardGeneric
} from "../utils/index.js";

/**
 * Handler for update_card tool (generic update)
 */
export async function handleUpdateCard(args: any) {
  const { operation, cardId, noteId, ease, fields, tags, audio, picture } = args as {
    operation: "answer" | "update_note" | "update_fields" | "update_tags";
    cardId?: number;
    noteId?: number;
    ease?: number;
    fields?: Record<string, string>;
    tags?: string[];
    audio?: Array<{ filename: string; path: string; fields: string[] }>;
    picture?: Array<{ filename: string; path: string; fields: string[] }>;
  };

  switch (operation) {
    case "answer": {
      if (!cardId || !ease) {
        throw new Error("cardId and ease are required for 'answer' operation");
      }
      
      const result = await ankiClient.card.answerCards({ 
        answers: [{ cardId, ease }] 
      });

      if (!result[0]) {
        throw new Error(`Failed to answer card with ID: ${cardId}`);
      }

      return {
        content: [{
          type: "text",
          text: `Successfully answered card ${cardId} with ease ${ease}`
        }]
      };
    }

    case "update_note": {
      if (!noteId || !fields) {
        throw new Error("noteId and fields are required for 'update_note' operation");
      }

      const noteData: any = {
        id: noteId,
        fields
      };

      if (tags) {
        noteData.tags = tags;
      }

      if (audio) {
        noteData.audio = audio.map(item => ({
          path: item.path,
          filename: item.filename,
          fields: item.fields
        }));
      }

      if (picture) {
        noteData.picture = picture.map(item => ({
          path: item.path,
          filename: item.filename,
          fields: item.fields
        }));
      }

      await ankiClient.note.updateNote({ note: noteData });

      return {
        content: [{
          type: "text",
          text: `Successfully updated note ${noteId}`
        }]
      };
    }

    case "update_fields": {
      if (!noteId || !fields) {
        throw new Error("noteId and fields are required for 'update_fields' operation");
      }

      const noteData: any = {
        id: noteId,
        fields
      };

      if (audio) {
        noteData.audio = audio.map(item => ({
          path: item.path,
          filename: item.filename,
          fields: item.fields
        }));
      }

      if (picture) {
        noteData.picture = picture.map(item => ({
          path: item.path,
          filename: item.filename,
          fields: item.fields
        }));
      }

      await ankiClient.note.updateNoteFields({ note: noteData });

      return {
        content: [{
          type: "text",
          text: `Successfully updated fields for note ${noteId}`
        }]
      };
    }

    case "update_tags": {
      if (!noteId || !tags) {
        throw new Error("noteId and tags are required for 'update_tags' operation");
      }

      await ankiClient.note.updateNoteTags({ 
        note: noteId, 
        tags 
      });

      return {
        content: [{
          type: "text",
          text: `Successfully updated tags for note ${noteId} to: ${tags.join(", ")}`
        }]
      };
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

/**
 * Handler for get_due_cards tool
 */
export async function handleGetDueCards(args: any) {
  const num = Number(args.num);
  const cards = await findCardsAndOrder("is:due");
  const selectedCards = cards.slice(0, num);

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        count: selectedCards.length,
        cards: selectedCards
      }, null, 2)
    }]
  };
}

/**
 * Handler for get_new_cards tool
 */
export async function handleGetNewCards(args: any) {
  const num = Number(args.num);
  const cards = await findCardsAndOrder("is:new");
  const selectedCards = cards.slice(0, num);

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        count: selectedCards.length,
        cards: selectedCards
      }, null, 2)
    }]
  };
}

/**
 * Handler for get_card tool
 */
export async function handleGetCard(args: any) {
  const { cardId, query } = args as {
    cardId?: number;
    query?: string;
  };

  // Validate that exactly one of cardId or query is provided
  if (!cardId && !query) {
    throw new Error("Either cardId or query must be provided");
  }

  if (cardId && query) {
    throw new Error("Only one of cardId or query can be provided, not both");
  }

  // Get card information
  const cards = await getCardInfo(cardId || query!);

  return {
    content: [{
      type: "text",
      text: JSON.stringify(cards, null, 2)
    }]
  };
}

/**
 * Handler for add_card tool (generic)
 */
export async function handleAddCard(args: any) {
  const {
    deckName,
    modelName,
    fields,
    tags = "",
    audio,
    picture
  } = args as {
    deckName: string;
    modelName: string;
    fields: Record<string, string>;
    tags?: string;
    audio?: Array<{ filename: string; path: string; fields: string[] }>;
    picture?: Array<{ filename: string; path: string; fields: string[] }>;
  };
  
  return await addCardGeneric(
    deckName,
    modelName,
    fields,
    tags,
    audio,
    picture
  );
}


/**
 * Handler for batch_add_card tool (generic)
 */
export async function handleBatchAddCard(args: any) {
  const cards = args.cards as Array<{
    deckName: string;
    modelName: string;
    fields: Record<string, string>;
    tags?: string;
    audio?: Array<{ filename: string; path: string; fields: string[] }>;
    picture?: Array<{ filename: string; path: string; fields: string[] }>;
  }>;

  const results = [];
  const errors = [];

  for (const card of cards) {
    try {
      const result = await addCardGeneric(
        card.deckName,
        card.modelName,
        card.fields,
        card.tags || "",
        card.audio,
        card.picture
      );
      results.push(result);
    } catch (error) {
      errors.push({
        card: `${card.deckName}/${card.modelName}`,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        successful: results.length,
        failed: errors.length,
        errors: errors
      })
    }]
  };
}


