// ==========================================
// TechGraph - Graph Data Model
// ==========================================

// NODE TYPES
//
// Developer
//   id, name, email, experience, location
//
// Skill
//   id, name
//
// Technology
//   id, name, category
//
// Project
//   id, name, description, year
//
// Company
//   id, name, industry, location
//
// Job
//   id, title, description, location, experienceRequired


// RELATIONSHIPS
//
// (Developer)-[:HAS_SKILL]->(Skill)
// (Developer)-[:WORKED_ON]->(Project)
// (Developer)-[:WORKED_AT]->(Company)
// (Project)-[:USES]->(Technology)
// (Company)-[:OFFERS]->(Job)
// (Job)-[:REQUIRES]->(Skill)
// (Job)-[:USES]->(Technology)