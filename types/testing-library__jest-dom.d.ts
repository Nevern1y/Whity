import "@testing-library/jest-dom"

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R
      toHaveAttribute(attr: string, value?: string): R
      toHaveClass(...classNames: string[]): R
      toHaveStyle(style: Record<string, any>): R
      toBeVisible(): R
      toBeDisabled(): R
      toHaveTextContent(text: string | RegExp): R
      toContainHTML(html: string): R
      toContainElement(element: HTMLElement | null): R
      toBeEmpty(): R
      toBeEmptyDOMElement(): R
      toBeInvalid(): R
      toBeRequired(): R
      toBeValid(): R
      toBeChecked(): R
      toBePartiallyChecked(): R
      toHaveDescription(text: string | RegExp): R
      toHaveDisplayValue(value: string | RegExp | Array<string | RegExp>): R
      toHaveFocus(): R
      toHaveFormValues(values: Record<string, any>): R
      toHaveValue(value: string | string[] | number): R
      toBeInTheDOM(): R
      toHaveAccessibleDescription(description: string | RegExp): R
      toHaveAccessibleName(name: string | RegExp): R
      toHaveErrorMessage(text: string | RegExp): R
    }
  }
} 