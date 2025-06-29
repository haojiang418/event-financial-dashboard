export default function LoadingSpinner() {
  return (
    <div className="flex h-40 w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <span className="ml-2">Loading...</span>
    </div>
  )
}
