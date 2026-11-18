import http from "node:http";
import { Buffer } from "node:buffer";
import process from "node:process";

function createInitialStore() {
  const now = new Date();
  const addDays = (days, hour, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + days);
    d.setHours(hour, minute, 0, 0);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(hour)}:${pad(minute)}:00`;
  };

  const users = [
    { id: 1, username: "alex_user", email: "alex.morgan@example.com", password: "password123", role: "USER" },
    { id: 2, username: "dr_maya", email: "maya.patel@northsideclinic.com", password: "password123", role: "PROVIDER" },
    { id: 3, username: "claire_advisor", email: "claire.bennett@vertexadvisory.com", password: "password123", role: "PROVIDER" },
    { id: 4, username: "liam_physio", email: "liam.chen@motionwellness.com", password: "password123", role: "PROVIDER" },
    { id: 5, username: "elena_dental", email: "elena.rossi@brightsmile.com", password: "password123", role: "PROVIDER" },
    { id: 6, username: "marcus_wealth", email: "marcus.wright@harborwealth.com", password: "password123", role: "PROVIDER" },
    { id: 7, username: "priya_derm", email: "priya.nair@clearviewderm.com", password: "password123", role: "PROVIDER" },
    { id: 8, username: "sophia_user", email: "sophia.lee@example.com", password: "password123", role: "USER" },
    { id: 9, username: "admin", email: "admin@appointflow.com", password: "admin123", role: "ADMIN" },
  ];

  const providers = [
    {
      id: 1,
      userId: 2,
      serviceName: "Primary Care & Preventive Medicine",
      description:
        "Board-certified family medicine consultations, annual wellness exams, chronic condition management, and rapid telehealth follow-ups.",
      profileImage: "/assets/images/provider_health_specialist_1794912360862.jpg",
      phoneNumber: "+1 (415) 890-2314",
      address: "450 Sutter Street, Suite 1200",
      city: "San Francisco",
      state: "CA",
      zipCode: "94108",
      country: "United States",
      servicePricing: "145 / 45-min consultation",
    },
    {
      id: 2,
      userId: 3,
      serviceName: "Corporate & Legal Strategy Advisory",
      description:
        "Contract review, founder equity structuring, regulatory compliance, and intellectual property consultations for growing businesses.",
      profileImage: "/assets/images/provider_business_advisor_1794912361306.jpg",
      phoneNumber: "+1 (212) 641-9040",
      address: "280 Park Avenue, Floor 18",
      city: "New York",
      state: "NY",
      zipCode: "10017",
      country: "United States",
      servicePricing: "220 / 60-min session",
    },
    {
      id: 3,
      userId: 4,
      serviceName: "Sports Physical Therapy & Rehab",
      description:
        "Evidence-based orthopedic rehabilitation, posture assessment, mobility recovery plans, and injury prevention programs.",
      profileImage: "/assets/images/hero_scheduling_clinic_1794912360931.jpg",
      phoneNumber: "+1 (206) 442-8710",
      address: "1201 Third Avenue, Suite 410",
      city: "Seattle",
      state: "WA",
      zipCode: "98101",
      country: "United States",
      servicePricing: "125 / 50-min session",
    },
    {
      id: 4,
      userId: 5,
      serviceName: "Restorative & Cosmetic Dentistry",
      description:
        "Comprehensive dental checkups, digital imaging diagnostics, preventive hygiene care, and personalized alignment consultations.",
      profileImage: "",
      phoneNumber: "+1 (312) 550-7218",
      address: "205 N Michigan Ave, Suite 900",
      city: "Chicago",
      state: "IL",
      zipCode: "60601",
      country: "United States",
      servicePricing: "160 / initial visit",
    },
    {
      id: 5,
      userId: 6,
      serviceName: "Fiduciary Wealth & Tax Planning",
      description:
        "Portfolio risk audits, retirement cash-flow modeling, tax optimization, and multi-year financial goal planning.",
      profileImage: "",
      phoneNumber: "+1 (617) 730-5591",
      address: "100 Federal Street, Suite 2200",
      city: "Boston",
      state: "MA",
      zipCode: "02110",
      country: "United States",
      servicePricing: "195 / 60-min review",
    },
    {
      id: 6,
      userId: 7,
      serviceName: "Clinical Dermatology & Skin Health",
      description:
        "Targeted dermatological screenings, personalized treatment plans, allergy evaluations, and follow-up skin health reviews.",
      profileImage: "",
      phoneNumber: "+1 (512) 488-3044",
      address: "600 Congress Ave, Suite 750",
      city: "Austin",
      state: "TX",
      zipCode: "78701",
      country: "United States",
      servicePricing: "155 / 40-min exam",
    },
  ];

  const availabilities = [
    { id: 1, providerId: 1, availableDate: addDays(1, 9, 0), isBooked: true },
    { id: 2, providerId: 1, availableDate: addDays(1, 10, 30), isBooked: false },
    { id: 3, providerId: 1, availableDate: addDays(1, 14, 0), isBooked: false },
    { id: 4, providerId: 1, availableDate: addDays(2, 9, 30), isBooked: false },
    { id: 5, providerId: 1, availableDate: addDays(2, 15, 30), isBooked: false },
    { id: 6, providerId: 1, availableDate: addDays(3, 11, 0), isBooked: false },

    { id: 7, providerId: 2, availableDate: addDays(1, 11, 0), isBooked: true },
    { id: 8, providerId: 2, availableDate: addDays(1, 15, 0), isBooked: false },
    { id: 9, providerId: 2, availableDate: addDays(2, 10, 0), isBooked: false },
    { id: 10, providerId: 2, availableDate: addDays(3, 13, 30), isBooked: false },

    { id: 11, providerId: 3, availableDate: addDays(1, 8, 30), isBooked: false },
    { id: 12, providerId: 3, availableDate: addDays(2, 11, 0), isBooked: true },
    { id: 13, providerId: 3, availableDate: addDays(2, 16, 0), isBooked: false },
    { id: 14, providerId: 3, availableDate: addDays(4, 10, 0), isBooked: false },

    { id: 15, providerId: 4, availableDate: addDays(1, 13, 0), isBooked: false },
    { id: 16, providerId: 4, availableDate: addDays(3, 9, 30), isBooked: false },
    { id: 17, providerId: 5, availableDate: addDays(2, 14, 0), isBooked: false },
    { id: 18, providerId: 5, availableDate: addDays(4, 11, 30), isBooked: false },
    { id: 19, providerId: 6, availableDate: addDays(1, 16, 0), isBooked: false },
    { id: 20, providerId: 6, availableDate: addDays(3, 15, 0), isBooked: false },
  ];

  const appointments = [
    {
      id: 1,
      userId: 1,
      providerId: 1,
      availabilityId: 1,
      appointmentDate: addDays(1, 9, 0),
      status: "CONFIRMED",
    },
    {
      id: 2,
      userId: 1,
      providerId: 2,
      availabilityId: 7,
      appointmentDate: addDays(1, 11, 0),
      status: "PENDING",
    },
    {
      id: 3,
      userId: 1,
      providerId: 3,
      availabilityId: null,
      appointmentDate: addDays(-6, 14, 0),
      status: "COMPLETED",
    },
    {
      id: 4,
      userId: 8,
      providerId: 3,
      availabilityId: 12,
      appointmentDate: addDays(2, 11, 0),
      status: "CONFIRMED",
    },
    {
      id: 5,
      userId: 1,
      providerId: 4,
      availabilityId: null,
      appointmentDate: addDays(-12, 10, 0),
      status: "CANCELLED",
    },
    {
      id: 6,
      userId: 8,
      providerId: 1,
      availabilityId: null,
      appointmentDate: addDays(-8, 10, 0),
      status: "COMPLETED",
    },
    {
      id: 7,
      userId: 8,
      providerId: 2,
      availabilityId: null,
      appointmentDate: addDays(-4, 15, 0),
      status: "COMPLETED",
    },
  ];

  const reviews = [
    {
      id: 1,
      appointmentId: 6,
      providerId: 1,
      reviewer: "sophia_user",
      rating: 5,
      comment:
        "Thorough wellness consultation with clear follow-up notes and zero wait time.",
      createdAt: addDays(-7, 11, 30),
    },
    {
      id: 2,
      appointmentId: 7,
      providerId: 2,
      reviewer: "sophia_user",
      rating: 5,
      comment:
        "Practical, well-structured legal review that addressed every founder agreement question.",
      createdAt: addDays(-3, 16, 15),
    },
  ];

  return {
    users,
    providers,
    availabilities,
    appointments,
    reviews,
    nextUserId: 10,
    nextProviderId: 7,
    nextAvailabilityId: 21,
    nextAppointmentId: 8,
    nextReviewId: 3,
  };
}

function sanitizeUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  void password;
  return rest;
}

function hydrateProvider(store, p) {
  if (!p) return null;
  const user = store.users.find((u) => u.id === p.userId) || null;
  return {
    ...p,
    user: sanitizeUser(user),
  };
}

function hydrateAppointment(store, a) {
  if (!a) return null;
  const user = store.users.find((u) => u.id === a.userId) || null;
  const providerRaw = store.providers.find((p) => p.id === a.providerId) || null;
  const availability = store.availabilities.find((av) => av.id === a.availabilityId) || null;
  return {
    id: a.id,
    appointmentDate: a.appointmentDate,
    status: a.status,
    user: sanitizeUser(user),
    provider: hydrateProvider(store, providerRaw),
    availability,
  };
}

function paginate(items, pageParam, sizeParam) {
  const page = Math.max(0, Number.parseInt(pageParam ?? "0", 10) || 0);
  const size = Math.max(1, Number.parseInt(sizeParam ?? "10", 10) || 10);
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

function makeToken(user) {
  const payload = Buffer.from(
    JSON.stringify({ id: user.id, username: user.username, role: user.role })
  ).toString("base64");
  return `spring-compat.${payload}.sig`;
}

function parseToken(req, store) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const decoded = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    return store.users.find((u) => u.id === decoded.id || u.username === decoded.username) || null;
  } catch {
    return null;
  }
}

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function tryProxyToSpringBoot(req, res, rawBodyBuffer) {
  const target = process.env.BACKEND_URL || "http://127.0.0.1:8081";
  let url;
  try {
    url = new URL(req.url, target);
  } catch {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const proxyHeaders = { ...req.headers };
    // This is a server-side proxy; forwarding the browser Origin makes Spring
    // treat the proxied request as cross-origin and reject unconfigured hosts.
    delete proxyHeaders.origin;
    delete proxyHeaders["access-control-request-method"];
    delete proxyHeaders["access-control-request-headers"];

    const proxyReq = http.request(
      {
        hostname: url.hostname,
        port: url.port || 8081,
        path: url.pathname + url.search,
        method: req.method,
        headers: {
          ...proxyHeaders,
          host: url.host,
        },
        timeout: 5000,
      },
      (proxyRes) => {
        res.statusCode = proxyRes.statusCode || 200;
        for (const [k, v] of Object.entries(proxyRes.headers)) {
          if (v !== undefined) res.setHeader(k, v);
        }
        proxyRes.pipe(res);
        proxyRes.on("end", () => resolve(true));
      }
    );

    proxyReq.on("timeout", () => {
      proxyReq.destroy();
      resolve(false);
    });

    proxyReq.on("error", () => {
      resolve(false);
    });

    if (rawBodyBuffer && rawBodyBuffer.length > 0) {
      proxyReq.write(rawBodyBuffer);
    }
    proxyReq.end();
  });
}

function readRawBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

function parseJsonBuffer(buf) {
  if (!buf || buf.length === 0) return {};
  const str = buf.toString("utf8");
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

export default function mockApiPlugin() {
  const store = createInitialStore();

  const attachMiddleware = (middlewares) => {
    middlewares.use(async (req, res, next) => {
      if (!req.url || !req.url.startsWith("/api/")) {
        return next();
      }

      const rawBuffer = await readRawBody(req);
      const body = parseJsonBuffer(rawBuffer);
      const requestPath = new URL(req.url, "http://localhost:3000").pathname;
      const authorization = req.headers.authorization || "";
      const isMockSession = authorization.startsWith("Bearer spring-compat.");
      const isMockLogin = requestPath === "/api/auth/login" &&
        (req.method || "").toUpperCase() === "POST" &&
        store.users.some((user) => user.username === body.username && user.password === body.password);

      // Keep mock-issued sessions on the mock API; Spring cannot validate their tokens.
      // Other requests use the real backend when it responds.
      const proxied = isMockSession || isMockLogin
        ? false
        : await tryProxyToSpringBoot(req, res, rawBuffer);
      if (proxied) return;

      const urlObj = new URL(req.url, "http://localhost:3000");
      const pathname = urlObj.pathname;
      const params = urlObj.searchParams;
      const method = (req.method || "GET").toUpperCase();
      const currentUser = parseToken(req, store);

      // Auth
      if (pathname === "/api/auth/login" && method === "POST") {
        const user = store.users.find(
          (u) => u.username === body.username && u.password === body.password
        );
        if (!user) {
          return sendJson(res, 401, { error: "Invalid username or password" });
        }
        return sendJson(res, 200, {
          token: makeToken(user),
          username: user.username,
          role: user.role,
          id: user.id,
        });
      }

      if (pathname === "/api/auth/register" && method === "POST") {
        if (!body.username || !body.email || !body.password) {
          return sendJson(res, 400, { error: "Username, email, and password are required" });
        }
        if (store.users.some((u) => u.email.toLowerCase() === String(body.email).toLowerCase())) {
          return sendJson(res, 400, { error: "Email already in use" });
        }
        if (store.users.some((u) => u.username.toLowerCase() === String(body.username).toLowerCase())) {
          return sendJson(res, 400, { error: "Username already taken" });
        }
        if (body.role === "ADMIN") {
          return sendJson(res, 400, { error: "Admin role cannot be registered through public endpoint" });
        }
        const newUser = {
          id: store.nextUserId++,
          username: body.username.trim(),
          email: body.email.trim(),
          password: body.password,
          role: body.role === "PROVIDER" ? "PROVIDER" : "USER",
        };
        store.users.push(newUser);
        return sendJson(res, 200, { message: "User registered successfully" });
      }

      // Dashboard stats (public)
      if (pathname === "/api/dashboard/stats" && method === "GET") {
        const upcomingAppointments = store.appointments.filter(
          (a) => a.status === "PENDING" || a.status === "CONFIRMED"
        ).length;
        return sendJson(res, 200, {
          totalProviders: store.providers.length,
          totalAppointments: store.appointments.length,
          upcomingAppointments,
          totalUsers: store.users.length,
        });
      }

      // Providers
      if (pathname === "/api/providers" && method === "GET") {
        return sendJson(
          res,
          200,
          store.providers.map((p) => hydrateProvider(store, p))
        );
      }

      if (pathname === "/api/providers/paginated" && method === "GET") {
        const hydrated = store.providers.map((p) => hydrateProvider(store, p));
        return sendJson(res, 200, paginate(hydrated, params.get("page"), params.get("size")));
      }

      if (pathname.startsWith("/api/providers/search") && method === "GET") {
        const q = (
          params.get("q") ||
          params.get("serviceName") ||
          params.get("city") ||
          params.get("description") ||
          ""
        )
          .toLowerCase()
          .trim();

        const filtered = store.providers
          .map((p) => hydrateProvider(store, p))
          .filter((p) => {
            if (!q) return true;
            if (pathname.includes("/search/service")) {
              return (p.serviceName || "").toLowerCase().includes(q);
            }
            if (pathname.includes("/search/city")) {
              return (p.city || "").toLowerCase().includes(q);
            }
            if (pathname.includes("/search/description")) {
              return (p.description || "").toLowerCase().includes(q);
            }
            return (
              (p.serviceName || "").toLowerCase().includes(q) ||
              (p.city || "").toLowerCase().includes(q) ||
              (p.description || "").toLowerCase().includes(q) ||
              (p.user?.username || "").toLowerCase().includes(q)
            );
          });

        if (pathname.endsWith("/paginated")) {
          return sendJson(res, 200, paginate(filtered, params.get("page"), params.get("size")));
        }
        return sendJson(res, 200, filtered);
      }

      if (pathname === "/api/providers/me" && method === "GET") {
        if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });
        const found = store.providers.find((p) => p.userId === currentUser.id);
        if (!found) return sendJson(res, 404, { error: "Provider profile not found" });
        return sendJson(res, 200, hydrateProvider(store, found));
      }

      if (pathname === "/api/providers" && method === "POST") {
        if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });
        let targetUserId = currentUser.id;
        if (currentUser.role === "ADMIN" && body.userId) {
          targetUserId = Number(body.userId);
          const targetUser = store.users.find((u) => u.id === targetUserId);
          if (targetUser) targetUser.role = "PROVIDER";
        }
        const existing = store.providers.find((p) => p.userId === targetUserId);
        if (existing) {
          Object.assign(existing, {
            serviceName: body.serviceName ?? existing.serviceName,
            description: body.description ?? existing.description,
            profileImage: body.profileImage ?? existing.profileImage,
            phoneNumber: body.phoneNumber ?? existing.phoneNumber,
            address: body.address ?? existing.address,
            city: body.city ?? existing.city,
            state: body.state ?? existing.state,
            zipCode: body.zipCode ?? existing.zipCode,
            country: body.country ?? existing.country,
            servicePricing: body.servicePricing ?? existing.servicePricing,
          });
          return sendJson(res, 200, hydrateProvider(store, existing));
        }
        const created = {
          id: store.nextProviderId++,
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
        store.providers.push(created);
        return sendJson(res, 201, hydrateProvider(store, created));
      }

      const providerIdMatch = pathname.match(/^\/api\/providers\/(\d+)$/);
      if (providerIdMatch) {
        const pid = Number(providerIdMatch[1]);
        const idx = store.providers.findIndex((p) => p.id === pid);
        if (idx === -1) return sendJson(res, 404, { error: "Provider not found" });
        if (method === "GET") {
          return sendJson(res, 200, hydrateProvider(store, store.providers[idx]));
        }
        if (method === "PUT") {
          if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });
          const p = store.providers[idx];
          if (currentUser.role !== "ADMIN" && p.userId !== currentUser.id) {
            return sendJson(res, 403, { error: "Forbidden" });
          }
          Object.assign(p, {
            serviceName: body.serviceName ?? p.serviceName,
            description: body.description ?? p.description,
            profileImage: body.profileImage ?? p.profileImage,
            phoneNumber: body.phoneNumber ?? p.phoneNumber,
            address: body.address ?? p.address,
            city: body.city ?? p.city,
            state: body.state ?? p.state,
            zipCode: body.zipCode ?? p.zipCode,
            country: body.country ?? p.country,
            servicePricing: body.servicePricing ?? p.servicePricing,
          });
          return sendJson(res, 200, hydrateProvider(store, p));
        }
        if (method === "DELETE") {
          if (!currentUser || currentUser.role !== "ADMIN") {
            return sendJson(res, 403, { error: "Admin access required" });
          }
          store.providers.splice(idx, 1);
          store.availabilities = store.availabilities.filter((a) => a.providerId !== pid);
          store.appointments = store.appointments.filter((a) => a.providerId !== pid);
          return sendJson(res, 200, { message: "Provider deleted successfully." });
        }
      }

      // Users
      if (pathname === "/api/users/me" && method === "GET") {
        if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });
        return sendJson(res, 200, sanitizeUser(currentUser));
      }

      if (pathname === "/api/users/change-password" && method === "POST") {
        if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });
        if (body.currentPassword !== currentUser.password) {
          return sendJson(res, 400, { error: "Current password is incorrect" });
        }
        if (!body.newPassword || body.newPassword.length < 6) {
          return sendJson(res, 400, { error: "New password must be at least 6 characters" });
        }
        currentUser.password = body.newPassword;
        return sendJson(res, 200, { message: "Password changed successfully" });
      }

      if (pathname === "/api/users" && method === "GET") {
        if (!currentUser || currentUser.role !== "ADMIN") {
          return sendJson(res, 403, { error: "Admin access required" });
        }
        return sendJson(res, 200, store.users.map(sanitizeUser));
      }

      if (pathname === "/api/users/paginated" && method === "GET") {
        if (!currentUser || currentUser.role !== "ADMIN") {
          return sendJson(res, 403, { error: "Admin access required" });
        }
        return sendJson(res, 200, paginate(store.users.map(sanitizeUser), params.get("page"), params.get("size")));
      }

      const userIdMatch = pathname.match(/^\/api\/users\/(\d+)$/);
      if (userIdMatch) {
        const uid = Number(userIdMatch[1]);
        const idx = store.users.findIndex((u) => u.id === uid);
        if (idx === -1) return sendJson(res, 404, { error: "User not found" });
        if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });

        if (method === "GET") {
          if (currentUser.role !== "ADMIN" && currentUser.id !== uid) {
            return sendJson(res, 403, { error: "Forbidden" });
          }
          return sendJson(res, 200, sanitizeUser(store.users[idx]));
        }
        if (method === "PUT") {
          if (currentUser.role !== "ADMIN" && currentUser.id !== uid) {
            return sendJson(res, 403, { error: "Forbidden" });
          }
          if (
            body.username &&
            store.users.some((u) => u.id !== uid && u.username.toLowerCase() === body.username.toLowerCase())
          ) {
            return sendJson(res, 409, { error: "Username already exists" });
          }
          if (
            body.email &&
            store.users.some((u) => u.id !== uid && u.email.toLowerCase() === body.email.toLowerCase())
          ) {
            return sendJson(res, 409, { error: "Email already exists" });
          }
          if (body.username) store.users[idx].username = body.username;
          if (body.email) store.users[idx].email = body.email;
          return sendJson(res, 200, sanitizeUser(store.users[idx]));
        }
        if (method === "DELETE") {
          if (currentUser.role !== "ADMIN") {
            return sendJson(res, 403, { error: "Admin access required" });
          }
          if (currentUser.id === uid) {
            return sendJson(res, 400, { error: "Cannot delete your own active admin account." });
          }
          store.users.splice(idx, 1);
          const ownedProviderIds = store.providers
            .filter((p) => p.userId === uid)
            .map((p) => p.id);
          store.providers = store.providers.filter((p) => p.userId !== uid);
          store.availabilities = store.availabilities.filter(
            (av) => !ownedProviderIds.includes(av.providerId)
          );
          store.appointments = store.appointments.filter(
            (ap) => ap.userId !== uid && !ownedProviderIds.includes(ap.providerId)
          );
          return sendJson(res, 200, { message: "User deleted successfully." });
        }
      }

      // Availabilities
      const availProviderMatch = pathname.match(/^\/api\/availabilities\/provider\/(\d+)$/);
      if (availProviderMatch && method === "GET") {
        const pid = Number(availProviderMatch[1]);
        const slots = store.availabilities
          .filter((a) => a.providerId === pid && !a.isBooked)
          .sort((a, b) => new Date(a.availableDate) - new Date(b.availableDate));
        return sendJson(res, 200, slots);
      }

      if (pathname === "/api/availabilities/my-availabilities" && method === "GET") {
        if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });
        const prov = store.providers.find((p) => p.userId === currentUser.id);
        if (!prov) return sendJson(res, 200, []);
        const slots = store.availabilities
          .filter((a) => a.providerId === prov.id)
          .sort((a, b) => new Date(a.availableDate) - new Date(b.availableDate));
        return sendJson(res, 200, slots);
      }

      if (pathname === "/api/availabilities" && method === "POST") {
        if (!currentUser || currentUser.role !== "PROVIDER") {
          return sendJson(res, 403, { error: "Provider access required" });
        }
        const prov = store.providers.find((p) => p.userId === currentUser.id);
        if (!prov) return sendJson(res, 404, { error: "Complete provider profile first" });
        const created = {
          id: store.nextAvailabilityId++,
          providerId: prov.id,
          availableDate: body.availableDate,
          isBooked: false,
        };
        store.availabilities.push(created);
        return sendJson(res, 201, created);
      }

      const availIdMatch = pathname.match(/^\/api\/availabilities\/(\d+)$/);
      if (availIdMatch) {
        const aid = Number(availIdMatch[1]);
        const idx = store.availabilities.findIndex((a) => a.id === aid);
        if (idx === -1) return sendJson(res, 404, { error: "Availability not found" });
        if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });
        const prov = store.providers.find((p) => p.userId === currentUser.id);
        if (!prov || store.availabilities[idx].providerId !== prov.id) {
          return sendJson(res, 403, { error: "Forbidden" });
        }
        if (method === "PUT") {
          store.availabilities[idx].availableDate = body.availableDate || store.availabilities[idx].availableDate;
          return sendJson(res, 200, store.availabilities[idx]);
        }
        if (method === "DELETE") {
          const hasAppointment = store.appointments.some(
            (ap) => ap.availabilityId === aid && ap.status !== "CANCELLED"
          );
          if (hasAppointment) {
            return sendJson(res, 400, {
              message: "Cannot delete availability with an active associated appointment.",
            });
          }
          store.availabilities.splice(idx, 1);
          return sendJson(res, 200, { message: "Availability deleted successfully" });
        }
      }

      // Appointments
      const providerReviewsMatch = pathname.match(/^\/api\/reviews\/provider\/(\d+)$/);
      if (providerReviewsMatch && method === "GET") {
        const providerId = Number(providerReviewsMatch[1]);
        return sendJson(res, 200, store.reviews
          .filter((review) => review.providerId === providerId)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }

      const appointmentReviewMatch = pathname.match(/^\/api\/reviews\/appointment\/(\d+)$/);
      if (appointmentReviewMatch && (method === "GET" || method === "POST")) {
        if (!currentUser || currentUser.role !== "USER") {
          return sendJson(res, 403, { error: "Client access required" });
        }
        const appointmentId = Number(appointmentReviewMatch[1]);
        const appointment = store.appointments.find((item) => item.id === appointmentId);
        if (!appointment) return sendJson(res, 404, { error: "Appointment not found" });
        if (appointment.userId !== currentUser.id) return sendJson(res, 403, { error: "Forbidden" });
        const existingReview = store.reviews.find((review) => review.appointmentId === appointmentId);
        if (method === "GET") {
          return existingReview
            ? sendJson(res, 200, existingReview)
            : sendJson(res, 404, { error: "Review not found" });
        }
        if (appointment.status !== "COMPLETED") {
          return sendJson(res, 400, { message: "Only completed appointments can be reviewed" });
        }
        if (existingReview) return sendJson(res, 409, { message: "This appointment already has a review" });
        const rating = Number(body.rating);
        const comment = String(body.comment || "").trim();
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          return sendJson(res, 400, { message: "Rating must be between 1 and 5" });
        }
        if (comment.length > 1200) return sendJson(res, 400, { message: "Review comments must be 1,200 characters or fewer" });
        const review = {
          id: store.nextReviewId++,
          appointmentId,
          providerId: appointment.providerId,
          reviewer: currentUser.username,
          rating,
          comment,
          createdAt: new Date().toISOString(),
        };
        store.reviews.push(review);
        return sendJson(res, 201, review);
      }

      if (pathname === "/api/appointments" && method === "POST") {
        if (!currentUser || currentUser.role !== "USER") {
          return sendJson(res, 403, { error: "Client access required" });
        }
        const pid = Number(body.provider?.id);
        const aid = Number(body.availability?.id);
        const slot = store.availabilities.find((a) => a.id === aid);
        if (!slot) return sendJson(res, 400, { message: "Invalid availability slot" });
        if (slot.providerId !== pid) {
          return sendJson(res, 400, { message: "The selected slot does not belong to this provider" });
        }
        if (slot.isBooked) {
          return sendJson(res, 409, { message: "This time slot is already booked." });
        }
        slot.isBooked = true;
        const created = {
          id: store.nextAppointmentId++,
          userId: currentUser.id,
          providerId: pid,
          availabilityId: aid,
          appointmentDate: body.appointmentDate || slot.availableDate,
          status: "PENDING",
        };
        store.appointments.push(created);
        return sendJson(res, 201, hydrateAppointment(store, created));
      }

      if (pathname === "/api/appointments" && method === "GET") {
        if (!currentUser || currentUser.role !== "ADMIN") {
          return sendJson(res, 403, { error: "Admin access required" });
        }
        return sendJson(
          res,
          200,
          store.appointments.map((a) => hydrateAppointment(store, a))
        );
      }

      if (pathname === "/api/appointments/paginated" && method === "GET") {
        if (!currentUser || currentUser.role !== "ADMIN") {
          return sendJson(res, 403, { error: "Admin access required" });
        }
        const hydrated = store.appointments
          .map((a) => hydrateAppointment(store, a))
          .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
        return sendJson(res, 200, paginate(hydrated, params.get("page"), params.get("size")));
      }

      const apptUserMatch = pathname.match(/^\/api\/appointments\/user\/(\d+)(\/paginated)?$/);
      if (apptUserMatch && method === "GET") {
        if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });
        const uid = Number(apptUserMatch[1]);
        if (currentUser.role !== "ADMIN" && currentUser.id !== uid) {
          return sendJson(res, 403, { error: "Forbidden" });
        }
        const list = store.appointments
          .filter((a) => a.userId === uid)
          .map((a) => hydrateAppointment(store, a));
        if (apptUserMatch[2]) {
          return sendJson(res, 200, paginate(list, params.get("page"), params.get("size")));
        }
        return sendJson(res, 200, list);
      }

      const apptProviderMatch = pathname.match(/^\/api\/appointments\/provider\/(\d+)(\/paginated)?$/);
      if (apptProviderMatch && method === "GET") {
        if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });
        const pid = Number(apptProviderMatch[1]);
        const prov = store.providers.find((p) => p.id === pid);
        if (
          currentUser.role !== "ADMIN" &&
          (!prov || prov.userId !== currentUser.id)
        ) {
          return sendJson(res, 403, { error: "Forbidden" });
        }
        const list = store.appointments
          .filter((a) => a.providerId === pid)
          .map((a) => hydrateAppointment(store, a));
        if (apptProviderMatch[2]) {
          return sendJson(res, 200, paginate(list, params.get("page"), params.get("size")));
        }
        return sendJson(res, 200, list);
      }

      if (
        (pathname === "/api/appointments/my-appointments" ||
          pathname === "/api/appointments/my-appointments/paginated") &&
        method === "GET"
      ) {
        if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });
        const prov = store.providers.find((p) => p.userId === currentUser.id);
        if (!prov) return sendJson(res, 200, pathname.endsWith("/paginated") ? paginate([], 0, 10) : []);
        const list = store.appointments
          .filter((a) => a.providerId === prov.id)
          .map((a) => hydrateAppointment(store, a));
        if (pathname.endsWith("/paginated")) {
          return sendJson(res, 200, paginate(list, params.get("page"), params.get("size")));
        }
        return sendJson(res, 200, list);
      }

      const apptCancelMatch = pathname.match(/^\/api\/appointments\/(\d+)\/cancel$/);
      if (apptCancelMatch && method === "PUT") {
        if (!currentUser) return sendJson(res, 401, { error: "Unauthorized" });
        const id = Number(apptCancelMatch[1]);
        const appt = store.appointments.find((a) => a.id === id);
        if (!appt) return sendJson(res, 404, { error: "Appointment not found" });
        if (appt.userId !== currentUser.id && currentUser.role !== "ADMIN") {
          return sendJson(res, 403, { error: "Forbidden" });
        }
        appt.status = "CANCELLED";
        if (appt.availabilityId) {
          const slot = store.availabilities.find((av) => av.id === appt.availabilityId);
          if (slot) slot.isBooked = false;
        }
        return sendJson(res, 200, hydrateAppointment(store, appt));
      }

      const apptConfirmMatch = pathname.match(/^\/api\/appointments\/(\d+)\/confirm$/);
      if (apptConfirmMatch && method === "PUT") {
        if (!currentUser || currentUser.role !== "USER") {
          return sendJson(res, 403, { error: "Client access required" });
        }
        const id = Number(apptConfirmMatch[1]);
        const appt = store.appointments.find((a) => a.id === id);
        if (!appt) return sendJson(res, 404, { error: "Appointment not found" });
        if (appt.userId !== currentUser.id) return sendJson(res, 403, { error: "Forbidden" });
        appt.status = "CONFIRMED";
        return sendJson(res, 200, hydrateAppointment(store, appt));
      }

      const apptStatusMatch = pathname.match(/^\/api\/appointments\/(\d+)\/status$/);
      if (apptStatusMatch && method === "PUT") {
        if (!currentUser || currentUser.role !== "PROVIDER") {
          return sendJson(res, 403, { error: "Provider access required" });
        }
        const id = Number(apptStatusMatch[1]);
        const appt = store.appointments.find((a) => a.id === id);
        if (!appt) return sendJson(res, 404, { error: "Appointment not found" });
        const provider = store.providers.find((p) => p.userId === currentUser.id);
        if (!provider || appt.providerId !== provider.id) {
          return sendJson(res, 403, { error: "Forbidden" });
        }
        let nextStatus = typeof body === "string" ? body : body?.status;
        nextStatus = String(nextStatus || "").replace(/^"|"$/g, "").trim().toUpperCase();
        if (!["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(nextStatus)) {
          return sendJson(res, 400, { message: "Invalid status" });
        }
        appt.status = nextStatus;
        if (nextStatus === "CANCELLED" && appt.availabilityId) {
          const slot = store.availabilities.find((av) => av.id === appt.availabilityId);
          if (slot) slot.isBooked = false;
        }
        return sendJson(res, 200, hydrateAppointment(store, appt));
      }

      const apptDeleteMatch = pathname.match(/^\/api\/appointments\/(\d+)$/);
      if (apptDeleteMatch && method === "DELETE") {
        if (!currentUser || currentUser.role !== "ADMIN") {
          return sendJson(res, 403, { error: "Admin access required" });
        }
        const id = Number(apptDeleteMatch[1]);
        const idx = store.appointments.findIndex((a) => a.id === id);
        if (idx === -1) return sendJson(res, 404, { error: "Appointment not found" });
        const [removed] = store.appointments.splice(idx, 1);
        if (removed.availabilityId) {
          const slot = store.availabilities.find((av) => av.id === removed.availabilityId);
          if (slot) slot.isBooked = false;
        }
        return sendJson(res, 200, { message: "Appointment deleted successfully." });
      }

      return sendJson(res, 404, { error: `Endpoint not found: ${method} ${pathname}` });
    });
  };

  return {
    name: "spring-compat-api",
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}
