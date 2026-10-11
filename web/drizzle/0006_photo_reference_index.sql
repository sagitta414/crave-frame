CREATE INDEX IF NOT EXISTS collections_photo ON collections(json_extract(data,'$.photo'));
