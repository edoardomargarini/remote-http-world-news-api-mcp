# World News API MCP Server

A Model Context Protocol (MCP) server that provides access to the [World News API](https://worldnewsapi.com/). This server enables AI assistants to search for news, get top headlines, extract articles, retrieve newspaper front pages, and more through the MCP protocol.

[![npm version](https://img.shields.io/npm/v/world-news-api-mcp.svg)](https://www.npmjs.com/package/world-news-api-mcp)
[![npm downloads](https://img.shields.io/npm/dm/world-news-api-mcp.svg)](https://www.npmjs.com/package/world-news-api-mcp)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

## Features

- **News Search**: Search and filter news by text, date, location, category, language, and more
- **Top Headlines**: Get top news from any country in any language
- **Newspaper Front Pages**: Retrieve front pages of newspapers from around the world
- **Article Extraction**: Extract full articles from news URLs
- **News Links Discovery**: Extract news links from websites
- **Source Search**: Find monitored news sources
- **Location Coordinates**: Get geo-coordinates for location-based filtering
- **Content Analysis**: Extract entities, detect sentiment, and more

## Quick Start

### Installation

```bash
npm install -g world-news-api-mcp
```

### Setup

1. **Get a World News API key** (free at https://worldnewsapi.com/register)

2. **Set your API key as an environment variable:**
   ```bash
   # Windows (PowerShell)
   $env:WORLD_NEWS_API_KEY="your_api_key_here"
   
   # macOS/Linux
   export WORLD_NEWS_API_KEY="your_api_key_here"
   ```

### Usage with MCP Clients

Add this configuration to your MCP client (Claude Desktop, etc.):

```json
{
  "servers": {
    "world-news-api": {
      "command": "world-news-api-mcp",
      "env": {
        "WORLD_NEWS_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Test the Installation

```bash
# Set your API key
export WORLD_NEWS_API_KEY="your_key_here"

# Test the server
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | world-news-api-mcp
```

## Available Tools

### `search_news`
Search and filter news by text, date, location, category, language, and more.

**Parameters:**
- `text` (string, optional): Text to match in news content (min 3 chars)
- `source-country` (string, optional): ISO 3166 country code (e.g., "us", "gb")
- `language` (string, optional): ISO 6391 language code (e.g., "en", "es")
- `min-sentiment` / `max-sentiment` (number, optional): Sentiment range [-1,1]
- `earliest-publish-date` / `latest-publish-date` (string, optional): Date range (YYYY-MM-DD HH:MM:SS)
- `news-sources` (string, optional): Comma-separated list of sources
- `authors` (string, optional): Comma-separated list of authors
- `categories` (string, optional): Categories (politics, sports, business, technology, etc.)
- `entities` (string, optional): Filter by entities (ORG:Tesla,PER:Elon Musk)
- `location-filter` (string, optional): "latitude,longitude,radius_km"
- `sort` (string, optional): Sorting criteria (publish-time)
- `sort-direction` (string, optional): ASC or DESC
- `offset` (number, optional): Number of results to skip
- `number` (number, optional): Number of results to return (1-100, default: 10)

### `get_top_news`
Get the top news from a country in a language for a specific date.

**Parameters:**
- `source-country` (string, required): ISO 3166 country code
- `language` (string, required): ISO 6391 language code
- `date` (string, optional): Date (YYYY-MM-DD), defaults to current day
- `headlines-only` (boolean, optional): Return only basic info (default: false)

### `retrieve_newspaper_front_page`
Get front pages of newspapers from around the world.

**Parameters:**
- `source-country` (string, optional): ISO 3166 country code
- `source-name` (string, optional): Publication identifier (e.g., "herald-sun")
- `date` (string, optional): Date (YYYY-MM-DD), earliest: 2024-07-09

### `retrieve_news_articles`
Retrieve detailed information about specific news articles by their IDs.

**Parameters:**
- `ids` (string, required): Comma-separated list of news IDs

### `extract_news`
Extract a news article from a website to a well-structured JSON object.

**Parameters:**
- `url` (string, required): URL of the news article
- `analyze` (boolean, optional): Analyze content (entities, sentiment, etc.)

### `extract_news_links`
Extract news links from a news website.

**Parameters:**
- `url` (string, required): URL of the news website
- `analyze` (boolean, optional): Analyze extracted content

### `search_news_sources`
Search whether a news source is monitored by the World News API.

**Parameters:**
- `name` (string, required): (Partial) name of the source

### `get_geo_coordinates`
Get latitude and longitude of a location for use in location-filter.

**Parameters:**
- `location` (string, required): Address or location name

## Usage Examples

### Search for recent news about AI
```json
{
  "name": "search_news",
  "arguments": {
    "text": "artificial intelligence",
    "language": "en",
    "categories": "technology",
    "number": 5
  }
}
```

### Get top news from the US
```json
{
  "name": "get_top_news",
  "arguments": {
    "source-country": "us",
    "language": "en"
  }
}
```

### Extract an article from URL
```json
{
  "name": "extract_news",
  "arguments": {
    "url": "https://www.bbc.com/news/world-us-canada-59340789",
    "analyze": true
  }
}
```

### Search for news near a location
```json
{
  "name": "search_news",
  "arguments": {
    "text": "earthquake",
    "location-filter": "35.6762,139.6503,50",
    "language": "en"
  }
}
```

## Development

To run in development mode:

```bash
npm run dev
```

To build:

```bash
npm run build
```

To test:

```bash
npm test
```

## API Rate Limits

The World News API has different rate limits based on your subscription:
- **Free Plan**: 150 requests per day
- **Paid Plans**: Higher limits available

Check the [World News API pricing](https://worldnewsapi.com/pricing) for details.

## Error Handling

The server handles common API errors:
- **401 Unauthorized**: Invalid API key
- **402 Payment Required**: API quota exceeded
- **429 Too Many Requests**: Rate limit exceeded

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Related

- [World News API Documentation](https://worldnewsapi.com/docs/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [MCP SDK](https://github.com/modelcontextprotocol/typescript-sdk)
