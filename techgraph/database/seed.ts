import neo4j from "neo4j-driver";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../server/.env"),
});

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error("CognoDB environment variables are missing.");
}

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

const developers = [
  {
    id: "dev-001",
    name: "Ayush Srivastava",
    email: "ayushkrsrivastava12@gmail.com",
    experience: 3.5,
    location: "Bengaluru",
  },
  {
    id: "dev-002",
    name: "Rahul Kumar",
    email: "rahul@example.com",
    experience: 3,
    location: "Bengaluru",
  },
  {
    id: "dev-003",
    name: "Priya Singh",
    email: "priya@example.com",
    experience: 2,
    location: "Pune",
  },
  {
    id: "dev-004",
    name: "Arjun Mehta",
    email: "arjun@example.com",
    experience: 5,
    location: "Mumbai",
  },
  {
    id: "dev-005",
    name: "Neha Verma",
    email: "neha@example.com",
    experience: 4,
    location: "Delhi",
  },
];

const skills = [
  { id: "skill-001", name: "React" },
  { id: "skill-002", name: "JavaScript" },
  { id: "skill-003", name: "TypeScript" },
  { id: "skill-004", name: "Node.js" },
  { id: "skill-005", name: "CSS" },
  { id: "skill-006", name: "HTML" },
  { id: "skill-007", name: "Python" },
  { id: "skill-008", name: "Java" },
];

const technologies = [
  { id: "tech-001", name: "React", category: "Frontend" },
  { id: "tech-002", name: "Node.js", category: "Backend" },
  { id: "tech-003", name: "TypeScript", category: "Language" },
  { id: "tech-004", name: "Next.js", category: "Frontend" },
  { id: "tech-005", name: "Express.js", category: "Backend" },
  { id: "tech-006", name: "PostgreSQL", category: "Database" },
  { id: "tech-007", name: "MongoDB", category: "Database" },
  { id: "tech-008", name: "Docker", category: "DevOps" },
];

const companies = [
  {
    id: "company-001",
    name: "TechNova",
    industry: "Software",
    location: "Bengaluru",
  },
  {
    id: "company-002",
    name: "CloudWorks",
    industry: "Cloud Technology",
    location: "Hyderabad",
  },
  {
    id: "company-003",
    name: "DataSphere",
    industry: "Data Technology",
    location: "Pune",
  },
  {
    id: "company-004",
    name: "WebCore",
    industry: "Web Development",
    location: "Mumbai",
  },
];

const projects = [
  {
    id: "project-001",
    name: "E-Commerce Platform",
    description: "Modern online shopping platform",
    year: 2025,
  },
  {
    id: "project-002",
    name: "Admin Dashboard",
    description: "Analytics and management dashboard",
    year: 2025,
  },
  {
    id: "project-003",
    name: "Chat Application",
    description: "Real-time communication application",
    year: 2024,
  },
  {
    id: "project-004",
    name: "Travel Booking Platform",
    description: "Online travel and hotel booking platform",
    year: 2025,
  },
  {
    id: "project-005",
    name: "Developer Portal",
    description: "Developer documentation and API portal",
    year: 2024,
  },
];

const jobs = [
  {
    id: "job-001",
    title: "Frontend Developer",
    description: "Build modern React applications",
    location: "Bengaluru",
    experienceRequired: 2,
  },
  {
    id: "job-002",
    title: "React Developer",
    description: "Develop scalable React interfaces",
    location: "Hyderabad",
    experienceRequired: 2,
  },
  {
    id: "job-003",
    title: "Full Stack Developer",
    description: "Build frontend and backend applications",
    location: "Bengaluru",
    experienceRequired: 3,
  },
  {
    id: "job-004",
    title: "TypeScript Developer",
    description: "Develop TypeScript-based applications",
    location: "Pune",
    experienceRequired: 2,
  },
];

