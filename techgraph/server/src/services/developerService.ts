import driver from "../config/database";

export async function getDevelopers() {
  const session = driver.session();

  try {
    const result = await session.run(`
      MATCH (d:Developer)
      RETURN d.id AS id,
             d.name AS name,
             d.email AS email,
             d.experience AS experience,
             d.location AS location
      ORDER BY d.name
    `);

    return result.records.map((record) => ({
      id: record.get("id"),
      name: record.get("name"),
      email: record.get("email"),
      experience: record.get("experience"),
      location: record.get("location"),
    }));
  } finally {
    await session.close();
  }
}

export async function getDeveloperById(developerId: string) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (d:Developer {id: $developerId})
      OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
      OPTIONAL MATCH (d)-[:WORKED_ON]->(p:Project)
      OPTIONAL MATCH (d)-[:WORKED_AT]->(c:Company)
      RETURN d,
             collect(DISTINCT s) AS skills,
             collect(DISTINCT p) AS projects,
             collect(DISTINCT c) AS companies
      `,
      { developerId }
    );

    if (result.records.length === 0) {
      return null;
    }

    const record = result.records[0];

    const developer = record.get("d").properties;

    return {
      ...developer,
      skills: record.get("skills").map(
        (skill: any) => skill.properties
      ),
      projects: record.get("projects").map(
        (project: any) => project.properties
      ),
      companies: record.get("companies").map(
        (company: any) => company.properties
      ),
    };
  } finally {
    await session.close();
  }
}

export async function getRecommendedJobs(developerId: string) {
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (d:Developer {id: $developerId})
            -[:HAS_SKILL]->(s:Skill)
            <-[:REQUIRES]-(j:Job)

      WITH j,
           count(s) AS matchingSkills,
           collect(s.name) AS matchedSkills

      MATCH (c:Company)-[:OFFERS]->(j)

      RETURN j.id AS jobId,
             j.title AS jobTitle,
             j.description AS description,
             j.location AS location,
             j.experienceRequired AS experienceRequired,
             c.name AS company,
             matchingSkills,
             matchedSkills

      ORDER BY matchingSkills DESC
      `,
      { developerId }
    );

    return result.records.map((record) => ({
      jobId: record.get("jobId"),
      jobTitle: record.get("jobTitle"),
      description: record.get("description"),
      location: record.get("location"),
      experienceRequired: record.get("experienceRequired"),
      company: record.get("company"),
      matchingSkills: record.get("matchingSkills").toNumber(),
      matchedSkills: record.get("matchedSkills"),
    }));
  } finally {
    await session.close();
  }
}