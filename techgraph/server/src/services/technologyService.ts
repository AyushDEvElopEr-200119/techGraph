import driver from "../config/database";

export async function getTechnologies() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (t:Technology)
      OPTIONAL MATCH (p:Project)-[:USES]->(t)
      OPTIONAL MATCH (j:Job)-[:USES]->(t)
      RETURN t.id AS id,
             t.name AS name,
             t.category AS category,
             collect(DISTINCT p.name) AS projects,
             collect(DISTINCT j.title) AS jobs
      ORDER BY t.name
    `);

    return result.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
      category: record.get("category"),
      projects: record.get("projects"),
      jobs: record.get("jobs"),
    }));
  } finally {
    await session.close();
  }
}