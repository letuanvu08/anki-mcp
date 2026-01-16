# Anki MCP Server Architecture

## Project Structure

```
anki-mcp-server/
├── index.ts                 # Main server entry point
├── src/
│   ├── clients/            # External service clients
│   │   ├── ankiClient.ts   # YankiConnect client singleton
│   │   └── index.ts        # Client exports
│   └── utils/              # Utility functions
│       ├── cardHelpers.ts  # Card operations (CRUD)
│       ├── formatters.ts   # Text formatting utilities
│       └── index.ts        # Utils exports
├── build/                  # Compiled JavaScript output
└── package.json
```

## Module Organization

### 1. `src/clients/`
Contains external service client initialization and configuration.

#### `ankiClient.ts`
- Exports a singleton instance of `YankiConnect`
- Provides centralized access to Anki API
- Usage: `import { ankiClient } from "./src/clients/index.js"`

### 2. `src/utils/`
Contains utility functions organized by domain.

#### `formatters.ts`
Text and query formatting utilities:
- `cleanWithRegex(htmlString)` - Strips HTML and cleans text
- `formatQuery(query)` - Formats URI queries for Anki search

#### `cardHelpers.ts`
Card operations and business logic:
- `findCardsAndOrder(query)` - Search and retrieve cards
- `addCardGeneric(...)` - Generic card creation function
- `addVocabularyCard(...)` - Create vocabulary cards
- `addPhrasalVerbCard(...)` - Create phrasal verb cards

### 3. `index.ts`
Main MCP server implementation:
- Server initialization and configuration
- Request handlers (resources, tools)
- Routes tool calls to appropriate helper functions

## Design Principles

### 1. **Separation of Concerns**
- Client initialization separated from business logic
- Utility functions grouped by domain
- Server routing separated from implementation

### 2. **Code Reusability**
- Generic `addCardGeneric()` function used by all card types
- Shared formatters for consistent text processing
- Centralized client for all Anki operations

### 3. **Maintainability**
- Clear module boundaries
- Single responsibility per file
- Easy to add new card types or utilities

### 4. **Type Safety**
- TypeScript throughout
- Exported types from modules
- Proper interface definitions

## Adding New Card Types

To add a new card type:

1. Create a new function in `src/utils/cardHelpers.ts`:
```typescript
export async function addNewCardType(
  field1: string,
  field2: string,
  tags: string
): Promise<any> {
  const fields: Record<string, string> = {
    Field1: field1,
    Field2: field2
  };

  return await addCardGeneric(
    'New Deck Name',
    'New Model Name',
    fields,
    tags
  );
}
```

2. Export it from `src/utils/index.ts`

3. Add a new tool in `index.ts` ListToolsRequestSchema handler

4. Add a case in CallToolRequestSchema handler to call your function

## Benefits of This Structure

✅ **Modularity** - Easy to test individual components
✅ **Scalability** - Simple to add new features
✅ **Maintainability** - Clear organization and responsibilities
✅ **Reusability** - Shared utilities across the codebase
✅ **Type Safety** - Full TypeScript support
✅ **Clean Imports** - Index files for cleaner import statements
