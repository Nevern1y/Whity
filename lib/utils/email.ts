export const getSafeEmail = (email: string | null | undefined): string => {
  if (!email) return 'support@example.com'
  return email
} 