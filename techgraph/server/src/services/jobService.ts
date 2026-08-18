import driver from "../config/database";

export async function getJobs() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (j:Job)
      OPTIONAL MATCH (c:Company)-[:OFFERS]->(j)
      OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
      RETURN j.id AS id,
             j.title AS title,
             j.description AS description,
             j.location AS location,
             j.experienceRequired AS experienceRequired,
             c.name AS company,
             collect(DISTINCT s.name) AS requiredSkills
      ORDER BY j.title
    `);

    return result.records.map((record) => ({
      id: record.get("id"),
      title: record.get("title"),
      description: record.get("description"),
      location: record.get("location"),
      experienceRequired: record.get("experienceRequired"),
      company: record.get("company"),
      requiredSkills: record.get("requiredSkills"),
    }));
  } finally {
    await session.close();
  }
}