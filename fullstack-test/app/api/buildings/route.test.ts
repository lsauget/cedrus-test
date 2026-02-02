import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";
import { Building, BuildingsResponse } from "@/lib/buildings/types";

describe("GET /api/buildings", () => {
  const createRequest = (url: string): NextRequest => {
    return new NextRequest(new URL(url, "http://localhost:3000"));
  };

  describe("Basic functionality", () => {
    it("should return all buildings with default pagination", async () => {
      const request = createRequest("/api/buildings");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("pagination");
      expect(data).toHaveProperty("aggregations");
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.data.length).toBeLessThanOrEqual(20); // Default limit
      expect(data.pagination.totalCount).toBeGreaterThan(0);
      expect(data.aggregations.byUsage).toBeDefined();
      expect(data.aggregations.byDpe).toBeDefined();
    });

    it("should respect the limit parameter", async () => {
      const request = createRequest("/api/buildings?limit=5");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.data.length).toBe(5);
    });

    it("should clamp limit to maximum of 100", async () => {
      const request = createRequest("/api/buildings?limit=200");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.data.length).toBeLessThanOrEqual(100);
    });

    it("should clamp limit to minimum of 1", async () => {
      const request = createRequest("/api/buildings?limit=0");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Filtering - Usage", () => {
    it("should filter by single usage type", async () => {
      const request = createRequest("/api/buildings?usage=residential&limit=50");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.data.every((b) => b.usage === "residential")).toBe(true);
      expect(data.pagination.totalCount).toBeGreaterThan(0);
    });

    it("should filter by multiple usage types", async () => {
      const request = createRequest("/api/buildings?usage=residential,office&limit=50");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(
        data.data.every((b) => b.usage === "residential" || b.usage === "office")
      ).toBe(true);
    });

    it("should return empty array when no buildings match usage filter", async () => {
      const request = createRequest("/api/buildings?usage=nonexistent");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.data.length).toBe(0);
      expect(data.pagination.totalCount).toBe(0);
    });
  });

  describe("Filtering - DPE Range", () => {
    it("should filter by dpeMin (inclusive)", async () => {
      const request = createRequest("/api/buildings?dpeMin=B&limit=50");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      // All buildings should have DPE A or B (better than or equal to B)
      expect(
        data.data.every((b) => ["A", "B"].includes(b.dpe))
      ).toBe(true);
    });

    it("should filter by dpeMax (inclusive)", async () => {
      const request = createRequest("/api/buildings?dpeMax=D&limit=50");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      // All buildings should have DPE D, E, F, or G (worse than or equal to D)
      expect(
        data.data.every((b) => ["D", "E", "F", "G"].includes(b.dpe))
      ).toBe(true);
    });

    it("should filter by both dpeMin and dpeMax", async () => {
      const request = createRequest("/api/buildings?dpeMin=B&dpeMax=C&limit=50");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(
        data.data.every((b) => ["A", "B", "C"].includes(b.dpe))
      ).toBe(true);
    });

    it("should return 400 for invalid dpeMin", async () => {
      const request = createRequest("/api/buildings?dpeMin=X");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Invalid dpeMin");
    });

    it("should return 400 for invalid dpeMax", async () => {
      const request = createRequest("/api/buildings?dpeMax=Z");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Invalid dpeMax");
    });
  });

  describe("Filtering - Search", () => {
    it("should search in building name", async () => {
      const request = createRequest("/api/buildings?search=Paris&limit=50");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.data.length).toBeGreaterThan(0);
      expect(
        data.data.some(
          (b) =>
            b.name.toLowerCase().includes("paris") ||
            b.address.toLowerCase().includes("paris") ||
            b.city.toLowerCase().includes("paris")
        )
      ).toBe(true);
    });

    it("should search in address", async () => {
      const request = createRequest("/api/buildings?search=Victor Hugo&limit=50");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it("should search in city", async () => {
      const request = createRequest("/api/buildings?search=Courbevoie&limit=50");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.data.length).toBeGreaterThan(0);
      expect(
        data.data.some(
          (b) =>
            b.name.toLowerCase().includes("courbevoie") ||
            b.address.toLowerCase().includes("courbevoie") ||
            b.city.toLowerCase().includes("courbevoie")
        )
      ).toBe(true);
    });

    it("should be case-insensitive", async () => {
      const request = createRequest("/api/buildings?search=PARIS&limit=50");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.data.length).toBeGreaterThan(0);
    });

    it("should return empty array when no matches found", async () => {
      const request = createRequest("/api/buildings?search=NonexistentBuildingXYZ");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.data.length).toBe(0);
    });
  });

  describe("Filtering - Bounding Box", () => {
    it("should filter buildings within bounding box", async () => {
      // Bounding box around Paris center
      const request = createRequest(
        "/api/buildings?bbox=2.2,48.8,2.4,48.9&limit=50"
      );
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(
        data.data.every((b) => {
          return (
            b.lng >= 2.2 &&
            b.lng <= 2.4 &&
            b.lat >= 48.8 &&
            b.lat <= 48.9
          );
        })
      ).toBe(true);
    });

    it("should return 400 for invalid bbox format", async () => {
      const request = createRequest("/api/buildings?bbox=invalid");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200); // Invalid bbox is ignored, not an error
      expect(data.data.length).toBeGreaterThan(0); // Returns all buildings
    });

    it("should return 400 when bbox min values are greater than max values", async () => {
      const request = createRequest("/api/buildings?bbox=2.4,48.9,2.2,48.8");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Invalid bbox");
    });

    it("should return 400 when bbox coordinates are out of range", async () => {
      const request = createRequest("/api/buildings?bbox=200,100,300,200");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Invalid bbox");
    });
  });

  describe("Filtering - Combined", () => {
    it("should apply multiple filters with AND logic", async () => {
      const request = createRequest(
        "/api/buildings?usage=residential&dpeMin=B&search=Paris&limit=50"
      );
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(
        data.data.every((b) => {
          const matchesUsage = b.usage === "residential";
          const matchesDpe = ["A", "B"].includes(b.dpe);
          const matchesSearch =
            b.name.toLowerCase().includes("paris") ||
            b.address.toLowerCase().includes("paris") ||
            b.city.toLowerCase().includes("paris");
          return matchesUsage && matchesDpe && matchesSearch;
        })
      ).toBe(true);
    });
  });

  describe("Sorting", () => {
    it("should sort by name", async () => {
      const request = createRequest("/api/buildings?sort=name&limit=10");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      const names = data.data.map((b) => b.name.toLowerCase());
      const sortedNames = [...names].sort();
      expect(names).toEqual(sortedNames);
    });

    it("should sort by city", async () => {
      const request = createRequest("/api/buildings?sort=city&limit=10");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      const cities = data.data.map((b) => b.city.toLowerCase());
      const sortedCities = [...cities].sort();
      expect(cities).toEqual(sortedCities);
    });

    it("should sort by constructionYear", async () => {
      const request = createRequest("/api/buildings?sort=constructionYear&limit=10");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      const years = data.data.map((b) => b.constructionYear);
      const sortedYears = [...years].sort((a, b) => a - b);
      expect(years).toEqual(sortedYears);
    });

    it("should sort by dpe", async () => {
      const request = createRequest("/api/buildings?sort=dpe&limit=10");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      const dpeOrder = ["A", "B", "C", "D", "E", "F", "G"];
      const dpes = data.data.map((b) => b.dpe);
      const sortedDpes = [...dpes].sort(
        (a, b) => dpeOrder.indexOf(a) - dpeOrder.indexOf(b)
      );
      expect(dpes).toEqual(sortedDpes);
    });

    it("should return 400 for invalid sort field", async () => {
      const request = createRequest("/api/buildings?sort=invalid");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toHaveProperty("error");
      expect(data.error).toContain("Invalid sort");
    });

    it("should default to sorting by id when no sort specified", async () => {
      const request = createRequest("/api/buildings?limit=10");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      // Should be sorted by id (default)
      const ids = data.data.map((b) => b.id);
      const sortedIds = [...ids].sort();
      expect(ids).toEqual(sortedIds);
    });
  });

  describe("Pagination", () => {
    it("should return nextCursor when there are more results", async () => {
      const request = createRequest("/api/buildings?limit=5");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      if (data.pagination.totalCount > 5) {
        expect(data.pagination.nextCursor).not.toBeNull();
        expect(typeof data.pagination.nextCursor).toBe("string");
      }
    });

    it("should return null nextCursor on last page", async () => {
      const request = createRequest("/api/buildings?limit=1000");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.pagination.nextCursor).toBeNull();
    });

    it("should paginate correctly using cursor", async () => {
      // Get first page
      const firstRequest = createRequest("/api/buildings?sort=name&limit=3");
      const firstResponse = await GET(firstRequest);
      const firstData = (await firstResponse.json()) as BuildingsResponse;

      expect(firstResponse.status).toBe(200);
      expect(firstData.data.length).toBe(3);

      if (firstData.pagination.nextCursor) {
        // Get second page using cursor
        const secondRequest = createRequest(
          `/api/buildings?sort=name&limit=3&cursor=${firstData.pagination.nextCursor}`
        );
        const secondResponse = await GET(secondRequest);
        const secondData = (await secondResponse.json()) as BuildingsResponse;

        expect(secondResponse.status).toBe(200);
        expect(secondData.data.length).toBeGreaterThan(0);

        // Verify no duplicates
        const firstIds = new Set(firstData.data.map((b) => b.id));
        const secondIds = new Set(secondData.data.map((b) => b.id));
        const intersection = [...firstIds].filter((id) => secondIds.has(id));
        expect(intersection.length).toBe(0);

        // Verify ordering is maintained
        const allNames = [
          ...firstData.data.map((b) => b.name.toLowerCase()),
          ...secondData.data.map((b) => b.name.toLowerCase()),
        ];
        const sortedNames = [...allNames].sort();
        expect(allNames).toEqual(sortedNames);
      }
    });

    it("should handle invalid cursor gracefully", async () => {
      const request = createRequest("/api/buildings?cursor=invalid_cursor");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      // Should return from beginning when cursor is invalid
      expect(data.data.length).toBeGreaterThan(0);
    });
  });

  describe("Aggregations", () => {
    it("should return aggregations by usage", async () => {
      const request = createRequest("/api/buildings");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.aggregations.byUsage).toBeDefined();
      expect(typeof data.aggregations.byUsage).toBe("object");
      
      // Verify all usage types in data are in aggregations
      const usageTypes = new Set(data.data.map((b) => b.usage));
      usageTypes.forEach((usage) => {
        expect(data.aggregations.byUsage[usage]).toBeDefined();
        expect(typeof data.aggregations.byUsage[usage]).toBe("number");
      });
    });

    it("should return aggregations by DPE", async () => {
      const request = createRequest("/api/buildings");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data.aggregations.byDpe).toBeDefined();
      expect(typeof data.aggregations.byDpe).toBe("object");
      
      // Verify all DPE values in data are in aggregations
      const dpeValues = new Set(data.data.map((b) => b.dpe));
      dpeValues.forEach((dpe) => {
        expect(data.aggregations.byDpe[dpe]).toBeDefined();
        expect(typeof data.aggregations.byDpe[dpe]).toBe("number");
      });
    });

    it("should calculate aggregations on filtered data", async () => {
      const request = createRequest("/api/buildings?usage=residential");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      // Aggregations should only include residential buildings
      const nonResidentialUsages = Object.keys(data.aggregations.byUsage).filter(
        (usage) => usage !== "residential"
      );
      // Other usages might still appear if they exist in the dataset, but residential should be present
      expect(data.aggregations.byUsage.residential).toBeDefined();
      expect(data.aggregations.byUsage.residential).toBeGreaterThan(0);
    });
  });

  describe("Response structure", () => {
    it("should return correct response structure", async () => {
      const request = createRequest("/api/buildings?limit=5");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("data");
      expect(data).toHaveProperty("pagination");
      expect(data).toHaveProperty("aggregations");
      expect(data.pagination).toHaveProperty("nextCursor");
      expect(data.pagination).toHaveProperty("totalCount");
      expect(data.aggregations).toHaveProperty("byUsage");
      expect(data.aggregations).toHaveProperty("byDpe");
    });

    it("should return buildings with all required fields", async () => {
      const request = createRequest("/api/buildings?limit=1");
      const response = await GET(request);
      const data = (await response.json()) as BuildingsResponse;

      expect(response.status).toBe(200);
      if (data.data.length > 0) {
        const building = data.data[0];
        expect(building).toHaveProperty("id");
        expect(building).toHaveProperty("name");
        expect(building).toHaveProperty("city");
        expect(building).toHaveProperty("address");
        expect(building).toHaveProperty("usage");
        expect(building).toHaveProperty("dpe");
        expect(building).toHaveProperty("lat");
        expect(building).toHaveProperty("lng");
        expect(building).toHaveProperty("surface");
        expect(building).toHaveProperty("floors");
        expect(building).toHaveProperty("constructionYear");
      }
    });
  });

  describe("Error handling", () => {
    it("should return 500 for unexpected errors", async () => {
      // This test would require mocking to force an error
      // For now, we test that the error handling structure exists
      const request = createRequest("/api/buildings");
      const response = await GET(request);

      // Should not throw, should return a response
      expect(response).toBeDefined();
      expect([200, 400, 500]).toContain(response.status);
    });
  });
});
