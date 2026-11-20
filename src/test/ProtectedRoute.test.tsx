import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import type { AppRole } from "@/lib/autoreach";

vi.mock("@/context/AuthContext", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/context/AuthContext")>();
  return { ...actual, useAuth: vi.fn() };
});
const auth = vi.mocked(useAuth);
afterEach(cleanup);
function SignIn() {
  const location = useLocation();
  return <p>Sign in for {location.state?.from}</p>;
}
function renderRoute(role: AppRole | null, allow: AppRole[], signedIn = true, loading = false) {
  auth.mockReturnValue({ user: signedIn ? { id: "test-user" } : null, role, loading } as ReturnType<typeof useAuth>);
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route path="/protected" element={<ProtectedRoute allow={allow}><p>Private content</p></ProtectedRoute>} />
        <Route path="/auth" element={<SignIn />} />
        <Route path="/dashboard" element={<p>Customer home</p>} />
        <Route path="/admin" element={<p>Admin home</p>} />
        <Route path="/driver" element={<p>Driver home</p>} />
      </Routes>
    </MemoryRouter>,
  );
}
describe("role access", () => {
  it.each<AppRole>(["customer", "admin", "driver"])("allows the matching %s role", role => {
    renderRoute(role, [role]);
    expect(screen.getByText("Private content")).toBeInTheDocument();
  });
  it("redirects signed-out users and preserves their destination", () => {
    renderRoute(null, ["customer"], false);
    expect(screen.getByText("Sign in for /protected")).toBeInTheDocument();
    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
  });
  it("keeps customers out of admin pages", () => {
    renderRoute("customer", ["admin"]);
    expect(screen.getByText("Customer home")).toBeInTheDocument();
    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
  });
  it("keeps drivers out of customer pages", () => {
    renderRoute("driver", ["customer"]);
    expect(screen.getByText("Driver home")).toBeInTheDocument();
  });
  it("withholds content while the session is loading", () => {
    renderRoute("admin", ["admin"], true, true);
    expect(screen.queryByText("Private content")).not.toBeInTheDocument();
  });
});

describe("login page per role", () => {
  it("sends signed-out admin and driver visitors to their own sign-in pages", async () => {
    const { loginFor } = await import("@/components/ProtectedRoute");
    expect(loginFor(["admin"])).toBe("/admin/login");
    expect(loginFor(["driver"])).toBe("/driver/login");
    expect(loginFor(["customer"])).toBe("/auth");
  });
});
