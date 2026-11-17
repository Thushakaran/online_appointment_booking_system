import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET =
  process.env.JWT_SECRET || "online-appointment-booking-dev-secret-key";
const JWT_EXPIRATION = "24h";

// ---------------------------------------------------------------------------
// In-Memory Data Store (replaces MySQL/Spring Data JPA for AI Studio runtime)
// ---------------------------------------------------------------------------
let nextUserId = 1;
let nextProviderId = 1;
let nextAvailabilityId = 1;
let nextAppointmentId = 1;

const users = new Map();
const providers = new Map();
const availabilities = new Map();
const appointments = new Map();

function seedDatabase() {
  const pwHash = (pw) => bcrypt.hashSync(pw, 10);

  const adminUser = {
    id: nextUserId++,
    username: "admin",
    email: "admin@example.com",
    password: pwHash("admin123"),
    role: "ADMIN",
  };
  const providerUser1 = {
    id: nextUserId++,
    username: "dr_smith",
    email: "smith@clinic.com",
    password: pwHash("password123"),
    role: "PROVIDER",
  };
  const providerUser2 = {
    id: nextUserId++,
    username: "care_dental",
    email: "dental@clinic.com",
    password: pwHash("password123"),
    role: "PROVIDER",
  };
  const providerUser3 = {
    id: nextUserId++,
    username: "wellness_studio",
    email: "wellness@studio.com",
    password: pwHash("password123"),
    role: "PROVIDER",
  };
  const regularUser = {
    id: nextUserId++,
    username: "alex_user",
    email: "alex@example.com",
    password: pwHash("password123"),
    role: "USER",
  };

  [adminUser, providerUser1, providerUser2, providerUser3, regularUser].forEach(
    (u) => users.set(u.id, u)
  );

  const p1 = {
    id: nextProviderId++,
    userId: providerUser1.id,
    serviceName: "General Medical Consultation",
    description:
      "Comprehensive primary care, preventive health checkups, and personalized treatment plans.",
    profileImage: "",
    phoneNumber: "+1 (555) 234-5678",
    address: "450 Medical Plaza",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    country: "United States",
    servicePricing: "120",
  };
  const p2 = {
    id: nextProviderId++,
    userId: providerUser2.id,
    serviceName: "Family Dental Care",
    description:
      "Routine cleanings, digital diagnostics, cosmetic dentistry, and gentle family dental care.",
    profileImage: "",
    phoneNumber: "+1 (555) 345-6789",
    address: "88 Harbor Street",
    city: "Boston",
    state: "MA",
    zipCode: "02110",
    country: "United States",
    servicePricing: "95",
  };
  const p3 = {
    id: nextProviderId++,
    userId: providerUser3.id,
    serviceName: "Physical Therapy & Rehab",
    description:
      "Sports injury recovery, mobility coaching, and guided rehabilitation sessions.",
    profileImage: "",
    phoneNumber: "+1 (555) 456-7890",
    address: "210 Oak Avenue",
    city: "Chicago",
    state: "IL",
    zipCode: "60601",
    country: "United States",
    servicePricing: "110",
  };

  [p1, p2, p3].forEach((p) => providers.set(p.id, p));

  const av1 = {
    id: nextAvailabilityId++,
    providerId: p1.id,
    availableDate: "2026-11-20T09:00",
    isBooked: true,
  };
  const av2 = {
    id: nextAvailabilityId++,
    providerId: p1.id,
    availableDate: "2026-11-20T11:30",
    isBooked: false,
  };
  const av3 = {
    id: nextAvailabilityId++,
    providerId: p1.id,
    availableDate: "2026-11-21T14:00",
    isBooked: false,
  };
  const av4 = {
    id: nextAvailabilityId++,
    providerId: p2.id,
    availableDate: "2026-11-22T10:00",
    isBooked: false,
  };
  const av5 = {
    id: nextAvailabilityId++,
    providerId: p2.id,
    availableDate: "2026-11-23T15:30",
    isBooked: false,
  };
  const av6 = {
    id: nextAvailabilityId++,
    providerId: p3.id,
    availableDate: "2026-11-24T13:00",
    isBooked: false,
  };

  [av1, av2, av3, av4, av5, av6].forEach((a) => availabilities.set(a.id, a));

  const apt1 = {
    id: nextAppointmentId++,
    userId: regularUser.id,
    providerId: p1.id,
    availabilityId: av1.id,
    appointmentDate: av1.availableDate,
    status: "PENDING",
  };
  appointments.set(apt1.id, apt1);
}

