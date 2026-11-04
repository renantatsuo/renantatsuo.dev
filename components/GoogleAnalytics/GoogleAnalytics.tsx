type GoogleAnalyticsProps = {
  gaId: string;
};

function GoogleAnalytics({ gaId }: GoogleAnalyticsProps) {
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      ></script>
      <script
        async
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static gtag bootstrap; gaId is a build-time constant
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

export default GoogleAnalytics;
