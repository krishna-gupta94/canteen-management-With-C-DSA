import { FormEvent, ReactNode, useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "./hooks/useAuth";
import { useFoods, DEFAULT_FOOD_IMAGES } from "./hooks/useFoods";
import { useCart } from "./hooks/useCart";
import { useOrders, UIOrder, Status, statusStringToNum, formatOrderForUI } from "./hooks/useOrders";
import { authApi } from "./api/auth.api";
import { adminApi } from "./api/admin.api";
import { analyticsApi } from "./api/analytics.api";
import { Food } from "./types/food.types";
import { User } from "./types/auth.types";
import { DashboardSummary, PopularFood, DailySales } from "./types/admin.types";

const images = {
  hero: "/hero-3d.jpg",
  login: "/cards-3d.jpg",
  dosa: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=900&q=85",
  curry:
    "https://images.unsplash.com/photo-1631515242808-497c3fbd3972?auto=format&fit=crop&w=900&q=85",
  thali:
    "https://images.unsplash.com/photo-1680993032090-1ef7ea9b51e5?auto=format&fit=crop&w=900&q=85",
  wrap: "https://images.unsplash.com/photo-1708146464361-5c5ce4f9abb6?auto=format&fit=crop&w=900&q=85",
  toast:
    "https://images.unsplash.com/photo-1613292443284-8d10ef9383fe?auto=format&fit=crop&w=900&q=85",
  bowl: "https://images.unsplash.com/photo-1727404746799-253aa9a8ace6?auto=format&fit=crop&w=900&q=85",
};

const iconPaths: Record<string, ReactNode> = {
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  menu: (
    <>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </>
  ),
  cart: (
    <>
      <path d="M3 4h2l2.3 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.6L21 7H6" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  arrow: (
    <>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </>
  ),
  minus: <path d="M5 12h14" />,
  plus: (
    <>
      <path d="M12 5v14M5 12h14" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M9 7V4h6v3M7 7l1 14h8l1-14M10 11v6M14 11v6" />
    </>
  ),
  box: (
    <>
      <path d="m4 7 8-4 8 4-8 4-8-4Z" />
      <path d="m4 7 8 4 8-4v10l-8 4-8-4V7Z" />
      <path d="M12 11v10" />
    </>
  ),
  orders: (
    <>
      <path d="M6 3h12v18H6z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </>
  ),
  food: (
    <>
      <path d="M7 3v8M4 3v5a3 3 0 0 0 6 0V3M7 11v10M16 3c3 2 4 5 4 9h-4v9V3Z" />
    </>
  ),
  logout: (
    <>
      <path d="M10 17l5-5-5-5M15 12H3" />
      <path d="M14 3h7v18h-7" />
    </>
  ),
  edit: (
    <>
      <path d="m4 20 4-1 11-11-3-3L5 16l-1 4Z" />
      <path d="m14 7 3 3" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  eye: (
    <>
      <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  print: (
    <>
      <path d="M7 9V3h10v6M7 17H4V9h16v8h-3M7 14h10v7H7z" />
    </>
  ),
  chevron: <path d="m9 18 6-6-6-6" />,
  refresh: (
    <>
      <path d="M20 6v5h-5M4 18v-5h5" />
      <path d="M18 9a7 7 0 0 0-12-3L4 11M6 15a7 7 0 0 0 12 3l2-5" />
    </>
  ),
};

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

function money(n: number) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

function orderTotal(o: UIOrder) {
  return o.total_amount || o.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function useRoute() {
  const [path, setPath] = useState(location.pathname === "/" ? "/login" : location.pathname);
  useEffect(() => {
    const fn = () => setPath(location.pathname);
    addEventListener("popstate", fn);
    return () => removeEventListener("popstate", fn);
  }, []);
  const go = (next: string) => {
    history.pushState({}, "", next);
    setPath(next);
    scrollTo({ top: 0, behavior: "smooth" });
  };
  return { path, go };
}

function InteractionEffects({ route }: { route: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const available = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(available > 0 ? Math.min(100, (window.scrollY / available) * 100) : 0);
    };
    const selector = [
      ".page-heading",
      ".food-card",
      ".cart-item",
      ".order-row",
      ".metric",
      ".panel",
      ".alert-stat",
      ".auth-card",
      ".queue-card",
    ].join(", ");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    const scan = () => {
      document.querySelectorAll(selector).forEach((el, index) => {
        (el as HTMLElement).style.setProperty("--reveal-index", String(index % 8));
        observer.observe(el);
      });
      updateProgress();
    };

    scan();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    const onPointerMove = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest?.(
        ".food-card, .metric, .panel, .order-row, .auth-card",
      ) as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      target.style.setProperty("--mouse-x", `${x.toFixed(1)}%`);
      target.style.setProperty("--mouse-y", `${y.toFixed(1)}%`);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [route]);

  return (
    <>
      <div className="reading-progress" aria-hidden="true">
        <span style={{ transform: `scaleX(${progress / 100})` }} />
      </div>
      <div className="ambient-blur ambient-1" aria-hidden="true" />
      <div className="ambient-blur ambient-2" aria-hidden="true" />
    </>
  );
}

function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <div className={`brand-logo ${inverse ? "inverse" : ""}`}>
      <span className="logo-glyph">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth="2" />
          <path d="M12 6v6l4 2" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </span>
      <span>
        Campus<strong>Feast</strong>
      </span>
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  className = "",
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  icon?: string;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${variant} ${className}`}
    >
      {icon && <Icon name={icon} size={18} />}
      {children}
    </button>
  );
}

function Badge({ children, status }: { children?: ReactNode; status: string }) {
  const norm = status.toLowerCase().replace(/\s+/g, "-");
  return <span className={`badge badge-${norm}`}>{children || status}</span>;
}

function Avatar({
  name = "User",
  size = "md",
}: {
  name?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return <span className={`avatar avatar-${size}`}>{initials}</span>;
}

function PageHeader({
  eyebrow,
  title,
  copy,
  action,
  image,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: ReactNode;
  image?: string;
}) {
  return (
    <header className="page-heading">
      <div className="heading-text">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {copy && <p>{copy}</p>}
      </div>
      {action && <div className="heading-action">{action}</div>}
      {image && (
        <div className="header-thumbnail">
          <img src={image} alt="" />
        </div>
      )}
    </header>
  );
}

function EmptyState({ title, copy, action }: { title: string; copy: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon name="box" size={32} />
      </div>
      <h3>{title}</h3>
      <p>{copy}</p>
      {action}
    </div>
  );
}

function AuthPage({ register, go }: { register?: boolean; go: (s: string) => void }) {
  const { login } = useAuth();
  const [show, setShow] = useState(false);
  const [role, setRole] = useState<"student" | "admin">("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    const name = String(form.get("name") || "").trim();
    const confirm = String(form.get("confirm") || "");

    if (!email || !password) return setError("Please complete all required fields.");
    if (register && password !== confirm) return setError("Passwords do not match. Please try again.");
    if (register && !name) return setError("Please enter your full name.");

    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (register) {
        const res = await authApi.registerStudent({
          name,
          email,
          password,
          phone: "9876543210",
        });
        if (res.success) {
          try {
            const loginRes = await authApi.loginStudent(email, password);
            if (loginRes.token) {
              await login(loginRes.token, { name, email, role: "student" });
              go("/student");
              return;
            }
          } catch {
            setSuccessMsg("Account created successfully! Please sign in.");
            setTimeout(() => go("/login"), 1200);
          }
        }
      } else {
        if (role === "admin") {
          const res = await authApi.loginAdmin(email, password);
          if (res.token) {
            await login(res.token, { name: "Administrator", email, role: "ROLE_ADMIN" });
            go("/admin");
          } else {
            setError(res.message || "Invalid credentials.");
          }
        } else {
          const res = await authApi.loginStudent(email, password);
          if (res.token) {
            const studentName = res.student?.name || "Student";
            await login(res.token, { name: studentName, email: res.student?.email || email, role: "student" });
            go("/student");
          } else {
            setError(res.message || "Invalid credentials.");
          }
        }
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-shell">
      <InteractionEffects route={register ? "/register" : "/login"} />
      <section
        className="auth-visual"
        style={{
          backgroundImage: `linear-gradient(180deg,rgba(9,9,11,.08),rgba(9,9,11,.78)),url(${images.login})`,
        }}
      >
        <Logo inverse />
        <div className="auth-quote">
          <span className="eyebrow light">Made fresh, every break</span>
          <h2>
            Good food makes
            <br />
            campus feel like home.
          </h2>
          <p>Thoughtful meals, prepared daily by your campus kitchen.</p>
        </div>
      </section>
      <section className="auth-form-wrap">
        <div className="auth-mobile-logo">
          <Logo />
        </div>
        <form className="auth-card" onSubmit={submit}>
          <span className="eyebrow">{register ? "Join CampusFeast" : "Welcome back"}</span>
          <h1>{register ? "Create your account" : "Sign in to continue"}</h1>
          <p>
            {register
              ? "Use your college email to start ordering."
              : "Your next campus meal is only a few clicks away."}
          </p>
          {!register && (
            <div className="role-tabs">
              <button
                type="button"
                className={role === "student" ? "active" : ""}
                onClick={() => setRole("student")}
              >
                Student
              </button>
              <button
                type="button"
                className={role === "admin" ? "active" : ""}
                onClick={() => setRole("admin")}
              >
                Administrator
              </button>
            </div>
          )}
          {register && (
            <label>
              Full name
              <input name="name" placeholder="Your full name" required />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              placeholder={role === "admin" ? "admin.demo@canteen.local" : "you@college.edu"}
              required
            />
          </label>
          <label>
            Password
            <div className="input-icon">
              <input
                name="password"
                type={show ? "text" : "password"}
                placeholder="Password"
                required
              />
              <button type="button" onClick={() => setShow(!show)} aria-label="Show password">
                <Icon name="eye" size={18} />
              </button>
            </div>
          </label>
          {register && (
            <label>
              Confirm password
              <input name="confirm" type="password" placeholder="Re-enter password" required />
            </label>
          )}
          {error && <div className="form-error">{error}</div>}
          {successMsg && <div className="form-success" style={{ color: "#16A34A", fontSize: "0.88rem", marginBottom: "0.5rem" }}>{successMsg}</div>}
          <Button type="submit" className="full" disabled={loading}>
            {loading ? <span className="loader" /> : register ? "Create Account" : "Sign In"}
            {!loading && <Icon name="arrow" size={18} />}
          </Button>
          <p className="auth-switch">
            {register ? "Already have an account?" : "New to CampusFeast?"}{" "}
            <button type="button" onClick={() => go(register ? "/login" : "/register")}>
              {register ? "Sign in" : "Create account"}
            </button>
          </p>
          <small>By continuing, you agree to the campus dining terms and privacy policy.</small>
        </form>
      </section>
    </main>
  );
}

function StudentLayout({
  path,
  go,
  count,
  userName = "Student",
  children,
}: {
  path: string;
  go: (s: string) => void;
  count: number;
  userName?: string;
  children: ReactNode;
}) {
  const nav = [
    { label: "Home", icon: "home", path: "/student" },
    { label: "Menu", icon: "menu", path: "/student/menu" },
    { label: "Cart", icon: "cart", path: "/student/cart" },
    { label: "Orders", icon: "orders", path: "/student/orders" },
    { label: "Profile", icon: "user", path: "/student/profile" },
  ];
  const active = (p: string) => (p === "/student" ? path === p : path.startsWith(p));
  return (
    <div className="student-shell">
      <InteractionEffects route={path} />
      <header className="student-nav">
        <div className="nav-inner">
          <button onClick={() => go("/student")}>
            <Logo />
          </button>
          <nav>
            {nav.map((n) => (
              <button
                key={n.path}
                onClick={() => go(n.path)}
                className={active(n.path) ? "active" : ""}
              >
                {n.label}
                {n.icon === "cart" && count > 0 && <b>{count}</b>}
              </button>
            ))}
          </nav>
          <button className="profile-chip" onClick={() => go("/student/profile")}>
            <Avatar name={userName} size="sm" />
            <span>
              {userName}
              <br />
              <small>Student</small>
            </span>
          </button>
        </div>
      </header>
      <div className="student-content">{children}</div>
      {count > 0 && path !== "/student/cart" && (
        <div
          className="floating-cart-pill"
          onClick={() => go("/student/cart")}
          role="button"
          tabIndex={0}
          aria-label="View Cart Tray"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              go("/student/cart");
            }
          }}
        >
          <div className="floating-cart-icon">
            <Icon name="cart" size={20} />
            <span className="floating-cart-count">{count}</span>
          </div>
          <div className="floating-cart-info">
            <span>Tray Active</span>
            <strong>{count} {count === 1 ? "dish" : "dishes"}</strong>
          </div>
          <div className="floating-cart-cta">
            <span>Checkout</span>
            <Icon name="arrow" size={14} />
          </div>
        </div>
      )}
      <nav className="bottom-nav">
        {nav
          .filter((n) => n.label !== "Orders")
          .map((n) => (
            <button
              key={n.path}
              onClick={() => go(n.path)}
              className={active(n.path) ? "active" : ""}
            >
              <span>
                <Icon name={n.icon} />
                {n.icon === "cart" && count > 0 && <b>{count}</b>}
              </span>
              {n.label}
            </button>
          ))}
      </nav>
    </div>
  );
}

function FoodCard({
  food,
  quantity,
  add,
}: {
  food: Food & { id: number };
  quantity: number;
  add: (id: number) => void;
}) {
  const stockState =
    food.stock === 0 ? "Out of Stock" : food.stock <= 4 ? "Low Stock" : "Available";
  return (
    <article className="food-card">
      <div className="food-image">
        <img src={food.image || DEFAULT_FOOD_IMAGES.Default} alt={food.name} />
        <Badge status={stockState} />
        {quantity > 0 && <span className="added">Added · {quantity}</span>}
      </div>
      <div className="food-body">
        <span className="food-category">{food.category}</span>
        <h3>{food.name}</h3>
        <p>{food.description || "Freshly made in the campus kitchen."}</p>
        <div className="food-footer">
          <strong>{money(food.price)}</strong>
          <button
            aria-label={`Add ${food.name}`}
            disabled={!food.stock || quantity >= food.stock}
            onClick={() => add(food.id)}
          >
            <Icon name="plus" size={19} />
            <span>{quantity ? "Add another" : "Add to cart"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function StudentHome({
  foods,
  cart,
  add,
  go,
  studentName = "Student",
}: {
  foods: (Food & { id: number })[];
  cart: Record<number, number>;
  add: (id: number) => void;
  go: (s: string) => void;
  studentName?: string;
}) {
  return (
    <>
      <section className="welcome-row">
        <div>
          <p>Good afternoon, {studentName}</p>
          <h1>What are you craving today?</h1>
        </div>
        <Badge status="Available">Canteen open until 4:30 PM</Badge>
      </section>
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(9, 10, 16, 0.94) 0%, rgba(9, 10, 16, 0.72) 48%, rgba(9, 10, 16, 0.2) 100%), url(${images.hero})`,
        }}
      >
        <div>
          <span className="eyebrow light">✦ Artisanal Campus Dining</span>
          <h2>
            Fresh Taste.
            <br />
            Crafted for You.
          </h2>
          <p>Gourmet meals made fresh daily. Order instantly and skip the counter queue.</p>
          <Button onClick={() => go("/student/menu")} icon="arrow">
            Explore 3D Menu
          </Button>
        </div>
      </section>
      <section className="quick-grid">
        <button onClick={() => go("/student/cart")}>
          <span>
            <Icon name="cart" />
          </span>
          <div>
            <small>Quick access</small>
            <h3>My Cart</h3>
            <p>{Object.values(cart).reduce((a, b) => a + b, 0)} items waiting</p>
          </div>
          <Icon name="chevron" />
        </button>
        <button onClick={() => go("/student/orders")}>
          <span>
            <Icon name="orders" />
          </span>
          <div>
            <small>Your orders</small>
            <h3>Order History</h3>
            <p>Track and reorder</p>
          </div>
          <Icon name="chevron" />
        </button>
      </section>
      <SectionTitle
        title="Popular right now"
        copy="Campus favourites, made fresh today"
        action={
          <button onClick={() => go("/student/menu")}>
            View full menu <Icon name="arrow" size={16} />
          </button>
        }
      />
      <div className="food-grid">
        {foods.slice(0, 4).map((f) => (
          <FoodCard key={f.id} food={f} quantity={cart[f.id] || 0} add={add} />
        ))}
      </div>
      {foods.length >= 2 && (
        <section className="recent-strip">
          <div>
            <span className="eyebrow light">One-tap reorder</span>
            <h2>Your usual, without the wait.</h2>
            <p>{foods[0]?.name} with {foods[1]?.name}</p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              if (foods[0]) add(foods[0].id);
              if (foods[1]) add(foods[1].id);
            }}
          >
            Add previous order
          </Button>
        </section>
      )}
    </>
  );
}