seedDatabase();

// ---------------------------------------------------------------------------
// Helpers & Hydration
// ---------------------------------------------------------------------------
function sanitizeUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

function hydrateProvider(provider, includeAllAvailabilities = false) {
  if (!provider) return null;
  const user = users.get(provider.userId);
  const provAvailabilities = Array.from(availabilities.values())
    .filter(
      (a) =>
        a.providerId === provider.id && (includeAllAvailabilities || !a.isBooked)
    )
    .map((a) => ({
      id: a.id,
      availableDate: a.availableDate,
      isBooked: a.isBooked,
    }));

  return {
    id: provider.id,
    user: sanitizeUser(user),
    serviceName: provider.serviceName,
    description: provider.description,
    profileImage: provider.profileImage,
    phoneNumber: provider.phoneNumber,
    address: provider.address,
    city: provider.city,
    state: provider.state,
    zipCode: provider.zipCode,
    country: provider.country,
    servicePricing: provider.servicePricing,
    availabilities: provAvailabilities,
  };
}

function hydrateAvailability(av) {
  if (!av) return null;
  const provider = providers.get(av.providerId);
  return {
    id: av.id,
    availableDate: av.availableDate,
    isBooked: av.isBooked,
    provider: provider ? hydrateProvider(provider) : null,
  };
}

function hydrateAppointment(apt) {
  if (!apt) return null;
  const user = users.get(apt.userId);
  const provider = providers.get(apt.providerId);
  const availability = availabilities.get(apt.availabilityId);
  return {
    id: apt.id,
    user: sanitizeUser(user),
    provider: provider ? hydrateProvider(provider) : null,
    availability: availability
      ? {
          id: availability.id,
          availableDate: availability.availableDate,
          isBooked: availability.isBooked,
        }
      : null,
    appointmentDate: apt.appointmentDate,
    status: apt.status,
  };
}

function paginate(items, pageParam = 0, sizeParam = 10) {
  const page = Math.max(0, Number.parseInt(pageParam, 10) || 0);
  const size = Math.max(1, Number.parseInt(sizeParam, 10) || 10);
  const totalElements = items.length;
  const totalPages = Math.ceil(totalElements / size);
  const content = items.slice(page * size, page * size + size);
  return {
    content,
    page,
    size,
    totalElements,
    totalPages,
    hasNext: page < totalPages - 1,
    hasPrevious: page > 0,
  };
}

function findUserByUsername(username) {
  for (const user of users.values()) {
    if (user.username === username) return user;
  }
  return null;
}

function findUserByEmail(email) {
  for (const user of users.values()) {
    if (user.email.toLowerCase() === String(email).toLowerCase()) return user;
  }
  return null;
}

function findProviderByUserId(userId) {
  for (const provider of providers.values()) {
    if (provider.userId === userId) return provider;
  }
  return null;
}

function findProviderByUsername(username) {
  const user = findUserByUsername(username);
  if (!user) return null;
  return findProviderByUserId(user.id);
}

// ---------------------------------------------------------------------------
// Auth Middleware
// ---------------------------------------------------------------------------
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.slice(7).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserByUsername(decoded.sub);
    if (!user) {
      return res.status(401).json({ error: "User no longer exists" });
    }
    req.auth = { id: user.id, username: user.username, role: user.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.auth) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (!roles.includes(req.auth.role)) {
      return res.status(403).json({ error: "Access denied" });
    }
    next();
  };
}

// ---------------------------------------------------------------------------
// Express App
// ---------------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.text({ type: "text/plain" }));

// --- Auth Routes (/api/auth) ---
app.post("/api/auth/register", (req, res) => {
  const { username, email, password, role } = req.body || {};
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, email, and password are required" });
  }
  if (findUserByEmail(email)) {
    return res.status(400).json({ error: "Email already in use" });
  }
  if (findUserByUsername(username)) {
    return res.status(400).json({ error: "Username already in use" });
  }
  if (role === "ADMIN") {
    return res.status(400).json({
      error: "Admin role cannot be registered through public endpoint",
    });
  }

  const assignedRole = role === "PROVIDER" ? "PROVIDER" : "USER";
  const newUser = {
    id: nextUserId++,
    username: String(username).trim(),
    email: String(email).trim(),
    password: bcrypt.hashSync(password, 10),
    role: assignedRole,
  };
  users.set(newUser.id, newUser);
  return res.json({ message: "User registered successfully" });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  const user = findUserByUsername(username);
  if (!user || !password || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = jwt.sign(
    { sub: user.username, role: user.role, id: user.id },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );

  return res.json({
    token,
    username: user.username,
    role: user.role,
    id: user.id,
  });
});

