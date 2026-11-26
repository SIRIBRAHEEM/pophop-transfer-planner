# PopHop - Transfer Planner

Turn a confusing multi-stop trip into big, clear step cards you can follow.

PopHop is a small web app for everyday trips with transfers: a ride to the park, a bus, a short walk, another bus. Add each step with its times and PopHop checks every transfer gap, flags the risky ones, adds up travel and waiting time, and works out when to leave home. A follow along mode lets you tick steps off as you travel. Trips are saved on your device, so the app works offline after the first load. No sign up needed.

## What it does

- Step cards for each ride or walk, with mode, places, times and notes
- Transfer badges: Comfortable (20 min or more), Tight (8 to 19 min), Risky (under 8 min), Missed connection
- Trip totals: moving time, waiting time, longest wait, risky transfer count
- Leave home by calculator with travel-to-stop time and a safety buffer
- Follow along mode with a progress bar for ticking steps off during the trip
- Copy the whole plan as plain text to share or print
- Two ready made sample trips: Bida to Abuja, and a Peninsula day trip
- Saves trips in localStorage on the device. Works offline.

## Run it locally

```bash
npm install
npm run dev
```

## Test and build

```bash
npm test
npm run build
```

Unit tests cover time parsing, leg durations, transfer gaps, trip totals, leave-by maths and input checks.

## Built with

React, Vite, Tailwind CSS. Design system components in the shadcn style, written for this project.

## Built by

Ibrahim Yahaya, Bida, Niger State, Nigeria. Solo project for the Peninsula Innovation Hackathon (10 Nov to 10 Dec 2026).
