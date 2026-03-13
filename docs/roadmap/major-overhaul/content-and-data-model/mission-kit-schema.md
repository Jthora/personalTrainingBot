# Mission Kit Schema

## Fields (draft)
- id (string)
- title (string)
- synopsis (string)
- mission_type (enum)
- difficulty (enum)
- estimated_duration (minutes)
- prerequisites (list of ids/skills)
- drills (array of drill ids with ordering)
- readiness_impact (object: score delta, decay rules)
- assets (links with cacheability markers)
- version, updated_at

## Notes
- Prefer text-first assets for offline/low-data.
- Include cache directives per asset.
