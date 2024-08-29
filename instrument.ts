// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
const Sentry = require("@sentry/node");
const { nodeProfilingIntegration } = require("@sentry/profiling-node");

// ! Setup Later for deployment
Sentry.init({
	dsn: "https://c038d7f652ac2f0ddb17f5b4fc1efa25@o4507748953292800.ingest.de.sentry.io/4507748989141072",
	integrations: [nodeProfilingIntegration()],
	// Performance Monitoring
	tracesSampleRate: 1.0, //  Capture 100% of the transactions

	// Set sampling rate for profiling - this is relative to tracesSampleRate
	profilesSampleRate: 1.0,
});
