/**
 * Adds more demo events to your database WITHOUT deleting anything.
 * Events whose title already exists are skipped, so it is safe to run twice.
 *
 * Usage (inside the server folder):   node addEvents.js
 */
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']); // helps MongoDB Atlas connections on some networks

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Event = require('./models/Event');

dotenv.config();

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=1200`;
// date helper: n days from today at a given hour (24h)
const inDays = (n, hour = 18) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    d.setHours(hour, 0, 0, 0);
    return d;
};

// totalSeats, sold -> availableSeats = totalSeats - sold. ticketPrice is in rupees (0 = free).
const events = [
    // Music
    { title: 'Sunset Jazz on the Terrace', category: 'Music', location: 'Hauz Khas Social, New Delhi', ticketPrice: 800, totalSeats: 120, sold: 84, days: 6, hour: 19, image: img('photo-1511192336575-5a79af67a629'),
      description: 'A relaxed evening of live jazz as the sun goes down over the city. Quartet sets, small plates and a full bar, with seating on the open terrace.' },
    { title: 'Arijit Nights: Live Unplugged', category: 'Music', location: 'Jawaharlal Nehru Stadium, New Delhi', ticketPrice: 2499, totalSeats: 2000, sold: 1620, days: 21, hour: 19, image: img('photo-1501281668745-f7f57925c3b4'),
      description: 'An unplugged evening of Bollywood favourites with a full live band. Doors open at 6 PM and the show starts at 7:30 PM sharp.' },
    { title: 'Indie Sunday Open Air', category: 'Music', location: 'Cubbon Park Amphitheatre, Bengaluru', ticketPrice: 600, totalSeats: 600, sold: 210, days: 12, hour: 16, image: img('photo-1470229722913-7c0e2dbbafd3'),
      description: 'Six independent bands, one long afternoon. Bring a mat, grab a coffee from the food stalls and discover your next favourite artist.' },
    { title: 'Sufi Soul Evening', category: 'Music', location: 'Nehru Centre, Mumbai', ticketPrice: 1200, totalSeats: 350, sold: 330, days: 9, hour: 19, image: img('photo-1493225457124-a3eb161ffa5f'),
      description: 'Qawwali and Sufi folk by candlelight. A seated, intimate show with some of the finest voices on the circuit.' },
    { title: 'Bassline Warehouse: Techno Night', category: 'Music', location: 'The Warehouse, Pune', ticketPrice: 1800, totalSeats: 800, sold: 540, days: 28, hour: 22, image: img('photo-1429962714451-bb934ecdc4ec'),
      description: 'Eight hours of techno across two floors with visuals by local studios. 21+ only, valid ID required at the door.' },

    // Technology
    { title: 'AI & Machine Learning Summit India', category: 'Technology', location: 'Bangalore International Centre, Bengaluru', ticketPrice: 3500, totalSeats: 800, sold: 420, days: 35, hour: 9, image: img('photo-1531058020387-3be344556be6'),
      description: 'Two days of talks, demos and workshops on applied AI from engineers building real products. Includes lunch, a workshop pass and recordings.' },
    { title: 'Hack the Campus 48-Hour Hackathon', category: 'Technology', location: 'IIT Delhi, New Delhi', ticketPrice: 0, totalSeats: 300, sold: 190, days: 17, hour: 10, image: img('photo-1504384308090-c894fdcc538d'),
      description: 'Teams of up to four build something useful in 48 hours. Mentors on site, meals provided, and prizes worth ₹5 lakh for the top teams.' },
    { title: 'Cloud Native Meetup', category: 'Technology', location: 'WeWork Galaxy, Hyderabad', ticketPrice: 0, totalSeats: 150, sold: 96, days: 8, hour: 18, image: img('photo-1517457373958-b7bdd4587205'),
      description: 'Three short talks on Kubernetes, observability and cost control, followed by pizza and networking.' },
    { title: 'Web3 and Fintech Expo', category: 'Technology', location: 'Bombay Exhibition Centre, Mumbai', ticketPrice: 1500, totalSeats: 1200, sold: 380, days: 44, hour: 10, image: img('photo-1540575467063-178a50c2df87'),
      description: 'Startups, regulators and investors on one floor. Panels on payments, UPI innovation and the future of digital finance.' },

    // Business
    { title: 'Startup Founders Mixer', category: 'Business', location: 'T-Hub, Hyderabad', ticketPrice: 500, totalSeats: 200, sold: 120, days: 11, hour: 18, image: img('photo-1511578314322-379afb476865'),
      description: 'Meet founders, operators and early-stage investors in a relaxed setting. Lightning pitches from five startups and open networking.' },
    { title: 'Women in Leadership Conclave', category: 'Business', location: 'Taj Palace, New Delhi', ticketPrice: 4000, totalSeats: 400, sold: 275, days: 40, hour: 9, image: img('photo-1505373877841-8d25f7d46678'),
      description: 'A full-day conclave with keynotes, fireside chats and mentoring circles with leaders across industries.' },
    { title: 'Digital Marketing Masterclass', category: 'Business', location: 'Convention Centre, Jaipur', ticketPrice: 999, totalSeats: 250, sold: 70, days: 19, hour: 10, image: img('photo-1556761175-5973dc0f32e7'),
      description: 'A practical one-day class on SEO, paid ads and email that you can apply to your business the next morning. Templates included.' },

    // Art & culture
    { title: 'Street Art Walk and Mural Tour', category: 'Art', location: 'Shahpur Jat, New Delhi', ticketPrice: 350, totalSeats: 40, sold: 33, days: 5, hour: 8, image: img('photo-1499781350541-7783f6c6a0c8'),
      description: 'A guided two-hour walk through Delhi’s best street murals with the artists who painted them. Comfortable shoes recommended.' },
    { title: 'Contemporary Photography Exhibition', category: 'Art', location: 'National Gallery of Modern Art, New Delhi', ticketPrice: 200, totalSeats: 500, sold: 150, days: 14, hour: 11, image: img('photo-1531243269054-5ebf6f34081e'),
      description: 'Over 120 works from 30 photographers exploring city life across South Asia. Curator-led tours at 12 PM and 4 PM.' },
    { title: 'Pottery and Wine Evening', category: 'Art', location: 'Clay Studio, Goa', ticketPrice: 1400, totalSeats: 24, sold: 19, days: 23, hour: 17, image: img('photo-1565193566173-7a0ee3dbe261'),
      description: 'Throw your first pot on the wheel with a master potter while you sip local wine. All materials included and you take your piece home after firing.' },

    // Food
    { title: 'Delhi Street Food Festival', category: 'Food', location: 'Dilli Haat, New Delhi', ticketPrice: 150, totalSeats: 3000, sold: 1250, days: 15, hour: 12, image: img('photo-1555939594-58d7cb561ad1'),
      description: 'Over 60 stalls serving chaat, kebabs, parathas and desserts from across the city. Entry covers one tasting token.' },
    { title: 'Coastal Seafood Supper Club', category: 'Food', location: 'Candolim, Goa', ticketPrice: 3200, totalSeats: 60, sold: 52, days: 26, hour: 20, image: img('photo-1414235077428-338989a2e8c0'),
      description: 'A seven-course seafood tasting menu by a guest chef, paired with local spirits. Long communal tables by the beach.' },

    // Sports
    { title: 'Delhi Half Marathon 2026', category: 'Sports', location: 'Rajpath, New Delhi', ticketPrice: 700, totalSeats: 5000, sold: 3400, days: 52, hour: 5, image: img('photo-1452626038306-9aae5e071dd3'),
      description: 'A 21 km half marathon with 10 km and 5 km options. Entry includes a race kit, timing chip, medal and breakfast at the finish.' },
    { title: 'Sunrise Yoga by the Lake', category: 'Sports', location: 'Sukhna Lake, Chandigarh', ticketPrice: 0, totalSeats: 100, sold: 41, days: 4, hour: 6, image: img('photo-1544367567-0f2fcb009e0b'),
      description: 'A free 90-minute beginner-friendly flow at sunrise. Bring your own mat and water.' },

    // Comedy
    { title: 'Stand-Up Saturday: The Big Night', category: 'Comedy', location: 'Canvas Laugh Club, Mumbai', ticketPrice: 900, totalSeats: 220, sold: 205, days: 10, hour: 20, image: img('photo-1527224857830-43a7acc85260'),
      description: 'Five of the country’s sharpest stand-ups in one lineup, with a surprise headliner. Strictly 18+.' },
    { title: 'Improv Comedy Workshop and Show', category: 'Comedy', location: 'Social Offline, Bengaluru', ticketPrice: 650, totalSeats: 80, sold: 22, days: 20, hour: 17, image: img('photo-1585699324551-f6c309eedeca'),
      description: 'Learn the basics of improv in a two-hour workshop, then watch the pros perform a full live show.' },

    // Workshops & education
    { title: 'Beginner Photography Workshop', category: 'Workshop', location: 'Lodhi Garden, New Delhi', ticketPrice: 1100, totalSeats: 30, sold: 18, days: 7, hour: 7, image: img('photo-1452587925148-ce544e77e70d'),
      description: 'Learn exposure, composition and light on a guided morning shoot. Bring any camera, including a phone.' },
    { title: 'Weekend UX Design Bootcamp', category: 'Workshop', location: 'Design Hub, Bengaluru', ticketPrice: 2500, totalSeats: 60, sold: 28, days: 31, hour: 10, image: img('photo-1522071820081-009f0129c71c'),
      description: 'Two days covering user research, wireframing and prototyping with a real design brief. Laptop required, and you leave with a portfolio piece.' },
    { title: 'Intro to Personal Finance and Investing', category: 'Education', location: 'Online and Studio, Kolkata', ticketPrice: 0, totalSeats: 500, sold: 280, days: 13, hour: 11, image: img('photo-1554224155-6726b3ff858f'),
      description: 'A free beginner session on budgeting, mutual funds and building an emergency fund, with Q&A at the end.' },
    { title: 'Book Lovers Festival', category: 'Education', location: 'India Habitat Centre, New Delhi', ticketPrice: 250, totalSeats: 900, sold: 310, days: 38, hour: 10, image: img('photo-1481627834876-b7833e8f5570'),
      description: 'Author readings, panel talks, a second-hand book market and a children’s corner, spread over two days.' },
];

async function run() {
    if (!process.env.MONGODB_URL) {
        console.error('MONGODB_URL is not set. Check your .env file.');
        process.exit(1);
    }
    await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 8000 });
    console.log('MongoDB connected');

    const owner = (await User.findOne({ role: 'admin' })) || (await User.findOne());
    if (!owner) {
        console.error('No users found. Run "node seed.js" first (or register an admin), then try again.');
        process.exit(1);
    }

    let added = 0;
    let skipped = 0;
    for (const { sold, days, hour, ...e } of events) {
        if (await Event.exists({ title: e.title })) {
            skipped++;
            continue;
        }
        await Event.create({ ...e, date: inDays(days, hour), availableSeats: e.totalSeats - sold, createdBy: owner._id });
        added++;
    }

    console.log(`Done. Added ${added} new events, skipped ${skipped} that already existed.`);
    await mongoose.disconnect();
}

run().catch((err) => {
    console.error('Failed:', err.message);
    process.exit(1);
});