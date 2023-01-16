-- The old migrations scripts are seemingly purposefully confusing.
-- This will be an attempt to exactly recreate their database
-- Even if most tables don't seem to see any use.

CREATE TABLE shared_buffers (
  id BIGSERIAL PRIMARY KEY,
  uri VARCHAR(1024)
);

CREATE TABLE shared_buffer_operations (
  id BIGSERIAL PRIMARY KEY,
  data TEXT,
  shared_buffer_id BIGINT REFERENCES shared_buffers(id)
);

CREATE TABLE shared_editors (
  id BIGSERIAL PRIMARY KEY,
  shared_buffer_id BIGINT REFERENCES shared_buffers(id)
);

CREATE TABLE shared_editor_selection_marker_layers (
  id BIGSERIAL PRIMARY KEY,
  site_id BIGINT,
  shared_editor_id BIGINT REFERENCES shared_editors(id),
  marker_ranges TEXT
);

-- Seems everything above this line is no longer used.
-- The values within the tables below track with what the model-layer actually uses.

CREATE TABLE portals (
  id UUID PRIMARY KEY,
  host_peer_id TEXT
);

CREATE TYPE event_enum AS ENUM('create-portal', 'lookup-portal');

CREATE TABLE events (
  id BIGSERIAL PRIMARY KEY,
  name event_enum,
  user_id TEXT,
  portal_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE
);
