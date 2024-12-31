import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/S?plan=SREV-23'); // Redirect to Informática with latest plan by default
}
