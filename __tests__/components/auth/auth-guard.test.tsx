// Сначала импортируем типы и утилиты для тестирования
import { render, screen } from "@testing-library/react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

// Мокаем хуки
jest.mock("next-auth/react")
jest.mock("next/navigation")

const mockUseSession = useSession as jest.Mock
const mockPush = jest.fn()

// Мокаем useRouter
;(useRouter as jest.Mock).mockImplementation(() => ({
  push: mockPush
}))

describe("AuthGuard", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("shows loading spinner when session is loading", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "loading"
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("renders children when user is authenticated", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: "test-id",
          name: "Test User",
          role: "USER"
        },
        expires: ""
      },
      status: "authenticated"
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(screen.getByText("Protected Content")).toBeInTheDocument()
  })

  it("redirects to login when user is not authenticated", () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: "unauthenticated"
    })

    render(
      <AuthGuard>
        <div>Protected Content</div>
      </AuthGuard>
    )

    expect(mockPush).toHaveBeenCalledWith("/login")
  })

  it("allows admin to access admin page", () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: "admin-id",
          name: "Admin User",
          role: "ADMIN"
        },
        expires: ""
      },
      status: "authenticated"
    })

    render(
      <AuthGuard requireAdmin>
        <div>Admin Content</div>
      </AuthGuard>
    )

    expect(screen.getByText("Admin Content")).toBeInTheDocument()
  })
}) 