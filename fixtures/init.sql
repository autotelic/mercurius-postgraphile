CREATE TABLE users
(
  id serial PRIMARY KEY,
  username VARCHAR (50) NOT NULL
);

INSERT INTO users
  (username)
VALUES
  ('test-user');
