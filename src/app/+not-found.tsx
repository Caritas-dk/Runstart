import { Redirect } from 'expo-router';

/** Any unknown address (e.g. when the browser demo is opened from another path) goes to the start screen. */
export default function NotFound() {
  return <Redirect href="/" />;
}
