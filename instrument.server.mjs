import * as Sentry from "@sentry/react-router";
Sentry.init({
  dsn: "https://fe7f9ff71e164cdfe155c806ad1eeacf@o4510800057991168.ingest.de.sentry.io/4510800067166288",
  // Adds request headers and IP for users, for more info visit:
  // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#sendDefaultPii
  sendDefaultPii: false,
  // Enable logs to be sent to Sentry
  enableLogs: true,
  // Add our Profiling integration
  tracesSampleRate: 0.1,
  // Set profilesSampleRate to 1.0 to profile 100%
  // of sampled transactions.
  // This is relative to tracesSampleRate
  // Learn more at
  // https://docs.sentry.io/platforms/javascript/guides/react-router/configuration/options/#profilesSampleRate
});