// --- Dashboard Routes (/api/dashboard) ---
app.get("/api/dashboard/stats", (_req, res) => {
  const allAppointments = Array.from(appointments.values());
  const upcomingAppointments = allAppointments.filter(
    (a) => a.status === "PENDING"
  ).length;
  return res.json({
    totalProviders: providers.size,
    totalAppointments: allAppointments.length,
    upcomingAppointments,
    totalUsers: users.size,
  });
});

// --- User Routes (/api/users) ---
app.post("/api/users", authenticate, (req, res) => {
  const { username, email, password, role } = req.body || {};
  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "Username, email, and password are required" });
  }
  if (findUserByUsername(username) || findUserByEmail(email)) {
    return res.status(409).json({ error: "Username or email already exists" });
  }
  const newUser = {
    id: nextUserId++,
    username: String(username).trim(),
    email: String(email).trim(),
    password: bcrypt.hashSync(password, 10),
    role: role || "USER",
  };
  users.set(newUser.id, newUser);
  return res.json(sanitizeUser(newUser));
});

app.get("/api/users", authenticate, requireRole("ADMIN"), (_req, res) => {
  return res.json(Array.from(users.values()).map(sanitizeUser));
});

app.get(
  "/api/users/paginated",
  authenticate,
  requireRole("ADMIN"),
  (req, res) => {
    const allUsers = Array.from(users.values()).map(sanitizeUser);
    return res.json(paginate(allUsers, req.query.page, req.query.size));
  }
);

app.get("/api/users/me", authenticate, (req, res) => {
  const user = users.get(req.auth.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(sanitizeUser(user));
});

app.post("/api/users/change-password", authenticate, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const user = users.get(req.auth.id);
  if (!user) return res.status(404).json({ error: "User not found" });
  if (
    !currentPassword ||
    !bcrypt.compareSync(currentPassword, user.password)
  ) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }
  user.password = bcrypt.hashSync(newPassword, 10);
  return res.json({ message: "Password changed successfully" });
});

app.get("/api/users/:id", authenticate, (req, res) => {
  const id = Number(req.params.id);
  const user = users.get(id);
  if (!user) {
    return res.status(404).json({ error: `User not found with id: ${id}` });
  }
  return res.json(sanitizeUser(user));
});

app.put("/api/users/:id", authenticate, (req, res) => {
  const id = Number(req.params.id);
  const existing = users.get(id);
  if (!existing) {
    return res.status(404).json({ error: `User not found with id: ${id}` });
  }
  const isAdmin = req.auth.role === "ADMIN";
  const isOwnProfile = req.auth.id === existing.id;
  if (!isAdmin && !isOwnProfile) {
    return res.status(403).json({ error: "Access denied" });
  }

  const { username, email, password } = req.body || {};
  if (username && username.trim() && username.trim() !== existing.username) {
    if (findUserByUsername(username.trim())) {
      return res.status(409).json({ error: "Username already exists" });
    }
    existing.username = username.trim();
  }
  if (email && email.trim() && email.trim() !== existing.email) {
    if (findUserByEmail(email.trim())) {
      return res.status(409).json({ error: "Email already exists" });
    }
    existing.email = email.trim();
  }
  if (password && password.trim()) {
    existing.password = bcrypt.hashSync(password, 10);
  }
  return res.json(sanitizeUser(existing));
});

app.delete("/api/users/:id", authenticate, requireRole("ADMIN"), (req, res) => {
  const id = Number(req.params.id);
  if (!users.has(id)) {
    return res.status(404).json({ error: `User not found with id: ${id}` });
  }
  // Remove associated provider, availabilities, and appointments
  for (const [pId, p] of providers.entries()) {
    if (p.userId === id) {
      for (const [avId, av] of availabilities.entries()) {
        if (av.providerId === pId) availabilities.delete(avId);
      }
      providers.delete(pId);
    }
  }
  for (const [aptId, apt] of appointments.entries()) {
    if (apt.userId === id) appointments.delete(aptId);
  }
  users.delete(id);
  return res.send("User deleted successfully.");
});

