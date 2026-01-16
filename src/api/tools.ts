/**
 * Tool definitions for the MCP server
 */

export const TOOL_DEFINITIONS = [
  {
    name: "update_card",
    description: "Update a card/note in Anki. Supports 4 operations: (1) 'answer': mark a card as reviewed with ease 1-4, (2) 'update_note': update note fields, tags, and media, (3) 'update_fields': update only fields and media, (4) 'update_tags': update only tags. Returns success message with operation details.",
    inputSchema: {
      type: "object",
      properties: {
        operation: {
          type: "string",
          enum: ["answer", "update_note", "update_fields", "update_tags"],
          description: "Required. Operation type: 'answer' (requires cardId + ease), 'update_note' (requires noteId + fields, optional tags/audio/picture), 'update_fields' (requires noteId + fields, optional audio/picture), 'update_tags' (requires noteId + tags array)"
        },
        cardId: {
          type: "number",
          description: "Card ID - REQUIRED for 'answer' operation only. Use get_card to find card IDs."
        },
        noteId: {
          type: "number",
          description: "Note ID - REQUIRED for 'update_note', 'update_fields', and 'update_tags' operations. Use get_card to find note IDs."
        },
        ease: {
          type: "number",
          description: "Ease score for 'answer' operation. REQUIRED when operation='answer'. Values: 1 (Again/Hard), 2 (Hard), 3 (Good), 4 (Easy)."
        },
        fields: {
          type: "object",
          description: "Field names and values to update. REQUIRED for 'update_note' and 'update_fields'. Format: {\"FieldName\": \"value\"}. Example: {\"Front\": \"Question text\", \"Back\": \"Answer text\"}. Use HTML formatting (not markdown).",
          additionalProperties: {
            type: "string"
          }
        },
        tags: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Array of tags. REQUIRED for 'update_tags', optional for 'update_note'. REPLACES all existing tags. Example: [\"vocabulary\", \"important\", \"lesson-1\"]."
        },
        audio: {
          type: "array",
          description: "Optional audio files for 'update_note' and 'update_fields'. Each item needs filename, path (URL or local file path), and target field names array.",
          items: {
            type: "object",
            properties: {
              filename: {
                type: "string",
                description: "Audio filename (e.g., 'pronunciation.mp3')"
              },
              path: {
                type: "string",
                description: "URL (https://...) or absolute local file path (/path/to/file.mp3)"
              },
              fields: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Array of field names to attach audio to (e.g., [\"Audio\", \"Pronunciation\"])"
              }
            }
          }
        },
        picture: {
          type: "array",
          description: "Optional image files for 'update_note' and 'update_fields'. Each item needs filename, path (URL or local file path), and target field names array.",
          items: {
            type: "object",
            properties: {
              filename: {
                type: "string",
                description: "Image filename (e.g., 'image.jpg')"
              },
              path: {
                type: "string",
                description: "URL (https://...) or absolute local file path (/path/to/image.jpg)"
              },
              fields: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Array of field names to attach image to (e.g., [\"Picture\", \"Image\"])"
              }
            }
          }
        }
      },
      required: ["operation"]
    }
  },
  {
    name: "add_card",
    description: "Create a new flashcard in Anki. Requires: deckName (exact deck name), modelName (note type like 'Basic' or 'Cloze'), and fields object matching the note type's field names. Returns card ID on success. FORMATTING: Use HTML only (NO markdown) - <br> for line breaks, <strong> for bold, <em> for italic, <ol>/<li> for lists. Media files (audio/picture) support URLs or local absolute paths.",
    inputSchema: {
      type: "object",
      properties: {
        deckName: {
          type: "string",
          description: "REQUIRED. Exact name of target Anki deck (case-sensitive). Examples: 'Spanish', 'Vocabulary', 'My Deck::Subdeck'."
        },
        modelName: {
          type: "string",
          description: "REQUIRED. Exact note type name (case-sensitive). Common types: 'Basic', 'Basic (and reversed card)', 'Basic (type in the answer)', 'Cloze'. Must match an existing note type in Anki."
        },
        fields: {
          type: "object",
          description: "REQUIRED. Field names (keys) and content (values). Keys must exactly match the note type's field names (case-sensitive). Example for 'Basic': {\"Front\": \"Question?\", \"Back\": \"Answer\"}. Use HTML formatting in values.",
          additionalProperties: {
            type: "string"
          }
        },
        tags: {
          type: "string",
          description: "Optional. Comma-separated tags (e.g., 'vocabulary,lesson1,important'). Tags will be created if they don't exist."
        },
        audio: {
          type: "array",
          description: "Optional. Audio file attachments. Each requires: filename, path (URL or absolute local path like /path/to/audio.mp3), and fields array (field names to attach to).",
          items: {
            type: "object",
            properties: {
              filename: {
                type: "string",
                description: "Audio filename with extension (e.g., 'word.mp3', 'pronunciation.wav')"
              },
              path: {
                type: "string",
                description: "URL (https://example.com/audio.mp3) or absolute local file path (/Users/name/audio.mp3). Local files are automatically uploaded to Anki's media folder."
              },
              fields: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Array of field names to attach this audio to. Example: [\"Audio\"] or [\"Pronunciation\", \"Sound\"]"
              }
            },
            required: ["filename", "path", "fields"]
          }
        },
        picture: {
          type: "array",
          description: "Optional. Image file attachments. Each requires: filename, path (URL or absolute local path like /path/to/image.jpg), and fields array (field names to attach to).",
          items: {
            type: "object",
            properties: {
              filename: {
                type: "string",
                description: "Image filename with extension (e.g., 'diagram.jpg', 'photo.png')"
              },
              path: {
                type: "string",
                description: "URL (https://example.com/image.jpg) or absolute local file path (/Users/name/image.jpg). Local files are automatically uploaded to Anki's media folder."
              },
              fields: {
                type: "array",
                items: {
                  type: "string"
                },
                description: "Array of field names to attach this image to. Example: [\"Picture\"] or [\"Image\", \"Diagram\"]"
              }
            },
            required: ["filename", "path", "fields"]
          }
        }
      },
      required: ["deckName", "modelName", "fields"]
    }
  },
  {
    name: "get_due_cards",
    description: "Retrieve cards that are due for review. Returns JSON object with 'count' (number of cards) and 'cards' array. Each card includes: cardId (number), question (HTML cleaned string), answer (HTML cleaned string), due (Unix timestamp). Ordered by due date (earliest first).",
    inputSchema: {
      type: "object",
      properties: {
        num: {
          type: "number",
          description: "REQUIRED. Number of due cards to retrieve (positive integer). Example: 10 returns the 10 earliest due cards."
        }
      },
      required: ["num"]
    },
  },
  {
    name: "get_new_cards",
    description: "Retrieve new unseen cards that haven't been studied yet. Returns JSON object with 'count' (number of cards) and 'cards' array. Each card includes: cardId (number), question (HTML cleaned string), answer (HTML cleaned string), due (Unix timestamp). Ordered by card position in new queue.",
    inputSchema: {
      type: "object",
      properties: {
        num: {
          type: "number",
          description: "REQUIRED. Number of new cards to retrieve (positive integer). Example: 5 returns the first 5 new cards in the queue."
        }
      },
      required: ["num"]
    },
  },
  {
    name: "get_card",
    description: "Retrieve detailed card/note information. Provide EITHER cardId OR query (not both). Returns array of card objects with: cardId, deckName, modelName, question, answer, fields (object with all field values), due, interval, ease, reps, lapses, type, queue, noteId. Use this to find card/note IDs for update operations or to inspect card details.",
    inputSchema: {
      type: "object",
      properties: {
        cardId: {
          type: "number",
          description: "Single card ID to retrieve. Mutually exclusive with 'query'. Returns array with one card object. Example: 1234567890"
        },
        query: {
          type: "string",
          description: "Anki search query (mutually exclusive with 'cardId'). Returns array of all matching cards. Syntax examples: 'deck:Spanish' (deck filter), 'tag:vocabulary' (tag filter), 'note:Basic' (note type filter), 'added:1' (added today), 'added:7' (last 7 days), 'is:new' (new cards), 'is:due' (due cards), 'is:suspended' (suspended), 'deck:Spanish tag:verbs added:7' (combine filters with space=AND). Can match multiple cards."
        }
      }
    }
  },
  {
    name: "batch_add_card",
    description: "Create multiple flashcards in one operation. Each card has same structure as add_card tool. Returns JSON with 'successful' (count), 'failed' (count), and 'errors' array (details of failures if any). More efficient than calling add_card multiple times. Use HTML formatting (not markdown). Processes cards sequentially; partial success possible (some cards created, some failed).",
    inputSchema: {
      type: "object",
      properties: {
        cards: {
          type: "array",
          description: "REQUIRED. Array of card objects to create. Each card must have: deckName, modelName, fields. Optional per card: tags, audio, picture. All cards are processed; failures don't stop remaining cards.",
          items: {
            type: "object",
            properties: {
              deckName: {
                type: "string",
                description: "REQUIRED. Exact deck name (case-sensitive). Example: 'Spanish', 'Vocabulary::Verbs'"
              },
              modelName: {
                type: "string",
                description: "REQUIRED. Exact note type name (case-sensitive). Example: 'Basic', 'Cloze'"
              },
              fields: {
                type: "object",
                description: "REQUIRED. Object with field names as keys, content as values. Keys must match note type's field names exactly. Example: {\"Front\": \"Question\", \"Back\": \"Answer\"}",
                additionalProperties: {
                  type: "string"
                }
              },
              tags: {
                type: "string",
                description: "Optional. Comma-separated tags. Example: 'vocabulary,lesson1'"
              },
              audio: {
                type: "array",
                description: "Optional. Audio attachments array. Each needs: filename, path (URL or absolute local path), fields (array of field names)",
                items: {
                  type: "object",
                  properties: {
                    filename: {
                      type: "string",
                      description: "Audio filename (e.g., 'audio.mp3')"
                    },
                    path: {
                      type: "string",
                      description: "URL or absolute local file path"
                    },
                    fields: {
                      type: "array",
                      items: {
                        type: "string"
                      },
                      description: "Field names to attach audio to"
                    }
                  },
                  required: ["filename", "path", "fields"]
                }
              },
              picture: {
                type: "array",
                description: "Optional. Image attachments array. Each needs: filename, path (URL or absolute local path), fields (array of field names)",
                items: {
                  type: "object",
                  properties: {
                    filename: {
                      type: "string",
                      description: "Image filename (e.g., 'image.jpg')"
                    },
                    path: {
                      type: "string",
                      description: "URL or absolute local file path"
                    },
                    fields: {
                      type: "array",
                      items: {
                        type: "string"
                      },
                      description: "Field names to attach image to"
                    }
                  },
                  required: ["filename", "path", "fields"]
                }
              }
            },
            required: ["deckName", "modelName", "fields"]
          }
        }
      },
      required: ["cards"]
    }
  }
];

/**
 * List all available tools
 */
export function listTools() {
  return {
    tools: TOOL_DEFINITIONS
  };
}
