# Anki MCP Server

A Model Context Protocol (MCP) server that provides seamless integration with Anki, enabling AI assistants to interact with your flashcard collection. Create, read, update, and manage Anki cards programmatically through a standardized interface.

## Features

- 🎴 **Card Management**: Create, retrieve, and update flashcards with full field customization
- 🔍 **Smart Search**: Query cards by ID, keywords, tags, decks, or any Anki search syntax
- 📊 **Review Integration**: Access due cards, new cards, and answer cards programmatically
- 🎵 **Media Support**: Automatic handling of audio and images (local files, URLs, or existing media)
- 🔄 **Batch Operations**: Create multiple cards efficiently in a single operation
- 🎯 **Generic Tools**: Flexible tools that work with any deck, note type, and field configuration

## Prerequisites

1. **[Anki Desktop App](https://apps.ankiweb.net/)** - Must be running during MCP server usage
2. **[AnkiConnect Add-on](https://ankiweb.net/shared/info/2055492159)** - Install from Anki: Tools → Add-ons → Get Add-ons → Code: `2055492159`

> ⚠️ **Important**: Anki must be running with AnkiConnect enabled for this MCP server to function.

## Resources

- **`anki://search/deckcurrent`** - All cards from current deck
- **`anki://search/isdue`** - Cards due for review
- **`anki://search/isnew`** - New unseen cards
- Custom queries: `anki://search/tag:vocabulary`, `anki://search/deck:Spanish`, etc.

## Tools

- **`update_card`** - Update cards/notes (answer, update fields, update tags)
- **`add_card`** - Create a new flashcard with custom deck, model, and fields
- **`batch_add_card`** - Create multiple flashcards at once
- **`get_due_cards`** - Get list of cards due for review
- **`get_new_cards`** - Get list of new unseen cards
- **`get_card`** - Retrieve detailed card information by ID or query

## Development

Install dependencies:
```bash
npm install
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## Media Files

### How Media Files Are Handled

When you add cards with images or audio files, the server automatically handles different types of media sources:

1. **Local File Paths**: If you provide an absolute path to a file on your computer (e.g., `/Users/mycomputer/Documents/images/prune.jpg`), the server will:
   - Read the file from your disk
   - Convert it to base64
   - Upload it to Anki's media collection using the `storeMediaFile` API
   - Reference it in the card by filename

2. **URLs**: If you provide a URL (e.g., `https://example.com/image.jpg`), Anki-Connect will download the file automatically when the card is created.

3. **Existing Media**: If you provide just a filename (e.g., `prune.jpg`), it assumes the file already exists in Anki's media folder.

### Troubleshooting Image Issues

If images don't show up properly in Anki:

1. **Check the file path**: Make sure the path to your image file is correct and the file exists
2. **File permissions**: Ensure the file is readable by the application
3. **Supported formats**: Anki supports common image formats (JPG, PNG, GIF, SVG, WebP)
4. **File size**: Very large files might cause issues
5. **Special characters**: Avoid special characters in filenames when possible

The server will now automatically handle local file paths, so you don't need to manually copy images to Anki's media folder anymore.

## Installation & Configuration

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the server:
   ```bash
   npm run build
   ```

### Configuration with Claude Desktop

Add the server configuration to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "anki-mcp-server": {
      "command": "/absolute/path/to/anki-mcp-server/build/index.js"
    }
  }
}
```

> 💡 **Tip**: Replace `/absolute/path/to/anki-mcp-server` with the actual full path to where you cloned this repository.

### Configuration with Other MCP Clients

This server follows the standard MCP protocol and can be used with any MCP-compatible client. Configure it as a stdio-based server pointing to `build/index.js`.

### Verification

After configuration:
1. Restart Claude Desktop (or your MCP client)
2. Ensure Anki is running with AnkiConnect installed
3. The server should appear in your available MCP servers
4. Test with a simple query like "Show me 5 due cards from Anki"

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser where you can:
- Test tool calls interactively
- View request/response logs
- Debug connection issues
- Validate tool schemas

### Troubleshooting

**Server not appearing in Claude Desktop:**
- Verify the path in config is absolute (not relative)
- Check that `build/index.js` exists (run `npm run build`)
- Restart Claude Desktop after config changes

**"Connection refused" or timeout errors:**
- Ensure Anki is running
- Verify AnkiConnect is installed (Tools → Add-ons)
- Check AnkiConnect settings allow localhost connections (default)

**Cards not updating/creating:**
- Close the Anki browser if you have it open (known AnkiConnect limitation)
- Verify the deck and note type names match exactly (case-sensitive)
- Check field names match your note type's field configuration

## Contributing

Contributions are welcome! Whether you're fixing bugs, adding features, or improving documentation, your help is appreciated.

### How to Contribute

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/anki-mcp.git
   cd anki-mcp
   ```
3. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** and test thoroughly
5. **Build and test** your changes:
   ```bash
   npm install
   npm run build
   npm run inspector  # Test with MCP Inspector
   ```
6. **Commit your changes** with clear, descriptive messages:
   ```bash
   git commit -m "Add: description of your changes"
   ```
7. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
8. **Open a Pull Request** on GitHub with a clear description of your changes

### Development Guidelines

- Write clean, readable TypeScript code
- Follow the existing code style and structure
- Test your changes with the MCP Inspector
- Update documentation if you're adding new features
- Keep commits focused and atomic

### Reporting Issues

Found a bug or have a feature request? Please open an issue on GitHub with:
- A clear, descriptive title
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Your environment (OS, Anki version, Node version)

### Questions?

Feel free to open an issue for questions or join the discussion in existing issues.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built on the [Model Context Protocol](https://modelcontextprotocol.io/) by Anthropic
- Uses [AnkiConnect](https://foosoft.net/projects/anki-connect/) for Anki integration
- Powered by [yanki-connect](https://www.npmjs.com/package/yanki-connect) npm package