// --- Provider Routes (/api/providers) ---
function filterProviders(query, field = "general") {
  const q = String(query || "")
    .trim()
    .toLowerCase();
  const list = Array.from(providers.values()).map((p) => hydrateProvider(p));
  if (!q) return list;

  return list.filter((p) => {
    switch (field) {
      case "service":
        return (p.serviceName || "").toLowerCase().includes(q);
      case "city":
        return (p.city || "").toLowerCase().includes(q);
      case "description":
        return (p.description || "").toLowerCase().includes(q);
      default:
        return (
          (p.serviceName || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q) ||
          (p.city || "").toLowerCase().includes(q) ||
          (p.state || "").toLowerCase().includes(q) ||
          (p.address || "").toLowerCase().includes(q) ||
          (p.user?.username || "").toLowerCase().includes(q)
        );
    }
  });
}

app.get("/api/providers", (_req, res) => {
  return res.json(
    Array.from(providers.values()).map((p) => hydrateProvider(p))
  );
});

app.get("/api/providers/paginated", (req, res) => {
  const list = Array.from(providers.values()).map((p) => hydrateProvider(p));
  return res.json(paginate(list, req.query.page, req.query.size));
});

app.get("/api/providers/search", (req, res) => {
  return res.json(filterProviders(req.query.q, "general"));
});

app.get("/api/providers/search/paginated", (req, res) => {
  return res.json(
    paginate(
      filterProviders(req.query.q, "general"),
      req.query.page,
      req.query.size
    )
  );
});

app.get("/api/providers/search/service", (req, res) => {
  return res.json(filterProviders(req.query.serviceName, "service"));
});

app.get("/api/providers/search/service/paginated", (req, res) => {
  return res.json(
    paginate(
      filterProviders(req.query.serviceName, "service"),
      req.query.page,
      req.query.size
    )
  );
});

app.get("/api/providers/search/city", (req, res) => {
  return res.json(filterProviders(req.query.city, "city"));
});

app.get("/api/providers/search/city/paginated", (req, res) => {
  return res.json(
    paginate(
      filterProviders(req.query.city, "city"),
      req.query.page,
      req.query.size
    )
  );
});

app.get("/api/providers/search/description", (req, res) => {
  return res.json(filterProviders(req.query.description, "description"));
});

app.get("/api/providers/search/description/paginated", (req, res) => {
  return res.json(
    paginate(
      filterProviders(req.query.description, "description"),
      req.query.page,
      req.query.size
    )
  );
});

app.get(
  "/api/providers/me",
  authenticate,
  requireRole("PROVIDER"),
  (req, res) => {
    const provider = findProviderByUserId(req.auth.id);
    if (!provider) {
      return res.status(404).json({ error: "Provider not found" });
    }
    return res.json(hydrateProvider(provider));
  }
);

app.get("/api/providers/username/:username", authenticate, (req, res) => {
  const provider = findProviderByUsername(req.params.username);
  if (!provider) {
    return res.status(404).json({ error: "Provider not found" });
  }
  return res.json(hydrateProvider(provider));
});

app.get("/api/providers/:id", (req, res) => {
  const id = Number(req.params.id);
  const provider = providers.get(id);
  if (!provider) {
    return res
      .status(404)
      .json({ error: `Provider not found with id: ${id}` });
  }
  return res.json(hydrateProvider(provider));
});

