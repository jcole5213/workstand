# Get your own Workstand

Workstand runs inside your own Claude account. Your garage, logs and bike art stay private to you.

## Before you start

- A Claude account.
- The [Get Workstand page](https://claude.ai/artifact/YYwebtuaNKpXcHDUJv1Rpp) has a live demo and a copy button for the prompt below.
- A Strava subscription. Strava's Claude connector needs one.
- The Strava connector added in Claude: **Settings → Connectors → Strava → Connect**, then sign in to Strava.

## Setup prompt

Start a new chat in Claude and paste this:

```
Please set up Workstand for me. It's a bike maintenance log that runs as a Claude artifact.

1. Fetch https://raw.githubusercontent.com/jcole5213/workstand/HEAD/workstand.html and read the whole file.
2. Publish it unchanged as a new artifact in my account, with the icon "bike" and these capabilities:
   {"db": {}, "user": {}, "assets": {}, "mcp": {"servers": [{"server": "Strava", "tools": ["get_gear", "search_activities"]}]}}
3. Give me the link. Don't add any data. The page walks me through connecting Strava, picking my bikes and adding bike art.
```

Open the link Claude gives you and follow the setup on screen. It takes about three minutes.

## Updating later

When there's a new version, paste this into Claude with your own Workstand link:

```
Update my Workstand artifact at <your Workstand link> to the latest version.
Read my artifact first, then fetch https://raw.githubusercontent.com/jcole5213/workstand/HEAD/workstand.html
and republish it to the same link, unchanged, keeping the same capabilities. My data stays where it is.
```
