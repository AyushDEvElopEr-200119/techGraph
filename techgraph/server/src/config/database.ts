import neo4j from "neo4j-driver";

const uri = process.env.COGNODB_URI;
const username = process.env.COGNODB_USERNAME;
const password = process.env.COGNODB_PASSWORD;

if (!uri || !username || !password) {
  throw new Error("CognoDB environment variables are missing");
}

const driver = neo4j.driver(
  uri,
  neo4j.auth.basic(username, password)
);

export default driver;