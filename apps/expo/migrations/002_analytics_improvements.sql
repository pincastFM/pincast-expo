-- Add metadata column to analytics table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'analytics' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE analytics ADD COLUMN metadata JSONB;
  END IF;
END $$;

-- Create an index on (app_id, ts DESC) for efficient queries by app with time sorting
CREATE INDEX IF NOT EXISTS idx_analytics_app_id_ts_desc ON analytics (app_id, ts DESC);

-- Create materialized view for rolling 7-day session counts
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_week AS
SELECT 
  app_id,
  COUNT(*) FILTER (WHERE event = 'session_start') AS sessions7d
FROM 
  analytics
WHERE 
  ts > (CURRENT_DATE - INTERVAL '7 days')
GROUP BY 
  app_id;

-- Create unique index on app_id for the materialized view to allow for efficient refreshes
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_week_app_id ON analytics_week (app_id);

-- Create a function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_analytics_week()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY analytics_week;
END;
$$ LANGUAGE plpgsql;

-- Optionally create a comment on the function to explain its purpose
COMMENT ON FUNCTION refresh_analytics_week() IS 'Refreshes the analytics_week materialized view, which contains rolling 7-day session counts per app';