/**
 * SRINATH'S MIDNIGHT WORLD — Central Configuration
 * Edit all text, photos, dates, zone names, and birthday messages here!
 */
export const CONFIG = {
  worldTitle: "SRINATH'S MIDNIGHT WORLD",
  recipientName: 'Srinath',
  senderName: 'Joshua',
  birthdayLabel: '17 NOV',

  // Theme colors
  colors: {
    sky: '#040714',
    islandTop: '#0d1430',
    islandBottom: '#070b1c',
    cyan: '#00f5ff',
    pink: '#ff2e93',
    gold: '#ffd166',
    purple: '#7b61ff',
  },

  // 5 Explorable Zones on the Midnight Island
  zones: [
    {
      id: 'midnight',
      name: 'The Missed Midnight',
      shortName: 'Clock Tower',
      position: [0, 0, 14],
      spawnOffset: [0, 1.5, 18],
      color: '#00f5ff',
      hint: 'Walk up to the frozen 12:00 AM clock tower',
    },
    {
      id: 'exams',
      name: 'Exam Hall Ruins',
      shortName: 'Exam Ruins',
      position: [-20, 0, 2],
      spawnOffset: [-15, 1.5, 4],
      color: '#ff2e93',
      hint: 'Kick the giant semester exam books & calculator',
    },
    {
      id: 'zerog',
      name: 'Zero-Gravity Zone',
      shortName: 'Zero-G Ring',
      position: [20, 0, 2],
      spawnOffset: [13, 1.5, 4],
      color: '#00f5ff',
      hint: 'Step inside the glowing ring to float & swim!',
    },
    {
      id: 'gallery',
      name: 'Memory Gallery',
      shortName: 'Our Photos',
      position: [-12, 0, -18],
      spawnOffset: [-9, 1.5, -13],
      color: '#ffd166',
      hint: 'Walk up to any polaroid & press E to zoom in',
    },
    {
      id: 'cake',
      name: 'The Cake Altar',
      shortName: 'Cake Altar',
      position: [12, 0, -18],
      spawnOffset: [9, 1.5, -12],
      color: '#ff2e93',
      hint: 'Collect all 5 stars to unlock the finale!',
    },
  ],

  // 5 Collectible Birthday Stars hidden across the world
  stars: [
    { id: 'star-1', position: [0, 1.8, 7.5], zoneHint: 'Near the Clock Tower path' },
    { id: 'star-2', position: [-21, 2.2, -3.5], zoneHint: 'Behind the Exam Hall Ruins' },
    { id: 'star-3', position: [20, 5.2, 2], zoneHint: 'Floating high in the Zero-Gravity Zone' },
    { id: 'star-4', position: [-14.5, 2.0, -21], zoneHint: 'Beside the Memory Gallery' },
    { id: 'star-5', position: [2, 2.0, -10], zoneHint: 'At the glowing crossroads' },
  ],

  // Zone 1 dialogue
  clockDialogue: "Bro... I know. I'm late. Blame the Anna University semester exams!",

  // Zone 2 funny exam jokes when player kicks/shoves objects
  examJokes: [
    'Unit 3 not completed 😭',
    'Internal marks hanging by a thread',
    'Important questions = entire syllabus',
    'Anna Univ 16-mark trauma',
    'Casio fx-991ES battery low',
    'All-nighter at 3 AM, forgot 17 Nov!',
  ],

  // Zone 3 Zero-G text & toast
  zeroGWords: ['HAPPY', 'BELATED', 'BIRTHDAY', 'SRINATH'],
  zeroGToast: "Exams had gravity. This doesn't.",

  // Zone 4 Memory Gallery photos (4 frames from public/)
  galleryFrames: [
    {
      id: 'img-1',
      src: '/img1.png',
      caption: 'Srinath & Joshua • Day Ones',
      isMain: true,
    },
    {
      id: 'img-2',
      src: '/img2.png',
      caption: 'Certified Broski Moments',
      isMain: false,
    },
    {
      id: 'img-3',
      src: '/img3.png',
      caption: '12 AM Crew Forever',
      isMain: false,
    },
    {
      id: 'img-4',
      src: '/img4.png',
      caption: 'Ride or Die',
      isMain: false,
    },
  ],

  // Floating text cards around the Memory Gallery
  memoryCards: [
    { title: '12 AM wishes since day one', subtitle: 'Zero misses from your side', color: '#00f5ff' },
    { title: 'Certified broski', subtitle: 'Anna Univ survival partner', color: '#ff2e93' },
    { title: 'Ride or die', subtitle: 'Even after belated wishes', color: '#ffd166' },
  ],

  // Zone 5 Finale Message (100% editable!)
  finalMessage: {
    heading: 'Happy Birthday, Srinath!',
    body: [
      "You wished me at 12 AM every year without fail, and this year I missed yours for the exams. Sorry bro, no excuse is good enough, but you know I'm always in your corner.",
      'Wishing you big wins, zero arrears, and a lifetime of chaos with me. Belated, but I mean it.',
    ],
    signature: '— Joshua',
  },

  // Countdown to Srinath's next birthday (17 NOV — Month 1-12, Day 1-31)
  recipientBirthday: {
    month: 11,
    day: 17,
    label: '17 NOV',
    funnyNote:
      "Next 17 NOV at 12:00:00 AM sharp — zero misses from me this time, broski! No Anna University exam excuse allowed.",
  },
};
