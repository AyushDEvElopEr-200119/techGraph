import driver from "../config/database";

export async function getProjects() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (p:Project)
      OPTIONAL MATCH (d:Developer)-[:WORKED_ON]->(p)
      OPTIONAL MATCH (p)-[:USES]->(t:Technology)
      RETURN p.id AS id,
             p.name AS name,
             p.description AS description,
             p.year AS year,
             collect(DISTINCT d.name) AS developers,
             collect(DISTINCT t.name) AS technologies
      ORDER BY p.name
    `);

    return result.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
      description: record.get("description"),
      year: record.get("year"),
      developers: record.get("developers"),
      technologies: record.get("technologies"),
    }));
  } finally {
    await session.close();
  }
}