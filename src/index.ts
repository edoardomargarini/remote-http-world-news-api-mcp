#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const API_BASE_URL = 'https://api.worldnewsapi.com';

// Validation schemas
const SearchNewsSchema = z.object({
  text: z.string().min(3).max(100).optional().describe('The text to match in the news content'),
  'source-country': z.string().length(2).optional().describe('ISO 3166 country code'),
  language: z.string().length(2).optional().describe('ISO 6391 language code'),
  'min-sentiment': z.number().min(-1).max(1).optional().describe('Minimal sentiment [-1,1]'),
  'max-sentiment': z.number().min(-1).max(1).optional().describe('Maximal sentiment [-1,1]'),
  'earliest-publish-date': z.string().optional().describe('Format: YYYY-MM-DD HH:MM:SS'),
  'latest-publish-date': z.string().optional().describe('Format: YYYY-MM-DD HH:MM:SS'),
  'news-sources': z.string().optional().describe('Comma-separated list of news sources'),
  authors: z.string().optional().describe('Comma-separated list of author names'),
  categories: z.string().optional().describe('Comma-separated list of categories'),
  entities: z.string().optional().describe('Filter by entities (e.g., ORG:Tesla,PER:Elon Musk)'),
  'location-filter': z.string().optional().describe('Format: latitude,longitude,radius_km'),
  sort: z.string().optional().describe('Sorting criteria (publish-time)'),
  'sort-direction': z.enum(['ASC', 'DESC']).optional().describe('Sort direction'),
  offset: z.number().min(0).max(10000).optional().describe('Number of news to skip'),
  number: z.number().min(1).max(100).default(10).describe('Number of results to return')
});

const TopNewsSchema = z.object({
  'source-country': z.string().length(2).describe('ISO 3166 country code'),
  language: z.string().length(2).describe('ISO 6391 language code'),
  date: z.string().optional().describe('Date format: YYYY-MM-DD'),
  'headlines-only': z.boolean().optional().describe('Return only basic information')
});

const RetrieveFrontPageSchema = z.object({
  'source-country': z.string().length(2).optional().describe('ISO 3166 country code'),
  'source-name': z.string().max(100).optional().describe('Publication identifier'),
  date: z.string().optional().describe('Date format: YYYY-MM-DD')
});

const RetrieveNewsSchema = z.object({
  ids: z.string().describe('Comma-separated list of news IDs')
});

const ExtractNewsSchema = z.object({
  url: z.string().max(1000).describe('URL of the news article'),
  analyze: z.boolean().optional().describe('Whether to analyze the extracted news')
});

const ExtractNewsLinksSchema = z.object({
  url: z.string().max(1000).describe('URL of the news website'),
  analyze: z.boolean().optional().describe('Whether to analyze the extracted news')
});

const SearchNewsSourcesSchema = z.object({
  name: z.string().max(1000).describe('The (partial) name of the source')
});

const GeoCoordinatesSchema = z.object({
  location: z.string().max(1000).describe('The address or name of the location')
});

// Helper function to make API requests
async function makeWorldNewsAPIRequest(endpoint: string, params: Record<string, any> = {}) {
  const apiKey = process.env.WORLD_NEWS_API_KEY;
  if (!apiKey) {
    throw new Error('WORLD_NEWS_API_KEY environment variable is required');
  }

  // Filter out undefined values
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined)
  );

  const url = new URL(`${API_BASE_URL}${endpoint}`);
  url.searchParams.append('api-key', apiKey);
  
  Object.entries(cleanParams).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`World News API error (${response.status}): ${error}`);
  }

  return response.json();
}

