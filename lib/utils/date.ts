export function timeAgo(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "À l'instant"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `Il y a ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Il y a ${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `Il y a ${days}j`
  return new Date(date).toLocaleDateString("fr-FR")
}

export function formatDate(date: string): string {
  const messageDate = new Date(date)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (messageDate.toDateString() === today.toDateString()) {
    return "Aujourd'hui"
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return "Hier"
  } else {
    return messageDate.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
    })
  }
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })
}