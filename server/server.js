// server/server.ts
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const snowflake = require('snowflake-sdk');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const snowflakeConnection = snowflake.createConnection({
  account: process.env.SNOWFLAKE_ACCOUNT,
  username: process.env.SNOWFLAKE_USERNAME,
  password: process.env.SNOWFLAKE_PASSWORD,
  warehouse: process.env.SNOWFLAKE_WAREHOUSE,
  database: process.env.SNOWFLAKE_DATABASE,
  schema: process.env.SNOWFLAKE_SCHEMA
});

snowflakeConnection.connect((err) => {
  if (err) {
    console.error('Unable to connect to Snowflake:', err);
  } else {
    console.log('Successfully connected to Snowflake.');
  }
});

app.get('/api/schemas', (req, res) => {
  snowflakeConnection.execute({
    sqlText: 'SHOW SCHEMAS',
    complete: (err, stmt, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const schemas = rows.map(row => row.name);
        res.json(schemas);
      }
    }
  });
});

app.get('/api/databases', (req, res) => {
  snowflakeConnection.execute({
    sqlText: 'SHOW DATABASES',
    complete: (err, stmt, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const databases = rows.map(row => row.name);
        res.json(databases);
      }
    }
  });
});

app.post('/api/execute-query', (req, res) => {
  const { query } = req.body;
  snowflakeConnection.execute({
    sqlText: query,
    complete: (err, stmt, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        const totalCount = stmt.getNumRows();
        const sampleSize = Math.min(100, totalCount);
        res.json({
          sampleResults: rows.slice(0, sampleSize),
          totalCount: totalCount
        });
      }
    }
  });
});

app.get('/api/metadata', (req, res) => {
  snowflakeConnection.execute({
    sqlText: `
      SELECT
        table_name,
        column_name,
        data_type,
        IS_NULLABLE
      FROM
        information_schema.columns
      WHERE
        table_schema = CURRENT_SCHEMA()
    `,
    complete: (err, stmt, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  });
});

app.get('/api/functions', (req, res) => {
  // This is a simplified example. In a real-world scenario,
  // you might want to fetch this from Snowflake's documentation or a custom table.
  const functions = [
    'ABS', 'AVG', 'COUNT', 'MAX', 'MIN', 'SUM',
    // ... add more Snowflake functions here
  ];
  res.json(functions);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

module.exports = app;
