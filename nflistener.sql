DROP DATABASE IF EXISTS nflistener;
CREATE DATABASE nflistener;
DROP USER IF EXISTS nflistener;
CREATE USER nflistener WITH PASSWORD 'nflistener';
GRANT ALL PRIVILEGES ON DATABASE nflistener TO nflistener;
\c nflistener;
CREATE TABLE messages (
  ID SERIAL PRIMARY KEY,
  runID TEXT,
  runName TEXT,
  runStatus TEXT,
  utcTime TEXT,
  body JSON
);
GRANT ALL PRIVILEGES ON TABLE messages TO nflistener;
GRANT USAGE, SELECT ON SEQUENCE messages_id_seq TO nflistener;