// Create server instance
const server = new Server(
  {
    name: 'world-news-api-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
const tools: Tool[] = [
  {
    name: 'search_news',
    description: 'Search and filter news by text, date, location, category, language, and more',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'The text to match in the news content (at least 3 characters)',
          minLength: 3,
          maxLength: 100
        },
        'source-country': {
          type: 'string',
          description: 'ISO 3166 country code (e.g., us, gb, de)',
          maxLength: 2
        },
        language: {
          type: 'string',
          description: 'ISO 6391 language code (e.g., en, es, fr)',
          maxLength: 2
        },
        'min-sentiment': {
          type: 'number',
          description: 'Minimal sentiment of the news in range [-1,1]',
          minimum: -1,
          maximum: 1
        },
        'max-sentiment': {
          type: 'number',
          description: 'Maximal sentiment of the news in range [-1,1]',
          minimum: -1,
          maximum: 1
        },
        'earliest-publish-date': {
          type: 'string',
          description: 'The news must have been published after this date (YYYY-MM-DD HH:MM:SS)',
          maxLength: 19
        },
        'latest-publish-date': {
          type: 'string',
          description: 'The news must have been published before this date (YYYY-MM-DD HH:MM:SS)',
          maxLength: 19
        },
        'news-sources': {
          type: 'string',
          description: 'Comma-separated list of news sources (e.g., https://www.bbc.co.uk)',
          maxLength: 10000
        },
        authors: {
          type: 'string',
          description: 'Comma-separated list of author names',
          maxLength: 300
        },
        categories: {
          type: 'string',
          description: 'Comma-separated list of categories (politics, sports, business, technology, etc.)',
          maxLength: 300
        },
        entities: {
          type: 'string',
          description: 'Filter by entities (e.g., ORG:Tesla,PER:Elon Musk)',
          maxLength: 10000
        },
        'location-filter': {
          type: 'string',
          description: 'Filter by radius around location: "latitude,longitude,radius_km"',
          maxLength: 100
        },
        sort: {
          type: 'string',
          description: 'Sorting criteria (publish-time)',
          maxLength: 100
        },
        'sort-direction': {
          type: 'string',
          description: 'Whether to sort ascending or descending (ASC or DESC)',
          enum: ['ASC', 'DESC']
        },
        offset: {
          type: 'number',
          description: 'Number of news to skip',
          minimum: 0,
          maximum: 10000
        },
        number: {
          type: 'number',
          description: 'Number of news to return',
          minimum: 1,
          maximum: 100,
          default: 10
        }
      },
      required: []
    }
  },
  {
    name: 'get_top_news',
    description: 'Get the top news from a country in a language for a specific date',
    inputSchema: {
      type: 'object',
      properties: {
        'source-country': {
          type: 'string',
          description: 'ISO 3166 country code (e.g., us, gb, de)',
          maxLength: 2
        },
        language: {
          type: 'string',
          description: 'ISO 6391 language code (e.g., en, es, fr)',
          maxLength: 2
        },
        date: {
          type: 'string',
          description: 'Date for top news (YYYY-MM-DD). If not provided, current day is used',
          maxLength: 10
        },
        'headlines-only': {
          type: 'boolean',
          description: 'Return only basic information (id, title, url)',
          default: false
        }
      },
      required: ['source-country', 'language']
    }
  },
  {
    name: 'retrieve_newspaper_front_page',
    description: 'Get the front pages of newspapers from around the world',
    inputSchema: {
      type: 'object',
      properties: {
        'source-country': {
          type: 'string',
          description: 'ISO 3166 country code of the newspaper publication',
          maxLength: 2
        },
        'source-name': {
          type: 'string',
          description: 'Identifier of the publication (e.g., herald-sun)',
          maxLength: 100
        },
        date: {
          type: 'string',
          description: 'Date for front page (YYYY-MM-DD). Earliest date is 2024-07-09',
          maxLength: 10
        }
      },
      required: []
    }
  },
  {
    name: 'retrieve_news_articles',
    description: 'Retrieve information about one or more news articles by their IDs',
    inputSchema: {
      type: 'object',
      properties: {
        ids: {
          type: 'string',
          description: 'Comma-separated list of news IDs (e.g., "2352,2354")',
          maxLength: 10000
        }
      },
      required: ['ids']
    }
  },
  {
    name: 'extract_news',
    description: 'Extract a news article from a website to a well-structured JSON object',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL of the news article to extract',
          maxLength: 1000
        },
        analyze: {
          type: 'boolean',
          description: 'Whether to analyze the extracted news (entities, sentiment, etc.)',
          default: false
        }
      },
      required: ['url']
    }
  },
  {
    name: 'extract_news_links',
    description: 'Extract news links from a news website',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL of the news website to extract links from',
          maxLength: 1000
        },
        analyze: {
          type: 'boolean',
          description: 'Whether to analyze the extracted news',
          default: false
        }
      },
      required: ['url']
    }
  },
  {
    name: 'search_news_sources',
    description: 'Search whether a news source is being monitored by the World News API',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The (partial) name of the source (e.g., "bbc")',
          maxLength: 1000
        }
      },
      required: ['name']
    }
  },
  {
    name: 'get_geo_coordinates',
    description: 'Retrieve the latitude and longitude of a location name for use in location-filter',
    inputSchema: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'The address or name of the location (e.g., "Tokyo, Japan")',
          maxLength: 1000
        }
      },
      required: ['location']
    }
  }
];

// Tool handlers
const toolHandlers = {
  search_news: async (args: any) => {
    const params = SearchNewsSchema.parse(args);
    return await makeWorldNewsAPIRequest('/search-news', params);
  },

  get_top_news: async (args: any) => {
    const params = TopNewsSchema.parse(args);
    return await makeWorldNewsAPIRequest('/top-news', params);
  },

  retrieve_newspaper_front_page: async (args: any) => {
    const params = RetrieveFrontPageSchema.parse(args);
    return await makeWorldNewsAPIRequest('/retrieve-front-page', params);
  },

  retrieve_news_articles: async (args: any) => {
    const params = RetrieveNewsSchema.parse(args);
    return await makeWorldNewsAPIRequest('/retrieve-news', params);
  },

  extract_news: async (args: any) => {
    const params = ExtractNewsSchema.parse(args);
    return await makeWorldNewsAPIRequest('/extract-news', params);
  },

  extract_news_links: async (args: any) => {
    const params = ExtractNewsLinksSchema.parse(args);
    return await makeWorldNewsAPIRequest('/extract-news-links', params);
  },

  search_news_sources: async (args: any) => {
    const params = SearchNewsSourcesSchema.parse(args);
    return await makeWorldNewsAPIRequest('/search-news-sources', params);
  },

  get_geo_coordinates: async (args: any) => {
    const params = GeoCoordinatesSchema.parse(args);
    return await makeWorldNewsAPIRequest('/geo-coordinates', params);
  }
};

// Register handlers
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (!(name in toolHandlers)) {
    throw new Error(`Unknown tool: ${name}`);
  }

  try {
    const result = await toolHandlers[name as keyof typeof toolHandlers](args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`World News API request failed: ${errorMessage}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  console.error('World News API MCP Server running on stdio');
  await server.connect(transport);
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
