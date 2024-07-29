// src/app/utils/snowflake-functions.ts
export interface SnowflakeFunction {
  name: string;
  description: string;
  signature: string;
}

export const SNOWFLAKE_FUNCTIONS: SnowflakeFunction[] = [
  {
    name: 'SYSTEM$WHITELIST',
    description: 'Returns the list of IP addresses and ranges in the IP whitelist for your account.',
    signature: 'SYSTEM$WHITELIST()'
  },
  {
    name: 'SYSTEM$STREAM_HAS_DATA',
    description: 'Returns TRUE if the stream contains change tracking data; otherwise, returns FALSE.',
    signature: 'SYSTEM$STREAM_HAS_DATA(<stream_name>)'
  },
  // Add more Snowflake functions here...
];
