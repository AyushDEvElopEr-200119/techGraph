// 1. List developers
MATCH (d:Developer)
RETURN d.id, d.name, d.experience, d.location
ORDER BY d.name;


// 2. Developer → Skills
MATCH (d:Developer {id: $developerId})
      -[:HAS_SKILL]->(s:Skill)
RETURN d.name AS developer,
       collect(s.name) AS skills;


// 3. Developer → Project → Technology
MATCH (d:Developer {id: $developerId})
      -[:WORKED_ON]->(p:Project)
      -[:USES]->(t:Technology)
RETURN d.name AS developer,
       p.name AS project,
       collect(t.name) AS technologies;


// 4. Developer → Skill ← Job
MATCH (d:Developer {id: $developerId})
      -[:HAS_SKILL]->(s:Skill)
      <-[:REQUIRES]-(j:Job)
RETURN j.id AS jobId,
       j.title AS jobTitle,
       count(s) AS matchingSkills,
       collect(s.name) AS matchedSkills
ORDER BY matchingSkills DESC;