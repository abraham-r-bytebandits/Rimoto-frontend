// Admin Data
export const pendingRides = [
  { id: 1, name: "ECR Coastal Stretch", route: "Chennai → Mahabalipuram", date: "Apr 27, 2026", group: "Madras Riders", organizer: "Suresh Kumar", skill: "Beginner", time: "5:30 AM", distance: "120 km", bikeType: "All Bikes", submittedAt: "2h ago", contact: "+91 98400 12345" },
  { id: 2, name: "Yelagiri Climb", route: "Chennai → Yelagiri", date: "May 4, 2026", group: "Chennai Bikers Brotherhood", organizer: "Vikram Nair", skill: "Intermediate", time: "4:00 AM", distance: "340 km", bikeType: "250cc+", submittedAt: "5h ago", contact: "+91 80000 54321" },
  { id: 3, name: "Pondy Highway Run", route: "Chennai → Pondicherry", date: "May 11, 2026", group: "Night Owls MC", organizer: "Arjun Menon", skill: "Beginner", time: "3:00 AM", distance: "160 km", bikeType: "All Bikes", submittedAt: "1 day ago", contact: "+91 95000 11223" },
  { id: 4, name: "Yercaud Loop Weekend", route: "Chennai → Yercaud", date: "Apr 25, 2026", group: "Tamil Nadu Riders", organizer: "Priya Rajan", skill: "Advanced", time: "4:00 AM", distance: "360 km", bikeType: "500cc+", submittedAt: "2 days ago", contact: "+91 94440 67890" }
];

export const publishedRides = [
  { id: 101, name: "Yelagiri Sunrise Push", route: "Chennai → Yelagiri", date: "Apr 27", status: "Live", featured: true, joins: 34 },
  { id: 102, name: "ECR Sunday Blitz", route: "Chennai → Mahabalipuram", date: "Apr 26", status: "Live", featured: true, joins: 67 },
  { id: 103, name: "Nilgiri Assault", route: "Chennai → Ooty", date: "May 3", status: "Live", featured: true, joins: 18 },
  { id: 104, name: "Pondy Night Run", route: "Chennai → Pondicherry", date: "Apr 25", status: "Live", featured: false, joins: 41 },
  { id: 105, name: "Yercaud First Climb", route: "Chennai → Yercaud", date: "May 10", status: "Live", featured: false, joins: 12 }
];

export const pendingStories = [
  { id: 1, title: "MY FIRST GROUP RIDE — YELAGIRI SUNRISE PUSH CHANGED ME", author: "Karthik R", destination: "Yelagiri", type: "Ride Review", media: "6 photos · No video", submittedAt: "1h ago" },
  { id: 2, title: "FIRST HILL RIDE ON A 150CC — IS YELAGIRI OR YERCAUD BETTER FOR BEGINNERS?", author: "Divya Krishnan", destination: "Yercaud", type: "Gear/Tips", media: "4 photos · 1 video", submittedAt: "6h ago" }
];

export const activities = [
  { id: 1, type: "Approved", message: "Approved: \"Yelagiri Sunrise Push\" by Chennai Riders Collective", time: "10 min ago", color: "success" },
  { id: 2, type: "Story", message: "New story submitted: \"MY FIRST GROUP RIDE — YELAGIRI SUNRISE PUSH CHANGED ME\" by Karthik R", time: "1 hour ago", color: "warning" },
  { id: 3, type: "Rejected", message: "Rejected: \"Goa Beach Ride\" — outside service area", time: "3 hours ago", color: "danger" },
  { id: 4, type: "Featured", message: "Featured slot updated: \"ECR Sunday Blitz\" set as Weekend Pick", time: "5 hours ago", color: "success" },
  { id: 5, type: "Approved", message: "Story approved: \"NILGIRI ASSAULT — 36 HAIRPINS\" by Priya Menon", time: "Yesterday", color: "success" },
  { id: 6, type: "New", message: "New submission: \"Yelagiri Climb\" — pending review", time: "Yesterday", color: "warning" }
];

export const featuredSlots = [
  { id: 1, slot: "01", name: "Yelagiri Sunrise Push", desc: "Chennai → Yelagiri · Apr 27 · Hero Banner" },
  { id: 2, slot: "02", name: "ECR Sunday Blitz", desc: "Chennai → Mahabalipuram · Apr 26 · Weekend Pick" },
  { id: 3, slot: "03", name: "Nilgiri Assault", desc: "Chennai → Ooty · May 3 · Editor's Choice" }
];

// Community Form Data
export const forumPosts = [
  {
    id: 1,
    title: "YELAGIRI VS YERCAUD — WHICH IS BETTER FOR A FIRST TIME HILL RIDER?",
    preview: "Planning my first proper hill ride next weekend. I ride a MT-15 and have about 5,000 km of highway experience but zero hills. Heard Yelagiri has 14 hairpins and Yercaud has 20. Which route is safer and less crowded early morning?",
    author: "Karthik1998",
    time: "2 hours ago",
    votes: 42,
    comments: 18,
    shares: 4,
    routeTag: "Hill Rides",
    flair: "Question",
    flairType: "int",
    isPinned: true,
    image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "HONEST REVIEW: PONDY ECR STRETCH AFTER RECENT RAINS",
    preview: "Did a quick run to Pondicherry this morning. The roads until Mahabalipuram are perfectly fine, but watch out for pothole diversions near Marakkanam. They are doing patch work and it gets super dusty. Definitely wear clear visors if returning after 6 PM.",
    author: "Praveen_Rider",
    time: "5 hours ago",
    votes: 128,
    comments: 34,
    shares: 12,
    routeTag: "Chennai → Pondicherry",
    rating: 3.5,
    flair: "Review",
    flairType: "rev",
    image: "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "NEW CAFE FOUND OFF OMR — ZERO TRAFFIC, GREAT COFFEE",
    preview: "Instead of the usual ECR spots, me and the boys took a detour down a village road near Thiruporur. Found this empty cafe right next to a small lake. Perfect parking space for 10-15 bikes. Sharing the maps link inside.",
    author: "NightOwl_07",
    time: "Yesterday",
    votes: 89,
    comments: 22,
    shares: 45,
    routeTag: "OMR Outskirts",
    flair: "Tip",
    flairType: "tip"
  }
];
