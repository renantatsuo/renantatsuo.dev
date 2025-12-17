import "~/styles/globals.css";

export default function MyApp({ Component, pageProps }) {
  return (
    <main className="w-full max-w-185 p-4 flex items-start flex-col gap-8 bg-background">
      <Component {...pageProps} />
    </main>
  );
}
