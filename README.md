# Toronto Taxi
A lightweight, dependency-free Canvas 2D endless taxi game inspired by downtown Toronto. Play at https://greenkeewi.github.io/night-shift-taxi/.

## Controls
Enter starts. WASD or arrow keys drive. S/down brakes then reverses; Space brakes; Esc/P pauses; H opens the handbook; L toggles low-power 30 FPS; M toggles sound; R calls roadside assistance. Every menu works with arrows/W/S and Enter. Touch buttons are also available.

## The city
A seeded, connected street grid has two lanes in each direction, sidewalks, crosswalks, signals, curb parking, a divided Gardiner-inspired expressway and slip roads. Recognizable pixel landmarks include Rogers Centre, the CN Tower and Ripley's Aquarium, with Lake Ontario at the south edge. This is a playful, simplified city, not a geographic replica.

Follow the blue route in the driving lane. Pickups and drop-offs happen automatically when aligned and stopped inside the bay. Reverse parking requires a genuine reverse approach. The opening fare goes from Rogers Centre to the aquarium; later dispatches select from 25 destinations. Jobs tighten and traffic builds continuously, with no levels. The clock starts at 16:15 and the first rush-hour peak arrives about four minutes in. Traffic queues, yields at signals and follows lane gaps, with a 64-vehicle cap.

Three missed jobs or zero cab condition ends the shift. Fares earn cash, tips and small repairs. Scores and preferences are stored only in your browser.

## Run locally
Serve the files in dist/ using any static HTTP server. No build step, packages, backend, external fonts or downloaded images are needed. The five game files total about 83 KB uncompressed. The public repository serves these files directly from its root.

## Verification
The pure-engine automated checks cover map generation, lane-based navigation, signals and traffic, collisions, actual input-driven parking, fare progression, recovery and long traffic runs. A cloud-browser keyboard playthrough covers rendering, controls, menus and the fare loop. No physical old-computer benchmark or retention study has been performed.