function SectionTitle({
  title,
  copy,
  action,
}: {
  title: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {action}
    </div>
  );
}

function MenuPage({
  foods,
  cart,
  add,
}: {
  foods: (Food & { id: number })[];
  cart: Record<number, number>;
  add: (id: number) => void;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("Popular");

  const categories = useMemo(() => {
    const set = new Set<string>();
    foods.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return ["All", ...Array.from(set)];
  }, [foods]);

  const shown = useMemo(
    () =>
      foods
        .filter(
          (f) =>
            (category === "All" || f.category.toLowerCase() === category.toLowerCase()) &&
            f.name.toLowerCase().includes(search.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "Price: Low to high"
            ? a.price - b.price
            : sort === "Price: High to low"
              ? b.price - a.price
              : a.id - b.id,
        ),
    [foods, category, search, sort],
  );

  return (
    <>
      <PageHeader
        title="Today's menu"
        copy="Freshly prepared breakfast, meals and snacks for your breaks."
        image={images.dosa}
      />
      <div className="filter-bar">
        <div className="search">
          <Icon name="search" />
          <input
            placeholder="Search food by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="chips">
          {categories.map((c) => (
            <button
              className={category === c ? "active" : ""}
              key={c}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option>Popular</option>
          <option>Price: Low to high</option>
          <option>Price: High to low</option>
        </select>
      </div>
      <div className="food-grid">
        {shown.map((f) => (
          <FoodCard key={f.id} food={f} quantity={cart[f.id] || 0} add={add} />
        ))}
      </div>
      {!shown.length && (
        <EmptyState
          title="No food matches your filter"
          copy="Try searching for another dish or clear the category filter."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Reset Filters
            </Button>
          }
        />
      )}
    </>
  );
}

function CartPage({
  foods,
  cart,
  change,
  clear,
  place,
  go,
  totalAmount,
  loading = false,
}: {
  foods: (Food & { id: number })[];
  cart: Record<number, number>;
  change: (id: number, n: number) => void;
  clear: () => void;
  place: () => void;
  go: (s: string) => void;
  totalAmount?: number;
  loading?: boolean;
}) {
  const items = foods.filter((f) => cart[f.id]);
  const calculatedTotal = items.reduce((s, f) => s + f.price * cart[f.id], 0);
  const total = totalAmount !== undefined && totalAmount > 0 ? totalAmount : calculatedTotal;

  if (!items.length)
    return (
      <>
        <PageHeader title="Your cart" />
        <EmptyState
          title="Your cart is ready for something delicious"
          copy="Browse today’s fresh menu and add a campus favourite."
          action={<Button onClick={() => go("/student/menu")}>Explore Menu</Button>}
        />
      </>
    );

  return (
    <>
      <PageHeader
        title="Your cart"
        copy={`${items.reduce((s, f) => s + cart[f.id], 0)} items selected`}
        action={
          <button className="text-danger" onClick={clear}>
            Clear cart
          </button>
        }
        image={images.wrap}
      />
      <div className="cart-layout">
        <div className="cart-list">
          {items.map((f) => (
            <article className="cart-item" key={f.id}>
              <img src={f.image || DEFAULT_FOOD_IMAGES.Default} alt="" />
              <div className="cart-item-main">
                <span>{f.category}</span>
                <h3>{f.name}</h3>
                <p>{money(f.price)} each</p>
              </div>
              <div className="quantity">
                <button onClick={() => change(f.id, -1)}>
                  <Icon name="minus" size={16} />
                </button>
                <strong>{cart[f.id]}</strong>
                <button onClick={() => change(f.id, 1)} disabled={cart[f.id] >= f.stock}>
                  <Icon name="plus" size={16} />
                </button>
              </div>
              <strong className="item-total">{money(f.price * cart[f.id])}</strong>
              <button className="remove" onClick={() => change(f.id, -cart[f.id])}>
                <Icon name="trash" size={18} />
              </button>
            </article>
          ))}
        </div>
        <aside className="order-summary">
          <span className="eyebrow">Order summary</span>
          <h2>Almost there.</h2>
          <div>
            <span>Item subtotal</span>
            <strong>{money(total)}</strong>
          </div>
          <div>
            <span>Taxes</span>
            <strong>Included</strong>
          </div>
          <div className="summary-total">
            <span>Total</span>
            <strong>{money(total)}</strong>
          </div>
          <Button className="full" onClick={place} disabled={loading}>
            {loading ? <span className="loader" /> : <>Place Order <Icon name="arrow" /></>}
          </Button>
          <Button className="full" variant="ghost" onClick={() => go("/student/menu")}>
            Continue Shopping
          </Button>
          <small>Pay at the canteen counter when you collect.</small>
        </aside>
      </div>
    </>
  );
}

function OrdersPage({
  orders,
  foods,
  go,
}: {
  orders: UIOrder[];
  foods: (Food & { id: number })[];
  go: (s: string) => void;
}) {
  return (
    <>
      <PageHeader
        title="Your orders"
        copy="Track current orders and revisit past favourites."
        image={images.curry}
      />
      <div className="orders-list">
        {orders.map((o) => (
          <article className="order-row" key={o.id}>
            <div className="order-id">
              <span>ORDER</span>
              <strong>#{o.id}</strong>
              <small>{o.date}</small>
            </div>
            <div className="order-foods">
              <div className="mini-images">
                {o.items.slice(0, 3).map((i, n) => {
                  const f = foods.find((food) => food.id === i.foodId);
                  return (
                    <img
                      key={n}
                      src={f?.image || DEFAULT_FOOD_IMAGES.Default}
                      alt={f?.name || "Item"}
                    />
                  );
                })}
              </div>
              <div>
                <strong>
                  {o.items
                    .map((i) => i.name || foods.find((f) => f.id === i.foodId)?.name || "Food Item")
                    .join(", ")}
                </strong>
                <small>{o.items.reduce((s, i) => s + i.quantity, 0)} items</small>
              </div>
            </div>
            <div className="order-amount">
              <small>Total</small>
              <strong>{money(orderTotal(o))}</strong>
            </div>
            <Badge status={o.status} />
            <div className="order-actions">
              <Button variant="secondary" onClick={() => go(`/student/orders/${o.id}`)}>
                {o.status === "Completed" ? "View details" : "Track order"}
              </Button>
              <button onClick={() => go(`/student/orders/${o.id}/receipt`)}>Receipt</button>
            </div>
          </article>
        ))}
      </div>
      {!orders.length && (
        <EmptyState
          title="No orders yet"
          copy="You haven't placed any orders yet. Check out the menu!"
          action={<Button onClick={() => go("/student/menu")}>Explore Menu</Button>}
        />
      )}
    </>
  );
}

function OrderDetail({
  order,
  foods,
  go,
}: {
  order: UIOrder;
  foods: (Food & { id: number })[];
  go: (s: string) => void;
}) {
  const stages: Status[] = ["Pending", "Preparing", "Ready", "Completed"];
  const current = Math.max(0, stages.indexOf(order.status));
  return (
    <>
      <button className="back-link" onClick={() => go("/student/orders")}>
        ← Back to orders
      </button>
      <PageHeader
        eyebrow="Live order"
        title={`Order #${order.id}`}
        copy={`Placed ${order.date}`}
        action={<Badge status={order.status} />}
      />
      {order.status === "Cancelled" && (
        <div className="cancel-alert">
          <strong>This order was cancelled.</strong>
          <span>No payment was collected. Contact the canteen if you need help.</span>
        </div>
      )}
      <div className="detail-grid">
        <section className="tracker-card">
          <span className="eyebrow">Order progress</span>
          <h2>
            {order.status === "Ready"
              ? "Your order is ready for pickup"
              : order.status === "Completed"
                ? "Order collected"
                : "The kitchen is on it."}
          </h2>
          <p>
            {order.status === "Preparing"
              ? "Your food is being freshly prepared. We’ll let you know when it’s ready."
              : "Follow the progress of your order below."}
          </p>
          <div className="stepper">
            {stages.map((s, i) => (
              <div
                className={`${i <= current && order.status !== "Cancelled" ? "done" : ""} ${i === current ? "current" : ""}`}
                key={s}
              >
                <span>{i < current ? <span>✓</span> : i + 1}</span>
                <div>
                  <strong>{s}</strong>
                  <small>
                    {
                      ["Order received", "In the kitchen", "Collect at counter", "Enjoy your meal"][
                        i
                      ]
                    }
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="detail-items">
          <span className="eyebrow">Order details</span>
          {order.items.map((i) => {
            const f = foods.find((x) => x.id === i.foodId);
            return (
              <div className="detail-line" key={i.foodId}>
                <img src={f?.image || DEFAULT_FOOD_IMAGES.Default} alt="" />
                <div>
                  <strong>{i.name || f?.name || "Item"}</strong>
                  <small>
                    Qty {i.quantity} × {money(i.price)}
                  </small>
                </div>
                <strong>{money(i.price * i.quantity)}</strong>
              </div>
            );
          })}
          <div className="detail-total">
            <span>Total</span>
            <strong>{money(orderTotal(order))}</strong>
          </div>
          <Button
            variant="secondary"
            className="full"
            onClick={() => go(`/student/orders/${order.id}/receipt`)}
          >
            <Icon name="print" /> View Receipt
          </Button>
        </aside>
      </div>
    </>
  );
}

function Receipt({
  order,
  foods,
  go,
  user,
}: {
  order: UIOrder;
  foods: (Food & { id: number })[];
  go: (s: string) => void;
  user?: User | null;
}) {
  return (
    <div className="receipt-page">
      <div className="receipt-actions">
        <Button variant="ghost" onClick={() => go(`/student/orders/${order.id}`)}>
          ← Back
        </Button>
        <Button onClick={() => window.print()}>
          <Icon name="print" /> Print receipt
        </Button>
      </div>
      <article className="receipt">
        <Logo />
        <p>
          Campus Central Canteen
          <br />
          Main Academic Block
        </p>
        <div className="receipt-dash" />
        <h1>ORDER #{order.id}</h1>
        <div className="receipt-meta">
          <span>Date & time</span>
          <strong>{order.date}</strong>
          <span>Student</span>
          <strong>{user?.name || order.student}</strong>
          <span>Email</span>
          <strong>{user?.email || "student@college.edu"}</strong>
        </div>
        <div className="receipt-dash" />
        <div className="receipt-head">
          <span>ITEM</span>
          <span>QTY</span>
          <span>AMOUNT</span>
        </div>
        {order.items.map((i) => (
          <div className="receipt-line" key={i.foodId}>
            <span>
              {i.name || foods.find((f) => f.id === i.foodId)?.name || "Item"}
              <small>{money(i.price)} each</small>
            </span>
            <span>{i.quantity}</span>
            <strong>{money(i.price * i.quantity)}</strong>
          </div>
        ))}
        <div className="receipt-dash" />
        <div className="receipt-total">
          <span>Subtotal</span>
          <strong>{money(orderTotal(order))}</strong>
          <span>Tax</span>
          <strong>Included</strong>
          <span className="grand">TOTAL</span>
          <strong className="grand">{money(orderTotal(order))}</strong>
        </div>
        <div className="paid">PAYMENT · PAY AT COUNTER</div>
        <footer>
          Thank you for dining with us.
          <br />
          <strong>Fresh food. Better breaks.</strong>
        </footer>
      </article>
    </div>
  );
}

function ProfilePage({
  admin = false,
  go,
  user,
  logout,
}: {
  admin?: boolean;
  go: (s: string) => void;
  user?: User | null;
  logout?: () => void;
}) {
  const name = user?.name || (admin ? "Administrator" : "Student");
  const email = user?.email || (admin ? "admin@college.edu" : "student@college.edu");
  return (
    <>
      <PageHeader
        title="Profile"
        copy="Manage your personal and account information."
        image={admin ? images.login : images.dosa}
      />
      <div className="profile-layout">
        <section className="profile-card">
          <Avatar name={name} size="lg" />
          <h2>{name}</h2>
          <p>{admin ? "Canteen Administrator" : "Student Account"}</p>
          <Badge status="Available">Verified account</Badge>
        </section>
        <section className="account-card">
          <span className="eyebrow">Account information</span>
          <div>
            <label>Full name</label>
            <strong>{name}</strong>
          </div>
          <div>
            <label>Email address</label>
            <strong>{email}</strong>
          </div>
          <div>
            <label>{admin ? "Role" : "Student ID"}</label>
            <strong>{admin ? "Administrator" : `CS2026-${user?.id || 101}`}</strong>
          </div>
          <div>
            <label>Campus</label>
            <strong>Central Campus</strong>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              if (logout) logout();
              go("/login");
            }}
          >
            <Icon name="logout" /> Log out
          </Button>
        </section>
      </div>
    </>
  );
}

const adminNav = [
  ["Dashboard", "home", "/admin"],
  ["Inventory", "box", "/admin/inventory"],
  ["Foods", "food", "/admin/foods"],
  ["Orders", "orders", "/admin/orders"],
  ["Order Queue", "menu", "/admin/orders/queue"],
  ["Analytics", "chart", "/admin/analytics"],
  ["Sales", "chart", "/admin/sales"],
];

function AdminLayout({
  path,
  go,
  children,
  userName = "Administrator",
  logout,
}: {
  path: string;
  go: (s: string) => void;
  children: ReactNode;
  userName?: string;
  logout?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const exact = (p: string) => (p === "/admin" ? path === p : path === p);
  const title = adminNav.find((n) => exact(n[2]))?.[0] || "Profile";
  return (
    <div className="admin-shell">
      <InteractionEffects route={path} />
      <aside className={`admin-sidebar ${open ? "open" : ""}`}>
        <button onClick={() => go("/admin")}>
          <Logo inverse />
        </button>
        <div className="side-label">Workspace</div>
        <nav>
          {adminNav.map((n) => (
            <button
              key={n[2]}
              className={exact(n[2]) ? "active" : ""}
              onClick={() => {
                go(n[2]);
                setOpen(false);
              }}
            >
              <Icon name={n[1]} />
              {n[0]}
            </button>
          ))}
        </nav>
        <div className="side-bottom">
          <button onClick={() => go("/admin/profile")}>
            <Avatar name={userName} size="sm" />
            <span>
              {userName}
              <small>Administrator</small>
            </span>
            <Icon name="chevron" size={16} />
          </button>
          <button
            onClick={() => {
              if (logout) logout();
              go("/login");
            }}
          >
            <Icon name="logout" />
            Log out
          </button>
        </div>
      </aside>
      {open && <button className="scrim" onClick={() => setOpen(false)} />}
      <main className="admin-main">
        <header className="admin-header">
          <button className="hamburger" onClick={() => setOpen(true)}>
            <Icon name="menu" />
          </button>
          <div>
            <small>CampusFeast</small>
            <strong>{title}</strong>
          </div>
          <div className="header-right">
            <span className="live-dot">Kitchen online</span>
            <button onClick={() => go("/admin/profile")}>
              <Avatar name={userName} size="sm" />
            </button>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  meta,
  icon,
}: {
  label: string;
  value: string;
  meta: string;
  icon: string;
}) {
  return (
    <article className="metric">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{meta}</small>
      </div>
      <i>
        <Icon name={icon} />
      </i>
    </article>
  );
}

function AdminDashboard({
  foods,
  orders,
  go,
}: {
  foods: (Food & { id: number })[];
  orders: UIOrder[];
  go: (s: string) => void;
}) {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    adminApi.getDashboard().then((res) => {
      if (res?.data) setSummary(res.data);
    }).catch(() => {});
  }, []);

  const pending = summary ? summary.pending_orders : orders.filter((o) => o.status === "Pending").length;
  const completed = summary ? summary.completed_orders_today : orders.filter((o) => o.status === "Completed").length;
  const revenue = summary ? summary.today_revenue : orders.filter((o) => o.status === "Completed").reduce((s, o) => s + o.total_amount, 0);

  return (
    <>
      <PageHeader
        eyebrow="Canteen Portal"
        title="Good afternoon, Administrator"
        copy="Here’s what’s happening in your canteen right now."
        image={images.hero}
        action={
          <Button onClick={() => go("/admin/orders/queue")}>
            Open order queue <Icon name="arrow" />
          </Button>
        }
      />
      <div className="metric-grid">
        <MetricCard
          label="Today's revenue"
          value={money(revenue)}
          meta="Live finalized revenue"
          icon="chart"
        />
        <MetricCard
          label="Pending orders"
          value={String(pending)}
          meta="Awaiting preparation"
          icon="orders"
        />
        <MetricCard
          label="Completed today"
          value={String(completed)}
          meta="Fulfilled orders"
          icon="box"
        />
        <MetricCard
          label="Total food items"
          value={String(foods.length)}
          meta={`${foods.filter((f) => f.stock > 0).length} currently available`}
          icon="food"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <SectionTitle
            title="Revenue overview"
            copy="Daily sales trends"
            action={
              <select>
                <option>Active week</option>
              </select>
            }
          />
          <div className="chart-bars">
            {[48, 66, 52, 78, 62, 92, 72].map((h, i) => (
              <div key={i}>
                <span style={{ height: `${h}%` }} />
                <small>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}</small>
              </div>
            ))}
          </div>
        </section>
        <section className="panel">
          <SectionTitle title="Stock alerts" copy="Items needing attention" />
          <div className="alert-stat">
            <span className="stock-icon">
              <Icon name="box" />
            </span>
            <div>
              <strong>{foods.filter((f) => f.stock > 0 && f.stock <= 5).length} Low stock</strong>
              <small>Restock before rush</small>
            </div>
            <button onClick={() => go("/admin/inventory")}>
              <Icon name="chevron" />
            </button>
          </div>
          <div className="alert-stat danger">
            <span className="stock-icon">
              <Icon name="box" />
            </span>
            <div>
              <strong>{foods.filter((f) => f.stock === 0).length} Out of stock</strong>
              <small>Currently unavailable to students</small>
            </div>
            <button onClick={() => go("/admin/inventory")}>
              <Icon name="chevron" />
            </button>
          </div>
        </section>
      </div>
      <section className="panel table-panel">
        <SectionTitle
          title="Recent orders"
          copy="Live orders from the student portal"
          action={
            <button onClick={() => go("/admin/orders")}>
              View all <Icon name="arrow" size={16} />
            </button>
          }
        />
        <OrdersTable orders={orders.slice(0, 5)} actions={false} />
      </section>
    </>
  );
}

function OrdersTable({
  orders,
  actions,
  onStatus,
}: {
  orders: UIOrder[];
  actions?: boolean;
  onStatus?: (id: string, s: Status) => void;
}) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Student</th>
            <th>Date & time</th>
            <th>Total</th>
            <th>Status</th>
            {actions && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <strong>#{o.id}</strong>
                <small>{o.items.reduce((s, i) => s + i.quantity, 0)} items</small>
              </td>
              <td>{o.student}</td>
              <td>{o.date}</td>
              <td>
                <strong>{money(orderTotal(o))}</strong>
              </td>
              <td>
                <Badge status={o.status} />
              </td>
              {actions && (
                <td>
                  <StatusAction order={o} onStatus={onStatus!} />
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusAction({
  order,
  onStatus,
}: {
  order: UIOrder;
  onStatus: (id: string, s: Status) => void;
}) {
  if (order.status === "Pending")
    return (
      <div className="row-actions">
        <button className="action-primary" onClick={() => onStatus(order.id, "Preparing")}>
          Prepare
        </button>
        <button className="action-danger" onClick={() => onStatus(order.id, "Cancelled")}>
          Cancel
        </button>
      </div>
    );
  if (order.status === "Preparing")
    return (
      <button className="action-primary" onClick={() => onStatus(order.id, "Ready")}>
        Mark ready
      </button>
    );
  if (order.status === "Ready")
    return (
      <button className="action-primary" onClick={() => onStatus(order.id, "Completed")}>
        Complete
      </button>
    );
  return <span className="final-label">Final</span>;
}

function InventoryPage({ foods }: { foods: (Food & { id: number })[] }) {
  const low = foods.filter((f) => f.stock > 0 && f.stock <= 5);
  const out = foods.filter((f) => f.stock === 0);

  return (
    <>
      <PageHeader
        title="Inventory"
        copy="Manage real-time inventory counts and stock warnings."
        action={
          <div className="stock-badges" style={{ display: "flex", gap: "0.5rem" }}>
            <Badge status="Low Stock">{low.length} Low Stock</Badge>
            <Badge status="Out of Stock">{out.length} Out of Stock</Badge>
          </div>
        }
      />
      <div className="metric-grid">
        <MetricCard label="Catalog size" value={String(foods.length)} meta="Total items" icon="food" />
        <MetricCard label="In stock" value={String(foods.filter((f) => f.stock > 5).length)} meta="Healthy stock" icon="box" />
        <MetricCard label="Low stock" value={String(low.length)} meta="≤ 5 units remaining" icon="box" />
        <MetricCard label="Out of stock" value={String(out.length)} meta="Unavailable in menu" icon="close" />
      </div>
      <StockTable title="Low stock items" copy="Replenish before lunch rush" foods={low} />
      <StockTable title="Out of stock items" copy="Currently unavailable for ordering" foods={out} />
    </>
  );
}

function StockTable({
  title,
  copy,
  foods,
}: {
  title: string;
  copy: string;
  foods: (Food & { id: number })[];
}) {
  return (
    <section className="panel table-panel">
      <SectionTitle title={title} copy={copy} />
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Unit price</th>
            </tr>
          </thead>
          <tbody>
            {foods.map((f) => (
              <tr key={f.id}>
                <td>
                  <div className="food-cell">
                    <img src={f.image || DEFAULT_FOOD_IMAGES.Default} alt="" />
                    <strong>{f.name}</strong>
                  </div>
                </td>
                <td>{f.category}</td>
                <td>
                  <strong>{f.stock}</strong>
                </td>
                <td>
                  <Badge status={f.stock === 0 ? "Out of Stock" : "Low Stock"} />
                </td>
                <td>{money(f.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!foods.length && (
          <p style={{ padding: "1.5rem", textAlign: "center", color: "#71717A" }}>
            No items in this category.
          </p>
        )}
      </div>
    </section>
  );
}

function FoodsPage({
  foods,
  reloadFoods,
}: {
  foods: (Food & { id: number })[];
  reloadFoods: () => Promise<void> | void;
}) {
  const [search, setSearch] = useState(""),
    [cat, setCat] = useState("All"),
    [editing, setEditing] = useState<(Food & { id: number }) | null | undefined>(),
    [deleting, setDeleting] = useState<(Food & { id: number }) | null>(null);

  const shown = foods.filter(
    (f) =>
      (cat === "All" || f.category.toLowerCase() === cat.toLowerCase()) &&
      f.name.toLowerCase().includes(search.toLowerCase()),
  );

  const save = async (foodData: Partial<Food>) => {
    try {
      if (editing && editing.id) {
        await adminApi.updateFood(editing.id, {
          name: foodData.name,
          category: foodData.category,
          description: foodData.description,
          price: foodData.price,
          stock: foodData.stock,
          availability: (foodData.stock || 0) > 0,
        });
      } else {
        await adminApi.addFood({
          name: foodData.name || "New Item",
          category: foodData.category || "Snacks",
          description: foodData.description || "",
          price: foodData.price || 50,
          stock: foodData.stock || 10,
          availability: true,
        });
      }
      await reloadFoods();
      setEditing(undefined);
    } catch (err: any) {
      alert(err?.message || "Failed to save food");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await adminApi.deleteFood(deleting.id);
      await reloadFoods();
      setDeleting(null);
    } catch (err: any) {
      alert(err?.message || "Failed to delete food");
    }
  };

  return (
    <>
      <PageHeader
        title="Food management"
        copy="Update your catalog, pricing and availability."
        action={
          <Button onClick={() => setEditing(null)}>
            <Icon name="plus" /> Add Food
          </Button>
        }
      />
      <div className="filter-bar">
        <div className="search">
          <Icon name="search" />
          <input
            placeholder="Search foods"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={cat} onChange={(e) => setCat(e.target.value)}>
          <option>All</option>
          <option>Snacks</option>
          <option>Beverages</option>
          <option>Meals</option>
          <option>Fast Food</option>
          <option>Chinese</option>
          <option>South Indian</option>
          <option>Desserts</option>
        </select>
      </div>
      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Food</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Availability</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((f) => (
                <tr key={f.id}>
                  <td>
                    <div className="food-cell">
                      <img src={f.image || DEFAULT_FOOD_IMAGES.Default} alt="" />
                      <div>
                        <strong>{f.name}</strong>
                        <small>{(f.description || "").slice(0, 38)}…</small>
                      </div>
                    </div>
                  </td>
                  <td>{f.category}</td>
                  <td>
                    <strong>{money(f.price)}</strong>
                  </td>
                  <td>{f.stock}</td>
                  <td>
                    <Badge status={f.stock ? "Available" : "Out of Stock"} />
                  </td>
                  <td>
                    <div className="icon-actions">
                      <button onClick={() => setEditing(f)} aria-label="Edit">
                        <Icon name="edit" size={17} />
                      </button>
                      <button onClick={() => setDeleting(f)} aria-label="Delete">
                        <Icon name="trash" size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {editing !== undefined && (
        <FoodModal
          food={editing}
          nextId={foods.length ? Math.max(...foods.map((f) => f.id)) + 1 : 1}
          onClose={() => setEditing(undefined)}
          onSave={save}
        />
      )}
      {deleting && (
        <Modal onClose={() => setDeleting(null)}>
          <div className="confirm-icon">
            <Icon name="trash" />
          </div>
          <h2>Delete {deleting.name}?</h2>
          <p>
            This removes the item from the student menu. Existing order history will remain
            unchanged.
          </p>
          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Keep item
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete Food
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}

function Modal({
  children,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  return (
    <div className="modal-wrap" role="dialog" aria-modal="true">
      <button className="modal-bg" onClick={onClose} />
      <div className={`modal ${wide ? "wide" : ""}`}>
        <button className="modal-close" onClick={onClose}>
          <Icon name="close" />
        </button>
        {children}
      </div>
    </div>
  );
}

function FoodModal({
  food,
  nextId,
  onClose,
  onSave,
}: {
  food: (Food & { id: number }) | null;
  nextId: number;
  onClose: () => void;
  onSave: (f: Partial<Food>) => void;
}) {
  const [data, setData] = useState({
    id: food ? food.id : nextId,
    name: food ? food.name : "",
    category: food ? food.category : "Snacks",
    description: food ? food.description : "",
    price: food ? food.price : 50,
    stock: food ? food.stock : 10,
    image: food ? food.image : DEFAULT_FOOD_IMAGES.Default,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSave(data);
  };

  return (
    <Modal onClose={onClose} wide>
      <span className="eyebrow">Catalog editor</span>
      <h2>{food ? "Edit food item" : "Add a new food"}</h2>
      <p>Changes will be reflected in the student menu immediately.</p>
      <form className="food-form" onSubmit={submit}>
        <label>
          Food name
          <input
            required
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            placeholder="e.g. Veg Club Sandwich"
          />
        </label>
        <label>
          Category
          <select
            value={data.category}
            onChange={(e) => setData({ ...data, category: e.target.value })}
          >
            <option>Snacks</option>
            <option>Beverages</option>
            <option>Meals</option>
            <option>Fast Food</option>
            <option>Chinese</option>
            <option>South Indian</option>
            <option>Desserts</option>
          </select>
        </label>
        <label className="full-field">
          Description
          <textarea
            required
            value={data.description}
            onChange={(e) => setData({ ...data, description: e.target.value })}
            placeholder="A short, useful menu description"
          />
        </label>
        <label>
          Price (₹)
          <input
            required
            min="1"
            type="number"
            value={data.price || ""}
            onChange={(e) => setData({ ...data, price: Number(e.target.value) })}
          />
        </label>
        <label>
          Stock quantity
          <input
            required
            min="0"
            type="number"
            value={data.stock}
            onChange={(e) => setData({ ...data, stock: Number(e.target.value) })}
          />
        </label>
        <div className="availability full-field">
          <span>
            Student menu availability
            <small>Items with zero stock are disabled automatically.</small>
          </span>
          <Badge status={data.stock ? "Available" : "Out of Stock"} />
        </div>
        <div className="modal-actions full-field">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}

function AdminOrders({
  orders,
  onStatus,
}: {
  orders: UIOrder[];
  onStatus: (id: string, s: Status) => void;
}) {
  const [filter, setFilter] = useState("All"),
    [search, setSearch] = useState("");
  const shown = orders.filter(
    (o) =>
      (filter === "All" || o.status === filter) &&
      (o.id.toLowerCase().includes(search.toLowerCase()) ||
        o.student.toLowerCase().includes(search.toLowerCase())),
  );
  return (
    <>
      <PageHeader title="Master orders" copy="Search, monitor and progress every canteen order." />
      <div className="filter-bar">
        <div className="search">
          <Icon name="search" />
          <input
            placeholder="Search order or student"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="chips compact">
          {["All", "Pending", "Preparing", "Ready", "Completed", "Cancelled"].map((s) => (
            <button className={filter === s ? "active" : ""} key={s} onClick={() => setFilter(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <section className="panel table-panel">
        {shown.length ? (
          <OrdersTable orders={shown} actions onStatus={onStatus} />
        ) : (
          <EmptyState title="No matching orders" copy="Adjust the status filter or search query." />
        )}
      </section>
    </>
  );
}

function QueuePage({
  orders,
  foods,
  onStatus,
  onProcessNext,
  onRefresh,
}: {
  orders: UIOrder[];
  foods: (Food & { id: number })[];
  onStatus: (id: string, s: Status) => void;
  onProcessNext: () => void;
  onRefresh: () => void;
}) {
  const queue = orders.filter((o) => o.status === "Pending" || o.status === "Preparing");
  const next = queue[0];
  return (
    <>
      <PageHeader
        eyebrow="Live kitchen view"
        title="FIFO order queue"
        copy={`${queue.length} orders in the active preparation queue.`}
        action={
          <div className="header-actions" style={{ display: "flex", gap: "0.5rem" }}>
            <Button variant="secondary" onClick={onRefresh}>
              <Icon name="refresh" /> Refresh
            </Button>
            <Button disabled={!next} onClick={onProcessNext}>
              Process Next Order
            </Button>
          </div>
        }
      />
      {next && (
        <section className="next-up">
          <span>Next up</span>
          <strong>#{next.id}</strong>
          <p>
            {next.student} · {next.items.reduce((s, i) => s + i.quantity, 0)} items
          </p>
          <Badge status={next.status} />
        </section>
      )}
      <div className="queue-grid">
        {queue.map((o, i) => (
          <article className={`queue-card ${i === 0 ? "highlight" : ""}`} key={o.id}>
            <header>
              <div>
                <span>#{o.id}</span>
                <small>{o.date}</small>
              </div>
              <Badge status={o.status} />
            </header>
            <h3>{o.student}</h3>
            <div className="queue-items">
              {o.items.map((item, n) => {
                const foodName =
                  item.name || foods.find((f) => f.id === item.foodId)?.name || "Item";
                return (
                  <div key={n}>
                    <span>{item.quantity}×</span>
                    <strong>{foodName}</strong>
                  </div>
                );
              })}
            </div>
            <footer>
              <strong>{money(orderTotal(o))}</strong>
              <StatusAction order={o} onStatus={onStatus} />
            </footer>
          </article>
        ))}
      </div>
      {!queue.length && (
        <EmptyState
          title="The queue is clear"
          copy="New student orders will appear here automatically."
        />
      )}
    </>
  );
}

function AnalyticsPage({ foods }: { foods: (Food & { id: number })[] }) {
  const [popular, setPopular] = useState<PopularFood[]>([]);

  useEffect(() => {
    analyticsApi.getPopularFoods().then((res) => {
      if (res?.data) setPopular(res.data);
    }).catch(() => {});
  }, []);

  const totalSold = popular.reduce((sum, p) => sum + p.quantity_sold, 0) || 486;

  return (
    <>
      <PageHeader
        title="Analytics"
        copy="Understand what students love and how the menu performs."
      />
      <div className="metric-grid">
        <MetricCard label="Items sold" value={String(totalSold)} meta="Campus favorite meals" icon="food" />
        <MetricCard label="Top category" value="Meals" meta="High campus retention" icon="chart" />
        <MetricCard label="Catalog items" value={String(foods.length)} meta="Fresh daily recipes" icon="orders" />
        <MetricCard label="Repeat rate" value="84%" meta="Healthy satisfaction" icon="refresh" />
      </div>
      <div className="analytics-grid">
        <section className="panel leaderboard">
          <SectionTitle title="Best-selling foods" copy="Ranked by quantity sold" />
          {popular.slice(0, 5).map((f, i) => {
            const matchedFood = foods.find((food) => food.id === f.food_id);
            return (
              <div key={f.food_id}>
                <span className="rank">0{i + 1}</span>
                <img src={matchedFood?.image || DEFAULT_FOOD_IMAGES.Default} alt="" />
                <div>
                  <strong>{f.name}</strong>
                  <small>{matchedFood?.category || "Popular Item"}</small>
                </div>
                <b>{f.quantity_sold} sold</b>
              </div>
            );
          })}
          {!popular.length && (
            <p style={{ padding: "1.5rem", color: "#71717A" }}>No sales records yet.</p>
          )}
        </section>
        <section className="panel donut-panel">
          <SectionTitle title="Order distribution" copy="By food category" />
          <div className="donut">
            <div>
              <strong>{totalSold}</strong>
              <small>items sold</small>
            </div>
          </div>
          <div className="legend">
            <span>
              <i />
              Meals <b>58%</b>
            </span>
            <span>
              <i />
              Fast Food <b>23%</b>
            </span>
            <span>
              <i />
              Beverages <b>12%</b>
            </span>
            <span>
              <i />
              Snacks <b>7%</b>
            </span>
          </div>
        </section>
      </div>
    </>
  );
}

function SalesPage() {
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [sales, setSales] = useState<DailySales | null>(null);

  useEffect(() => {
    analyticsApi.getDailySales(date).then((res) => {
      if (res?.data) setSales(res.data);
    }).catch(() => {});
  }, [date]);

  const revenue = sales ? sales.revenue : 0;
  const completed = sales ? sales.completed_orders : 0;
  const cancelled = sales ? sales.cancelled_orders : 0;
  const total = sales ? sales.total_orders : 0;

  return (
    <>
      <PageHeader
        title="Sales"
        copy="Review finalized revenue and daily canteen performance."
        action={
          <label className="date-input">
            Date{" "}
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        }
      />
      <div className="metric-grid">
        <MetricCard
          label="Finalized revenue"
          value={money(revenue)}
          meta="Completed orders only"
          icon="chart"
        />
        <MetricCard label="Total orders" value={String(total)} meta="Across all statuses" icon="orders" />
        <MetricCard label="Completed" value={String(completed)} meta="Fulfilled orders" icon="box" />
        <MetricCard label="Cancelled" value={String(cancelled)} meta="Cancelled orders" icon="close" />
      </div>
      <section className="panel sales-summary">
        <SectionTitle title="Daily sales summary" copy={date} />
        <div className="sales-highlight">
          <div>
            <span>Gross sales</span>
            <strong>{money(revenue + cancelled * 50)}</strong>
          </div>
          <span>−</span>
          <div>
            <span>Cancelled value</span>
            <strong>{money(cancelled * 50)}</strong>
          </div>
          <span>=</span>
          <div className="final">
            <span>Finalized revenue</span>
            <strong>{money(revenue)}</strong>
          </div>
        </div>
      </section>
    </>
  );
}

export default function App() {
  const { path, go } = useRoute();
  const { user, loading: authLoading, logout } = useAuth();
  const { foods, reloadFoods } = useFoods();
  const {
    cartMap,
    itemCount,
    totalAmount,
    addItem,
    updateQuantity,
    clearCart,
    refreshCart,
  } = useCart(user?.role === "student");
  const {
    orders,
    fetchOrders,
    placeOrder,
  } = useOrders(user?.role === "student");

  const [adminOrders, setAdminOrders] = useState<UIOrder[]>([]);

  const reloadAdminOrders = useCallback(async () => {
    if (user?.role === "ROLE_ADMIN") {
      try {
        const res = await adminApi.getOrders();
        if (res?.data) {
          setAdminOrders(res.data.map((o) => formatOrderForUI(o)));
        }
      } catch {}
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "ROLE_ADMIN") {
      reloadAdminOrders();
    }
  }, [user, reloadAdminOrders]);

  // Route protection
  useEffect(() => {
    if (authLoading) return;
    const isAuthPath = path === "/login" || path === "/register";
    if (!user && !isAuthPath) {
      go("/login");
    } else if (user && isAuthPath) {
      go(user.role === "ROLE_ADMIN" ? "/admin" : "/student");
    } else if (user && user.role === "student" && path.startsWith("/admin")) {
      go("/student");
    } else if (user && user.role === "ROLE_ADMIN" && path.startsWith("/student")) {
      go("/admin");
    }
  }, [user, authLoading, path, go]);

  const [placing, setPlacing] = useState(false);
  const handlePlaceOrder = async () => {
    setPlacing(true);
    try {
      const res = await placeOrder();
      await clearCart();
      await reloadFoods();
      const orderId = res.order_id || (res.data as any)?.order_id;
      if (orderId) {
        go(`/student/orders/CF-${orderId}`);
      } else {
        go("/student/orders");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  const handleAdminStatusChange = async (orderId: string, status: Status) => {
    const cleanId = orderId.replace(/^CF-/, "");
    const statusNum = statusStringToNum(status);
    try {
      await adminApi.updateOrderStatus(cleanId, statusNum);
      await reloadAdminOrders();
      await reloadFoods();
    } catch (err: any) {
      alert(err?.message || "Failed to update order status");
    }
  };

  const handleProcessNextOrder = async () => {
    try {
      await adminApi.processNextOrder();
      await reloadAdminOrders();
      await reloadFoods();
    } catch (err: any) {
      alert(err?.message || "Failed to process next order");
    }
  };

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#090A10",
        }}
      >
        <span
          className="loader"
          style={{
            width: 40,
            height: 40,
            border: "3px solid rgba(255, 255, 255, 0.15)",
            borderTopColor: "#F59E0B",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  if (path === "/login") return <AuthPage go={go} />;
  if (path === "/register") return <AuthPage register go={go} />;

  if (path.startsWith("/admin")) {
    let view: ReactNode;
    if (path === "/admin")
      view = <AdminDashboard foods={foods} orders={adminOrders} go={go} />;
    else if (path === "/admin/inventory")
      view = <InventoryPage foods={foods} />;
    else if (path === "/admin/foods")
      view = <FoodsPage foods={foods} reloadFoods={reloadFoods} />;
    else if (path === "/admin/orders/queue")
      view = (
        <QueuePage
          orders={adminOrders}
          foods={foods}
          onStatus={handleAdminStatusChange}
          onProcessNext={handleProcessNextOrder}
          onRefresh={reloadAdminOrders}
        />
      );
    else if (path === "/admin/orders")
      view = <AdminOrders orders={adminOrders} onStatus={handleAdminStatusChange} />;
    else if (path === "/admin/analytics")
      view = <AnalyticsPage foods={foods} />;
    else if (path === "/admin/sales")
      view = <SalesPage />;
    else
      view = <ProfilePage admin go={go} user={user} logout={logout} />;

    return (
      <AdminLayout path={path} go={go} userName={user?.name || "Administrator"} logout={logout}>
        {view}
      </AdminLayout>
    );
  }

  let studentView: ReactNode;
  if (path === "/student")
    studentView = (
      <StudentHome
        foods={foods}
        cart={cartMap}
        add={addItem}
        go={go}
        studentName={user?.name || "Student"}
      />
    );
  else if (path === "/student/menu")
    studentView = <MenuPage foods={foods} cart={cartMap} add={addItem} />;
  else if (path === "/student/cart")
    studentView = (
      <CartPage
        foods={foods}
        cart={cartMap}
        change={updateQuantity}
        clear={clearCart}
        place={handlePlaceOrder}
        go={go}
        totalAmount={totalAmount}
        loading={placing}
      />
    );
  else if (path === "/student/orders")
    studentView = <OrdersPage orders={orders} foods={foods} go={go} />;
  else if (path === "/student/profile")
    studentView = <ProfilePage go={go} user={user} logout={logout} />;
  else {
    const id = path.split("/")[3];
    const cleanId = id ? id.replace(/^CF-/, "") : "";
    const order =
      orders.find((o) => o.id === id || String(o.order_id) === cleanId) ||
      orders[0] || {
        id: id || "CF-000",
        order_id: Number(cleanId) || 0,
        student: user?.name || "Student",
        date: "Today",
        status: "Pending" as Status,
        items: [],
        total_amount: 0,
      };

    studentView = path.endsWith("/receipt") ? (
      <Receipt order={order} foods={foods} go={go} user={user} />
    ) : (
      <OrderDetail order={order} foods={foods} go={go} />
    );
  }

  return (
    <StudentLayout
      path={path}
      go={go}
      count={itemCount}
      userName={user?.name || "Student"}
    >
      {studentView}
    </StudentLayout>
  );
}
