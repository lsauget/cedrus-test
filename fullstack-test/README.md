# Cedrus Senior Fullstack Engineering Exercise

**Stack:** Next.js 16 + MapLibre + TypeScript

---

## Overview

Build a building portfolio management interface with:

- RESTful API with filtering, pagination, and aggregations
- Interactive map with clustering and geospatial filtering
- Filter panel with URL state synchronization
- Error handling

---

## Timebox

- **Expected duration:** 1-2 hours
- Focus on architecture decisions, code quality, and best-practices
- Partial completion with well-structured code is better than rushed full completion

---

## Project Structure

```
fullstack-test/
  app/
    api/
      buildings/
  components/
  data/
    buildings.json
  lib/
```

- Building data is available in `data/buildings.json`
- Map component already available in `components/ui/map.tsx` — docs: [mapcn.dev/docs](https://mapcn.dev/docs/basic-map)

---

## Running the application

```bash
bun i
bun dev
```

- App: http://localhost:3000

---

## Tasks

### 1. API Design – `GET /api/buildings`

Design a production-ready API endpoint with the following capabilities:

**Query parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `usage` | `string` | Comma-separated list (e.g., `residential,office`) |
| `dpeMin` | `A-G` | Minimum DPE rating (inclusive) |
| `dpeMax` | `A-G` | Maximum DPE rating (inclusive) |
| `search` | `string` | Full-text search on name, address, city |
| `bbox` | `string` | Bounding box: `minLng,minLat,maxLng,maxLat` |
| `cursor` | `string` | Opaque cursor for pagination |
| `limit` | `number` | Page size (default: 20, max: 100) |
| `sort` | `string` | Sort field: `name`, `dpe`, `city`, `constructionYear` |

**Requirements:**

- Implement cursor-based pagination with stable ordering
- Return aggregations in response: count by usage type, count by DPE rating
- Parameter validation
- Return appropriate HTTP status codes and structured error responses
- Implement the bounding box filter for geospatial queries

**Expected response shape:**

```typescript
{
  data: Building[];
  pagination: {
    nextCursor: string | null;
    totalCount: number;
  };
  aggregations: {
    byUsage: Record<string, number>;
    byDpe: Record<string, number>;
  };
}
```

---

### 2. Filter Panel Component

Build a filter panel with the following features:

**Requirements:**

- Multi-select for building usages
- DPE range selector (A–G) with visual indication of current range
- Search input
- All filter state must be synchronized bidirectionally with URL
- Display active filter count and "Clear all" action
- Filters should compose (AND logic between different filter types)

**Architecture considerations:**

- Filters should be controlled components with a clear data flow
- Consider how filter changes trigger data fetches (avoid race conditions)
- Handle the case where URL contains invalid filter values on page load

---

### 3. Map Integration

Integrate the map component with the following features:

**Requirements:**

- Display buildings
- Clicking a building marker shows a popup with building details
- Map should fit bounds to visible buildings when filters change

**Bonus:**

- Implement a loading state overlay while fetching
- Color-code markers by DPE rating (A=green → G=red gradient)
- Implement draw to filter: user draws a rectangle on the map → buildings within bounds are filtered
---

### 4. State Management & Data Fetching

**Requirements:**

- Implement proper request deduplication and caching
- Handle race conditions when filters change rapidly

---

### 5. Error Handling & Resilience

**Requirements:**

- Display user-friendly error messages with retry actions
- Add a toast/notification system for errors

---

### 6. Testing (Choose one)

Demonstrate testing approach with one of the following:

- Unit tests for the API route (parameter validation, filtering logic)
- Integration test for the filter → API → map data flow
- E2E test for a critical user journey

---

### 7. Production Readiness

**Required:**

- Dockerize the application
- Add proper TypeScript types throughout

**Bonus:**

- Add OpenAPI/Swagger documentation for the API
- Implement request logging middleware

---

## Evaluation Criteria

- API Design
- Architecture
- Code Quality
- UX Pattern
- Testing & Resilience
- Git Practices

---

## Not Required

- Authentication/authorization
- Database integration
- Mobile responsiveness
- Pixel-perfect design
- Full test coverage

---

## Hints

- The `MapClusterLayer` component accepts GeoJSON FeatureCollection data
- Consider using `AbortController` for request cancellation
- The `nuqs` library works well with Next.js App Router for URL state
- The design of the component is not judged
- For the draw-to-filter feature, look into MapLibre's `BoxZoomHandler` or implement a custom drag handler

---

## Submission

1. Ensure all committed code runs
2. Include a brief `NOTES.md` explaining:
   - Architecture decisions and trade-offs
   - What you would improve with more time
   - Any assumptions made
   - Feedback regarding the test is always appreciated!
3. Push to your Github/Gitlab and share the link

Good luck :)
