/**
 * CityBeat — Venue seed data
 * Çalıştır: node scripts/seedVenues.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Venue = require('../models/Venue');
const { connectDB } = require('../config/database');

const VENUES = [
  { name: 'Kronotrop Coffee', category: 'Kahve', area: 'Karaköy', city: 'İstanbul', address: 'Kemankeş Caddesi, Karaköy', location: { type: 'Point', coordinates: [28.9770, 41.0233] }, openingHours: '08:00 – 22:00, Her gün', checkinsCount: 284 },
  { name: 'Nopa', category: 'Restoran', area: 'Nişantaşı', city: 'İstanbul', address: 'Atiye Sokak, Nişantaşı', location: { type: 'Point', coordinates: [28.9962, 41.0490] }, openingHours: '12:00 – 24:00, Her gün', checkinsCount: 512 },
  { name: 'Moda Sahnesi', category: 'Kültür', area: 'Kadıköy', city: 'İstanbul', address: 'Moda Caddesi, Kadıköy', location: { type: 'Point', coordinates: [29.0290, 40.9814] }, openingHours: '11:00 – 21:00, Sal-Paz', checkinsCount: 176 },
  { name: 'Bebek Kahve', category: 'Kahve', area: 'Bebek', city: 'İstanbul', address: 'Bebek Caddesi, Bebek', location: { type: 'Point', coordinates: [29.0440, 41.0782] }, openingHours: '07:30 – 21:00, Her gün', checkinsCount: 341 },
  { name: 'Münferit', category: 'Bar', area: 'Cihangir', city: 'İstanbul', address: 'Susam Sokak, Cihangir', location: { type: 'Point', coordinates: [28.9840, 41.0330] }, openingHours: '18:00 – 02:00, Her gün', checkinsCount: 227 },
  { name: 'Mandabatmaz', category: 'Kahve', area: 'Beyoğlu', city: 'İstanbul', address: 'Olivia Geçidi, İstiklal', location: { type: 'Point', coordinates: [28.9760, 41.0320] }, openingHours: '09:00 – 23:00, Her gün', checkinsCount: 398 },
  { name: 'MiniMüzikhol', category: 'Müzik', area: 'Şişli', city: 'İstanbul', address: 'Halaskargazi Caddesi, Şişli', location: { type: 'Point', coordinates: [28.9870, 41.0550] }, openingHours: '20:00 – 03:00, Çar-Cts', checkinsCount: 155 },
  { name: 'House Café', category: 'Bar', area: 'Ortaköy', city: 'İstanbul', address: 'Ortaköy Meydanı', location: { type: 'Point', coordinates: [29.0279, 41.0480] }, openingHours: '12:00 – 02:00, Her gün', checkinsCount: 443 },
  { name: 'Salt Galata', category: 'Kültür', area: 'Karaköy', city: 'İstanbul', address: 'Bankalar Caddesi, Karaköy', location: { type: 'Point', coordinates: [28.9762, 41.0248] }, openingHours: '12:00 – 20:00, Sal-Paz', checkinsCount: 209 },
  { name: 'Kofteci Ramiz', category: 'Restoran', area: 'Beşiktaş', city: 'İstanbul', address: 'Sinanpaşa Mah., Beşiktaş', location: { type: 'Point', coordinates: [29.0040, 41.0430] }, openingHours: '11:00 – 22:00, Her gün', checkinsCount: 318 },
];

async function seed() {
  await connectDB();
  await Venue.deleteMany({});
  const inserted = await Venue.insertMany(VENUES);
  console.log(`✅ ${inserted.length} mekan eklendi`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