app.post(
  "/api/providers",
  authenticate,
  requireRole("PROVIDER", "ADMIN"),
  (req, res) => {
    const body = req.body || {};
    const targetUserId =
      req.auth.role === "ADMIN" && body.userId
        ? Number(body.userId)
        : req.auth.id;
    const targetUser = users.get(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = findProviderByUserId(targetUserId);
    if (existing) {
      return res
        .status(400)
        .json({ message: "Provider profile already exists for this user" });
    }

    if (req.auth.role === "ADMIN" && targetUser.role === "USER") {
      targetUser.role = "PROVIDER";
    }

    const newProvider = {
      id: nextProviderId++,
      userId: targetUserId,
      serviceName: body.serviceName || "",
      description: body.description || "",
      profileImage: body.profileImage || "",
      phoneNumber: body.phoneNumber || "",
      address: body.address || "",
      city: body.city || "",
      state: body.state || "",
      zipCode: body.zipCode || "",
      country: body.country || "",
      servicePricing: body.servicePricing || "",
    };
    providers.set(newProvider.id, newProvider);
    return res.status(201).json(hydrateProvider(newProvider));
  }
);

app.put(
  "/api/providers/:id",
  authenticate,
  requireRole("PROVIDER", "ADMIN"),
  (req, res) => {
    const id = Number(req.params.id);
    const provider = providers.get(id);
    if (!provider) {
      return res
        .status(404)
        .json({ message: `Provider not found with id: ${id}` });
    }
    if (req.auth.role !== "ADMIN" && provider.userId !== req.auth.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    const body = req.body || {};
    provider.serviceName = body.serviceName ?? provider.serviceName;
    provider.description = body.description ?? provider.description;
    provider.profileImage = body.profileImage ?? provider.profileImage;
    provider.phoneNumber = body.phoneNumber ?? provider.phoneNumber;
    provider.address = body.address ?? provider.address;
    provider.city = body.city ?? provider.city;
    provider.state = body.state ?? provider.state;
    provider.zipCode = body.zipCode ?? provider.zipCode;
    provider.country = body.country ?? provider.country;
    provider.servicePricing = body.servicePricing ?? provider.servicePricing;
    return res.json(hydrateProvider(provider));
  }
);

app.delete(
  "/api/providers/:id",
  authenticate,
  requireRole("ADMIN"),
  (req, res) => {
    const id = Number(req.params.id);
    if (!providers.has(id)) {
      return res
        .status(404)
        .json({ error: `Provider not found with id: ${id}` });
    }
    for (const [avId, av] of availabilities.entries()) {
      if (av.providerId === id) availabilities.delete(avId);
    }
    for (const [aptId, apt] of appointments.entries()) {
      if (apt.providerId === id) appointments.delete(aptId);
    }
    providers.delete(id);
    return res.send("Provider deleted successfully.");
  }
);

// --- Availability Routes (/api/availabilities) ---
app.post(
  "/api/availabilities",
  authenticate,
  requireRole("PROVIDER"),
  (req, res) => {
    const provider = findProviderByUserId(req.auth.id);
    if (!provider) {
      return res
        .status(404)
        .json({ message: "Please set up your provider profile first." });
    }
    const { availableDate } = req.body || {};
    if (!availableDate) {
      return res.status(400).json({ message: "availableDate is required" });
    }
    const created = {
      id: nextAvailabilityId++,
      providerId: provider.id,
      availableDate,
      isBooked: false,
    };
    availabilities.set(created.id, created);
    return res.status(201).json(hydrateAvailability(created));
  }
);

app.get(
  "/api/availabilities",
  authenticate,
  requireRole("ADMIN"),
  (_req, res) => {
    return res.json(
      Array.from(availabilities.values()).map(hydrateAvailability)
    );
  }
);

app.get("/api/availabilities/provider/:providerId", (req, res) => {
  const providerId = Number(req.params.providerId);
  const list = Array.from(availabilities.values())
    .filter((a) => a.providerId === providerId && !a.isBooked)
    .map(hydrateAvailability);
  return res.json(list);
});

app.get(
  "/api/availabilities/my-availabilities",
  authenticate,
  requireRole("PROVIDER"),
  (req, res) => {
    const provider = findProviderByUserId(req.auth.id);
    if (!provider) {
      return res.status(404).json({ message: "Provider profile not found" });
    }
    const list = Array.from(availabilities.values())
      .filter((a) => a.providerId === provider.id)
      .map(hydrateAvailability);
    return res.json(list);
  }
);

app.get("/api/availabilities/:id", authenticate, (req, res) => {
  const id = Number(req.params.id);
  const av = availabilities.get(id);
  if (!av) {
    return res
      .status(404)
      .json({ message: `Availability not found with id: ${id}` });
  }
  return res.json(hydrateAvailability(av));
});

app.put(
  "/api/availabilities/:id",
  authenticate,
  requireRole("PROVIDER"),
  (req, res) => {
    const id = Number(req.params.id);
    const av = availabilities.get(id);
    if (!av) {
      return res
        .status(404)
        .json({ message: `Availability not found with id: ${id}` });
    }
    const provider = findProviderByUserId(req.auth.id);
    if (!provider || av.providerId !== provider.id) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (req.body?.availableDate) {
      av.availableDate = req.body.availableDate;
    }
    return res.json(hydrateAvailability(av));
  }
);

app.put("/api/availabilities/:id/book", authenticate, (req, res) => {
  const id = Number(req.params.id);
  const av = availabilities.get(id);
  if (!av) {
    return res
      .status(404)
      .json({ message: `Availability not found with id: ${id}` });
  }
  if (av.isBooked) {
    return res
      .status(409)
      .json({ message: "This time slot is already booked" });
  }
  av.isBooked = true;
  return res.json(hydrateAvailability(av));
});

app.delete(
  "/api/availabilities/:id",
  authenticate,
  requireRole("PROVIDER"),
  (req, res) => {
    const id = Number(req.params.id);
    const av = availabilities.get(id);
    if (!av) {
      return res.status(404).send("Availability not found");
    }
    const provider = findProviderByUserId(req.auth.id);
    if (!provider || av.providerId !== provider.id) {
      return res
        .status(403)
        .send("You can only delete your own availabilities.");
    }
    const associated = Array.from(appointments.values()).filter(
      (a) => a.availabilityId === id
    );
    if (associated.length > 0) {
      return res
        .status(400)
        .send(
          `Cannot delete availability because it has ${associated.length} associated appointment(s). Please cancel or delete the appointments first.`
        );
    }
    availabilities.delete(id);
    return res.send("Availability deleted successfully");
  }
);

// --- Appointment Routes (/api/appointments) ---
app.post("/api/appointments", authenticate, requireRole("USER"), (req, res) => {
  const body = req.body || {};
  const providerId = Number(body.provider?.id);
  const availabilityId = Number(body.availability?.id);

  if (!providerId) {
    return res.status(400).json({ message: "Provider is required" });
  }
  if (!availabilityId) {
    return res.status(400).json({ message: "Availability slot is required" });
  }
  const provider = providers.get(providerId);
  if (!provider) {
    return res.status(404).json({ message: "Provider not found" });
  }
  const availability = availabilities.get(availabilityId);
  if (!availability) {
    return res.status(404).json({ message: "Availability not found" });
  }
  if (availability.isBooked) {
    return res
      .status(409)
      .json({ message: "This time slot is already booked" });
  }

  availability.isBooked = true;
  const created = {
    id: nextAppointmentId++,
    userId: Number(body.user?.id || req.auth.id),
    providerId,
    availabilityId,
    appointmentDate: body.appointmentDate || availability.availableDate,
    status: "PENDING",
  };
  appointments.set(created.id, created);
  return res.status(201).json(hydrateAppointment(created));
});

app.get(
  "/api/appointments",
  authenticate,
  requireRole("ADMIN"),
  (_req, res) => {
    return res.json(Array.from(appointments.values()).map(hydrateAppointment));
  }
);

app.get(
  "/api/appointments/paginated",
  authenticate,
  requireRole("ADMIN"),
  (req, res) => {
    const list = Array.from(appointments.values()).map(hydrateAppointment);
    return res.json(paginate(list, req.query.page, req.query.size));
  }
);

app.get(
  "/api/appointments/my-appointments",
  authenticate,
  requireRole("PROVIDER"),
  (req, res) => {
    const provider = findProviderByUserId(req.auth.id);
    if (!provider) return res.json([]);
    const list = Array.from(appointments.values())
      .filter((a) => a.providerId === provider.id)
      .map(hydrateAppointment);
    return res.json(list);
  }
);

app.get(
  "/api/appointments/my-appointments/paginated",
  authenticate,
  requireRole("PROVIDER"),
  (req, res) => {
    const provider = findProviderByUserId(req.auth.id);
    if (!provider) {
      return res.json(paginate([], req.query.page, req.query.size));
    }
    const list = Array.from(appointments.values())
      .filter((a) => a.providerId === provider.id)
      .map(hydrateAppointment);
    return res.json(paginate(list, req.query.page, req.query.size));
  }
);

app.get("/api/appointments/user/:userId", authenticate, (req, res) => {
  const userId = Number(req.params.userId);
  const list = Array.from(appointments.values())
    .filter((a) => a.userId === userId)
    .map(hydrateAppointment);
  return res.json(list);
});

app.get(
  "/api/appointments/user/:userId/paginated",
  authenticate,
  (req, res) => {
    const userId = Number(req.params.userId);
    const list = Array.from(appointments.values())
      .filter((a) => a.userId === userId)
      .map(hydrateAppointment);
    return res.json(paginate(list, req.query.page, req.query.size));
  }
);

app.get(
  "/api/appointments/provider/:providerId",
  authenticate,
  requireRole("PROVIDER"),
  (req, res) => {
    const providerId = Number(req.params.providerId);
    const list = Array.from(appointments.values())
      .filter((a) => a.providerId === providerId)
      .map(hydrateAppointment);
    return res.json(list);
  }
);

app.get(
  "/api/appointments/provider/:providerId/paginated",
  authenticate,
  requireRole("PROVIDER"),
  (req, res) => {
    const providerId = Number(req.params.providerId);
    const list = Array.from(appointments.values())
      .filter((a) => a.providerId === providerId)
      .map(hydrateAppointment);
    return res.json(paginate(list, req.query.page, req.query.size));
  }
);

app.get("/api/appointments/:id", authenticate, (req, res) => {
  const id = Number(req.params.id);
  const apt = appointments.get(id);
  if (!apt) {
    return res
      .status(404)
      .json({ message: `Appointment not found with id: ${id}` });
  }
  return res.json(hydrateAppointment(apt));
});

app.put(
  "/api/appointments/:id/status",
  authenticate,
  requireRole("PROVIDER"),
  (req, res) => {
    const id = Number(req.params.id);
    const apt = appointments.get(id);
    if (!apt) {
      return res
        .status(404)
        .json({ message: `Appointment not found with id: ${id}` });
    }
    const rawStatus =
      typeof req.body === "string" ? req.body : req.body?.status;
    if (!rawStatus) {
      return res.status(400).json({ message: "Status is required" });
    }
    apt.status = String(rawStatus).replace(/"/g, "").trim().toUpperCase();
    return res.json(hydrateAppointment(apt));
  }
);

app.put("/api/appointments/:id/cancel", authenticate, (req, res) => {
  const id = Number(req.params.id);
  const apt = appointments.get(id);
  if (!apt) {
    return res
      .status(404)
      .json({ message: `Appointment not found with id: ${id}` });
  }
  if (apt.userId !== req.auth.id) {
    return res.status(403).json({ message: "Access denied" });
  }
  apt.status = "CANCELLED";
  return res.json(hydrateAppointment(apt));
});

app.put("/api/appointments/:id/confirm", authenticate, (req, res) => {
  const id = Number(req.params.id);
  const apt = appointments.get(id);
  if (!apt) {
    return res
      .status(404)
      .json({ message: `Appointment not found with id: ${id}` });
  }
  if (apt.userId !== req.auth.id) {
    return res.status(403).json({ message: "Access denied" });
  }
  apt.status = "CONFIRMED";
  return res.json(hydrateAppointment(apt));
});

app.delete(
  "/api/appointments/:id",
  authenticate,
  requireRole("ADMIN"),
  (req, res) => {
    const id = Number(req.params.id);
    if (!appointments.has(id)) {
      return res
        .status(404)
        .json({ message: `Appointment not found with id: ${id}` });
    }
    appointments.delete(id);
    return res.send("Appointment deleted successfully.");
  }
);

// ---------------------------------------------------------------------------
// Frontend Hosting (Vite Middleware in Dev / Built Static Files in Prod)
// ---------------------------------------------------------------------------
const frontendDir = path.resolve(__dirname, "frontend");
const distDir = path.resolve(frontendDir, "dist");

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(distDir));
    app.get("/{*splat}", (_req, res) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  } else {
    const vitePromise = import("vite").then(({ createServer: createViteServer }) =>
      createViteServer({
        root: frontendDir,
        configFile: path.join(frontendDir, "vite.config.js"),
        server: {
          middlewareMode: true,
          hmr: false,
          ws: false,
          host: "0.0.0.0",
          allowedHosts: true,
        },
        appType: "spa",
      })
    );

    app.use(async (req, res, next) => {
      try {
        const vite = await vitePromise;
        vite.middlewares(req, res, next);
      } catch (err) {
        next(err);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
