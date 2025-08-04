# World News API MCP Server Examples

This document provides comprehensive examples of how to use the World News API MCP Server tools.

## Setup

First, make sure you have set your API key:

```bash
export WORLD_NEWS_API_KEY="your_api_key_here"
```

## Tool Examples

### 1. search_news

#### Basic text search
```json
{
  "name": "search_news",
  "arguments": {
    "text": "artificial intelligence",
    "number": 5
  }
}
```

#### Search with filters
```json
{
  "name": "search_news",
  "arguments": {
    "text": "climate change",
    "language": "en",
    "source-country": "us",
    "categories": "environment,politics",
    "earliest-publish-date": "2024-01-01 00:00:00",
    "number": 10
  }
}
```

#### Location-based search
```json
{
  "name": "search_news",
  "arguments": {
    "text": "earthquake",
    "location-filter": "35.6762,139.6503,100",
    "language": "en",
    "sort": "publish-time",
    "sort-direction": "DESC"
  }
}
```

#### Sentiment analysis search
```json
{
  "name": "search_news",
  "arguments": {
    "text": "stock market",
    "min-sentiment": 0.5,
    "categories": "business",
    "language": "en",
    "number": 5
  }
}
```

### 2. get_top_news

#### Get top US news
```json
{
  "name": "get_top_news",
  "arguments": {
    "source-country": "us",
    "language": "en"
  }
}
```

#### Get top news for specific date
```json
{
  "name": "get_top_news",
  "arguments": {
    "source-country": "gb",
    "language": "en",
    "date": "2024-01-15"
  }
}
```

#### Get headlines only
```json
{
  "name": "get_top_news",
  "arguments": {
    "source-country": "de",
    "language": "de",
    "headlines-only": true
  }
}
```

### 3. retrieve_newspaper_front_page

#### Get front page by country
```json
{
  "name": "retrieve_newspaper_front_page",
  "arguments": {
    "source-country": "au"
  }
}
```

#### Get specific newspaper front page
```json
{
  "name": "retrieve_newspaper_front_page",
  "arguments": {
    "source-name": "herald-sun",
    "date": "2024-07-09"
  }
}
```

### 4. retrieve_news_articles

#### Get specific articles by ID
```json
{
  "name": "retrieve_news_articles",
  "arguments": {
    "ids": "2352,2354,2355"
  }
}
```

### 5. extract_news

#### Extract article without analysis
```json
{
  "name": "extract_news",
  "arguments": {
    "url": "https://www.bbc.com/news/world-us-canada-59340789"
  }
}
```

#### Extract article with full analysis
```json
{
  "name": "extract_news",
  "arguments": {
    "url": "https://www.nytimes.com/2024/01/01/technology/ai-breakthrough.html",
    "analyze": true
  }
}
```

### 6. extract_news_links

#### Extract links from news website
```json
{
  "name": "extract_news_links",
  "arguments": {
    "url": "https://www.reuters.com/"
  }
}
```

#### Extract and analyze links
```json
{
  "name": "extract_news_links",
  "arguments": {
    "url": "https://www.bbc.com/news",
    "analyze": true
  }
}
```

### 7. search_news_sources

#### Search for BBC sources
```json
{
  "name": "search_news_sources",
  "arguments": {
    "name": "bbc"
  }
}
```

#### Search for CNN sources
```json
{
  "name": "search_news_sources",
  "arguments": {
    "name": "cnn"
  }
}
```

### 8. get_geo_coordinates

#### Get coordinates for major cities
```json
{
  "name": "get_geo_coordinates",
  "arguments": {
    "location": "Tokyo, Japan"
  }
}
```

```json
{
  "name": "get_geo_coordinates",
  "arguments": {
    "location": "New York City, USA"
  }
}
```

```json
{
  "name": "get_geo_coordinates",
  "arguments": {
    "location": "London, United Kingdom"
  }
}
```

## Advanced Use Cases

### Finding Breaking News
```json
{
  "name": "search_news",
  "arguments": {
    "earliest-publish-date": "2024-08-04 00:00:00",
    "sort": "publish-time",
    "sort-direction": "DESC",
    "number": 20
  }
}
```

### Technology News Analysis
```json
{
  "name": "search_news",
  "arguments": {
    "categories": "technology",
    "entities": "ORG:OpenAI,ORG:Google,ORG:Microsoft",
    "language": "en",
    "min-sentiment": 0.1,
    "number": 15
  }
}
```

### Local News Around Coordinates
First get coordinates:
```json
{
  "name": "get_geo_coordinates",
  "arguments": {
    "location": "San Francisco, CA"
  }
}
```

Then search news in that area:
```json
{
  "name": "search_news",
  "arguments": {
    "location-filter": "37.7749,-122.4194,50",
    "language": "en",
    "number": 10
  }
}
```

### Multi-language News Monitoring
```json
{
  "name": "search_news",
  "arguments": {
    "text": "Olympics",
    "language": "fr",
    "source-country": "fr",
    "number": 5
  }
}
```

### Author-specific News
```json
{
  "name": "search_news",
  "arguments": {
    "authors": "John Smith,Jane Doe",
    "categories": "politics",
    "language": "en",
    "number": 10
  }
}
```

## Response Examples

### Successful search_news response:
```json
{
  "content": [
    {
      "type": "text",
      "text": "{
        \"offset\": 0,
        \"number\": 5,
        \"available\": 83,
        \"news\": [
          {
            \"id\": 206030983,
            \"title\": \"AI Breakthrough in Medical Diagnosis\",
            \"text\": \"Researchers have developed...\",
            \"summary\": \"New AI system shows promising results...\",
            \"url\": \"https://example.com/ai-medical-breakthrough\",
            \"image\": \"https://example.com/image.jpg\",
            \"publish_date\": \"2024-01-15 14:30:00\",
            \"authors\": [\"Dr. Jane Smith\"],
            \"source_country\": \"us\",
            \"language\": \"en\",
            \"sentiment\": 0.75,
            \"category\": \"technology\"
          }
        ]
      }"
    }
  ]
}
```

### Error response:
```json
{
  "error": {
    "code": -1,
    "message": "World News API request failed: World News API error (401): Invalid API key"
  }
}
```

## Tips and Best Practices

1. **Use specific search terms**: More specific queries return more relevant results
2. **Combine filters**: Use multiple filters to narrow down results effectively
3. **Check sentiment**: Use sentiment filters for opinion analysis
4. **Location filtering**: Get coordinates first, then use in location-filter
5. **Date ranges**: Use date filters for historical analysis
6. **Source verification**: Use search_news_sources to verify source availability
7. **Content extraction**: Use extract_news for full article analysis
8. **Rate limiting**: Be mindful of API rate limits in your subscription plan
