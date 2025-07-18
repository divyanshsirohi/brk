#!/bin/bash
mkdir -p public/photos
for file in public/*.HEIC; do
  base=$(basename "$file" .HEIC)
  magick "$file" "public/photos/${base}.jpg"
done
