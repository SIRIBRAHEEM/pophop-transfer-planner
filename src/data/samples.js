export const SAMPLE_TRIPS = [
  {
    id: 'sample-bida-abuja',
    name: 'Bida to Abuja, morning run',
    toStation: 25,
    buffer: 10,
    legs: [
      { id: 's1', mode: 'Ride', from: 'Bida town centre', to: 'Bida motor park', depart: '06:00', arrive: '06:20', note: 'Meet the driver by the main gate' },
      { id: 's2', mode: 'Bus', from: 'Bida motor park', to: 'Minna park', depart: '06:35', arrive: '08:10', note: 'Seat near the front, keep ticket handy' },
      { id: 's3', mode: 'Walk', from: 'Minna park', to: 'Minna shuttle stop', depart: '08:15', arrive: '08:25', note: 'Short walk, follow the signs' },
      { id: 's4', mode: 'Bus', from: 'Minna shuttle stop', to: 'Abuja central park', depart: '08:40', arrive: '11:05', note: 'Text family when you pass Suleja' },
    ],
  },
  {
    id: 'sample-peninsula',
    name: 'Peninsula day trip',
    toStation: 15,
    buffer: 10,
    legs: [
      { id: 'p1', mode: 'Walk', from: 'Home', to: 'Palo Alto station', depart: '09:00', arrive: '09:15', note: 'Bring a light jacket' },
      { id: 'p2', mode: 'Train', from: 'Palo Alto station', to: 'San Mateo station', depart: '09:24', arrive: '09:52', note: 'Northbound platform' },
      { id: 'p3', mode: 'Bus', from: 'San Mateo station', to: 'Bayfront trailhead', depart: '10:02', arrive: '10:20', note: 'Bayfront loop bus' },
      { id: 'p4', mode: 'Walk', from: 'Bayfront trailhead', to: 'Bayfront cafe', depart: '10:25', arrive: '10:40', note: 'Meet friends at the cafe' },
    ],
  },
];
