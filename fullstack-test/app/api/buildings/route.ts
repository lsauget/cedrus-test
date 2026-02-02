import buildings from "@/data/buildings.json";

export async function GET() {
  return Response.json(buildings);
}