async function seedDatabase() {
  const session = driver.session();

  try {
    console.log("Clearing existing database...");

    await session.run(`
      MATCH (n)
      DETACH DELETE n
    `);

    console.log("Creating developers...");

    await session.run(
      `
      UNWIND $developers AS developer
      CREATE (:Developer {
        id: developer.id,
        name: developer.name,
        email: developer.email,
        experience: developer.experience,
        location: developer.location
      })
      `,
      { developers }
    );

    console.log("Creating skills...");

    await session.run(
      `
      UNWIND $skills AS skill
      CREATE (:Skill {
        id: skill.id,
        name: skill.name
      })
      `,
      { skills }
    );

    console.log("Creating technologies...");

    await session.run(
      `
      UNWIND $technologies AS technology
      CREATE (:Technology {
        id: technology.id,
        name: technology.name,
        category: technology.category
      })
      `,
      { technologies }
    );

    console.log("Creating companies...");

    await session.run(
      `
      UNWIND $companies AS company
      CREATE (:Company {
        id: company.id,
        name: company.name,
        industry: company.industry,
        location: company.location
      })
      `,
      { companies }
    );

    console.log("Creating projects...");

    await session.run(
      `
      UNWIND $projects AS project
      CREATE (:Project {
        id: project.id,
        name: project.name,
        description: project.description,
        year: project.year
      })
      `,
      { projects }
    );

    console.log("Creating jobs...");

    await session.run(
      `
      UNWIND $jobs AS job
      CREATE (:Job {
        id: job.id,
        title: job.title,
        description: job.description,
        location: job.location,
        experienceRequired: job.experienceRequired
      })
      `,
      { jobs }
    );

    console.log("Creating relationships...");

    // Developer → Skills
    await session.run(`
      MATCH (d:Developer {id: "dev-001"})
      MATCH (s:Skill)
      WHERE s.id IN ["skill-001", "skill-002", "skill-003", "skill-005", "skill-006"]
      CREATE (d)-[:HAS_SKILL]->(s)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-002"})
      MATCH (s:Skill)
      WHERE s.id IN ["skill-001", "skill-002", "skill-004", "skill-005"]
      CREATE (d)-[:HAS_SKILL]->(s)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-003"})
      MATCH (s:Skill)
      WHERE s.id IN ["skill-001", "skill-002", "skill-003", "skill-006"]
      CREATE (d)-[:HAS_SKILL]->(s)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-004"})
      MATCH (s:Skill)
      WHERE s.id IN ["skill-002", "skill-004", "skill-007", "skill-008"]
      CREATE (d)-[:HAS_SKILL]->(s)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-005"})
      MATCH (s:Skill)
      WHERE s.id IN ["skill-001", "skill-003", "skill-004", "skill-005"]
      CREATE (d)-[:HAS_SKILL]->(s)
    `);

    // Developer → Projects
    await session.run(`
      MATCH (d:Developer {id: "dev-001"})
      MATCH (p:Project {id: "project-001"})
      CREATE (d)-[:WORKED_ON]->(p)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-002"})
      MATCH (p:Project {id: "project-002"})
      CREATE (d)-[:WORKED_ON]->(p)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-003"})
      MATCH (p:Project {id: "project-003"})
      CREATE (d)-[:WORKED_ON]->(p)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-004"})
      MATCH (p:Project {id: "project-004"})
      CREATE (d)-[:WORKED_ON]->(p)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-005"})
      MATCH (p:Project {id: "project-005"})
      CREATE (d)-[:WORKED_ON]->(p)
    `);

    // Project → Technologies
    await session.run(`
      MATCH (p:Project {id: "project-001"})
      MATCH (t:Technology)
      WHERE t.id IN ["tech-001", "tech-003", "tech-007"]
      CREATE (p)-[:USES]->(t)
    `);

    await session.run(`
      MATCH (p:Project {id: "project-002"})
      MATCH (t:Technology)
      WHERE t.id IN ["tech-001", "tech-003", "tech-006"]
      CREATE (p)-[:USES]->(t)
    `);

    await session.run(`
      MATCH (p:Project {id: "project-003"})
      MATCH (t:Technology)
      WHERE t.id IN ["tech-001", "tech-002", "tech-005"]
      CREATE (p)-[:USES]->(t)
    `);

    await session.run(`
      MATCH (p:Project {id: "project-004"})
      MATCH (t:Technology)
      WHERE t.id IN ["tech-001", "tech-002", "tech-006"]
      CREATE (p)-[:USES]->(t)
    `);

    await session.run(`
      MATCH (p:Project {id: "project-005"})
      MATCH (t:Technology)
      WHERE t.id IN ["tech-003", "tech-004", "tech-008"]
      CREATE (p)-[:USES]->(t)
    `);

    // Developer → Companies
    await session.run(`
      MATCH (d:Developer {id: "dev-001"})
      MATCH (c:Company {id: "company-001"})
      CREATE (d)-[:WORKED_AT]->(c)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-002"})
      MATCH (c:Company {id: "company-002"})
      CREATE (d)-[:WORKED_AT]->(c)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-003"})
      MATCH (c:Company {id: "company-003"})
      CREATE (d)-[:WORKED_AT]->(c)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-004"})
      MATCH (c:Company {id: "company-004"})
      CREATE (d)-[:WORKED_AT]->(c)
    `);

    await session.run(`
      MATCH (d:Developer {id: "dev-005"})
      MATCH (c:Company {id: "company-001"})
      CREATE (d)-[:WORKED_AT]->(c)
    `);

    // Company → Jobs
    await session.run(`
      MATCH (c:Company {id: "company-001"})
      MATCH (j:Job)
      WHERE j.id IN ["job-001", "job-002"]
      CREATE (c)-[:OFFERS]->(j)
    `);

    await session.run(`
      MATCH (c:Company {id: "company-002"})
      MATCH (j:Job {id: "job-003"})
      CREATE (c)-[:OFFERS]->(j)
    `);

    await session.run(`
      MATCH (c:Company {id: "company-003"})
      MATCH (j:Job {id: "job-004"})
      CREATE (c)-[:OFFERS]->(j)
    `);

    // Jobs → Required Skills
    await session.run(`
      MATCH (j:Job {id: "job-001"})
      MATCH (s:Skill)
      WHERE s.id IN ["skill-001", "skill-002", "skill-003", "skill-005"]
      CREATE (j)-[:REQUIRES]->(s)
    `);

    await session.run(`
      MATCH (j:Job {id: "job-002"})
      MATCH (s:Skill)
      WHERE s.id IN ["skill-001", "skill-002", "skill-005"]
      CREATE (j)-[:REQUIRES]->(s)
    `);

    await session.run(`
      MATCH (j:Job {id: "job-003"})
      MATCH (s:Skill)
      WHERE s.id IN ["skill-001", "skill-002", "skill-004", "skill-003"]
      CREATE (j)-[:REQUIRES]->(s)
    `);

    await session.run(`
      MATCH (j:Job {id: "job-004"})
      MATCH (s:Skill)
      WHERE s.id IN ["skill-002", "skill-003"]
      CREATE (j)-[:REQUIRES]->(s)
    `);

    // Jobs → Technologies
    await session.run(`
      MATCH (j:Job {id: "job-001"})
      MATCH (t:Technology)
      WHERE t.id IN ["tech-001", "tech-003"]
      CREATE (j)-[:USES]->(t)
    `);

    await session.run(`
      MATCH (j:Job {id: "job-002"})
      MATCH (t:Technology)
      WHERE t.id IN ["tech-001", "tech-003"]
      CREATE (j)-[:USES]->(t)
    `);

    await session.run(`
      MATCH (j:Job {id: "job-003"})
      MATCH (t:Technology)
      WHERE t.id IN ["tech-001", "tech-002", "tech-003", "tech-005"]
      CREATE (j)-[:USES]->(t)
    `);

    await session.run(`
      MATCH (j:Job {id: "job-004"})
      MATCH (t:Technology)
      WHERE t.id IN ["tech-003", "tech-004"]
      CREATE (j)-[:USES]->(t)
    `);

    console.log("Seed completed successfully.");

    const result = await session.run(`
      MATCH (n)
      RETURN labels(n)[0] AS type, count(n) AS count
      ORDER BY type
    `);

    console.log("\nDatabase summary:");

    for (const record of result.records) {
      console.log(
        `${record.get("type")}: ${record.get("count").toNumber()}`
      );
    }
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await session.close();
    await driver.close();
  }
}

seedDatabase();