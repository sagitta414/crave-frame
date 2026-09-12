# Setup and configuration

## Browser and TV web build

Install Node.js 24+, npm, and Git. From the repository root:

~~~sh
npm run setup
npm run build
npm run dev
~~~

Visit http://127.0.0.1:4178/tv/. Stop the server with Ctrl+C. After editing tv source, stop the server, rebuild from the root, and start it again. Backend and browser source changes also require restarting the development server. The server builds the web layer on startup; it expects the initial TV export to exist.

The server binds to loopback by default. A phone cannot reach your computer using the phone’s own localhost address. Use a separately hosted HTTPS environment for phone/TV integration testing, or deliberately configure a development network endpoint. Do not expose a development server with real household credentials on an untrusted network.

## Optional external services

| Setting | Used for | Local configuration |
| --- | --- | --- |
| TMDB_ACCESS_TOKEN | Title search, edition/episode details and availability | Export in the shell running npm run dev |
| GCP_PROJECT_ID | Your Vertex AI project | Export in the shell |
| GCP_MODEL | Gemini model override | Export in the shell; default gemini-2.5-flash |
| Service account JSON | Server-side Vertex authorization | web/.local/vertex-account.json |
| EXPO_PUBLIC_API_ORIGIN | Explicit TV API origin | tv/.env.local before exporting; this value is public |
| INTEGRATION_ENCRYPTION_KEY | Optional encrypted integration configuration | Server-only environment; follow server/integrations.js format |

Enable Vertex AI in your own project and use an identity with appropriate Vertex permissions. Runtime production configuration uses GCP_SERVICE_ACCOUNT_JSON instead of committing a file. Never put credentials into EXPO_PUBLIC variables: Expo embeds those into the client bundle. The checked-in .env.example files contain names only; the backend does not automatically load a dotenv file.

Example PowerShell, using placeholders you replace locally:

~~~powershell
$env:GCP_PROJECT_ID='your-project-id'
$env:GCP_MODEL='gemini-2.5-flash'
$env:TMDB_ACCESS_TOKEN='your-token'
npm run dev
~~~

Without AI credentials, use the catalog. Without TMDB credentials, seeded titles still exist but external lookup is unavailable. AI service actions may incur provider charges. Local development does not provide an R2 MEDIA binding; media-upload workflows require a suitable hosted environment.

## TV development and Android

The simplest full-stack TV test is the exported web app served at /tv/. For Expo-only web development, set EXPO_PUBLIC_API_ORIGIN to an appropriate backend and account for the backend’s origin checks; running an arbitrary cross-origin frontend is not the documented default.

The checked-in Android project is a prototype Fire OS/Android TV wrapper. Install a compatible Android SDK and JDK for the Expo/React Native versions in tv/package.json. The optional tv/scripts/build-tv.ps1 helper expects JAVA_HOME and ANDROID_HOME or locally provisioned tools; SDKs are not supplied. Its local tool-directory conventions may need adjustment on a new machine.

No signing keystore is included. The prototype Gradle configuration refers to android/app/debug.keystore, including for its demo release variant. Generate a local debug keystore for development, or configure your own release signing before distribution. Do not interpret a debug-signed demo APK as an Appstore-ready release. Native builds and sideloading must be tested separately from the web export.

On a native device, set EXPO_PUBLIC_API_ORIGIN to your own reachable HTTPS backend before building. Without an override, native source retains the existing public demonstration endpoint; this is not suitable for an independent production deployment.

## Production

The existing deployment uses a Cloudflare-compatible Worker through Sites, D1 for structured persistence, R2 for supported media, and static assets for the frontends. Configure your own project, migrations, runtime secrets, and access policy. The existing web/.openai/hosting.json is deployment provenance, not authorization to publish to that project.

## Troubleshooting

- Missing web/product/tv: run the root npm run build before npm run dev.
- Missing node:sqlite: use Node 24+, not an older Node installation.
- AI unavailable: confirm your Vertex identity, project, permissions, quota, and provider access.
- Wrong backend on a device: rebuild after changing EXPO_PUBLIC_API_ORIGIN.
- Old matching UI in Silk: reload the page; if necessary reopen the current /tv/ URL.
- Empty matches: review time, food, family, recent-meal and streaming-service restrictions before weakening any guardrails.

The TV package uses react-native-tvos with a prerelease version. tv/.npmrc enables legacy peer resolution to install its checked-in lockfile consistently; this is a compatibility workaround, not a claim that every upstream peer combination is supported.
