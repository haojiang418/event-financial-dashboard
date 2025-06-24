interface ErrorMessageProps {
  message: string
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="my-8 rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
      <p>{message}</p>
    </div>
  )
}
