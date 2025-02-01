import "@testing-library/jest-dom"
// import "@testing-library/jest-dom/extend-expect" 

// Мокаем next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      pathname: '',
    }
  },
  usePathname() {
    return ''
  },
}))

// Мокаем next-auth/react
jest.mock('next-auth/react', () => ({
  useSession() {
    return { data: null, status: 'unauthenticated' }
  },
}))

// Глобальные моки
global.jest = jest

// Очищаем все моки перед каждым тестом
beforeEach(() => {
  jest.clearAllMocks()
})

// Мок для window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
}) 