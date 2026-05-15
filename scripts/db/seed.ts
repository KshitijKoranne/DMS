import { seedDatabase } from "../../src/lib/db/repository";

async function main() {
  await seedDatabase();
  console.log("Database seed data is ready.");
}

void main();
