import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to login - admin check would be done at login page
  redirect('/login')
}