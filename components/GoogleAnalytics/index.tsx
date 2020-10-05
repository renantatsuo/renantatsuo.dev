export default function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      ></script>
      <script
        async
        dangerouslySetInnerHTML={{
          __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', '${gaId}');
            `,
        }}
      />
    </>
  );
}

type GoogleAnalyticsProps = {
  gaId: string;
};
