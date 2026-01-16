import {
  handleUpdateCard,
  handleGetDueCards,
  handleGetNewCards,
  handleGetCard,
  handleAddCard,
  handleBatchAddCard
} from "./cardHandlers.js";

/**
 * Main tool call handler that routes to specific handlers
 */
export async function handleToolCall(name: string, args: any) {
  if (!args) {
    throw new Error(`No arguments provided for tool: ${name}`);
  }

  switch (name) {
    case "update_card":
      return await handleUpdateCard(args);
    
    case "add_card":
      return await handleAddCard(args);
    
    case "get_due_cards":
      return await handleGetDueCards(args);
    
    case "get_new_cards":
      return await handleGetNewCards(args);
    
    case "get_card":
      return await handleGetCard(args);
    
    case "batch_add_card":
      return await handleBatchAddCard(args);
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
