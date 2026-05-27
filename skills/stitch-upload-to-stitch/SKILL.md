---
name: stitch-upload-to-stitch
description: >-
  Upload local assets (images, mockups, extracted HTML) to a Stitch project.
  ALWAYS use this skill when you need to upload visual assets or full HTML pages
  to Stitch, particularly when direct MCP tool calls fail or truncate due to
  base64 token limits.
allowed-tools:
  - "stitch*:*"
  - "Bash"
  - "Read"
  - "Write"
  - "web_fetch"
---

# Upload-to-Stitch

Upload local assets (images, mockups, HTML files) to a Stitch project using the
provided upload script, which bypasses the MCP tool's base64 output token limits.

In `stitch-orchestrator`, prefer the bundled Stitch MCP server for normal design
work. Use this uploader when you specifically need large file uploads or when
direct tool calls are not sufficient.

> [!NOTE]
> The AI model cannot upload files via MCP tools directly because the base64
> encoding of even a small file exceeds the model's output token limit (~16K
> tokens). This script reads the file and sends it directly over HTTP.

## Steps

### 1. Identify Target Project

Use `list_projects` to find the correct `projectId`.

### 2. Resolve Native Stitch Auth

In `stitch-orchestrator`, prefer the same auth model as the bundled MCP server:

- obtain an ADC access token from `gcloud auth application-default print-access-token`
- resolve the billing project from `STITCH_BILLING_PROJECT`, `GOOGLE_CLOUD_PROJECT`, or the active `gcloud` project
- use `https://stitch.googleapis.com` unless the user explicitly overrides it

> [!IMPORTANT]
> If ADC is not configured, stop and tell the user to run
> `gcloud auth application-default login` or provide an explicit override.
> The upload helper should feel native to this plugin's ADC-based workflow.

### 3. Run Upload Script

> [!WARNING]
> **Checkpoint — User Confirmation Required.**
> Before running the upload script, you **MUST** pause and present the file(s)
> to be uploaded (paths, sizes, and types) to the user and wait for explicit
> approval. Do **NOT** execute the upload script until the user confirms.

Use `run_command` to execute the Python script:

```bash
python3 <SKILL_DIR>/scripts/upload_to_stitch.py \
  --project-id <PROJECT_ID> \
  --file-path <PATH_TO_FILE> \
  [--api-url <STITCH_API_URL>] \
  [--access-token <ACCESS_TOKEN>] \
  [--billing-project <GOOGLE_BILLING_PROJECT>] \
  [--api-key <API_KEY>] \
  [--title <SCREEN_TITLE>]
```

> [!TIP]
> **macOS / SSL Certificate Troubleshooting:**
> If the upload fails with `ssl.SSLCertVerificationError: [SSL: CERTIFICATE_VERIFY_FAILED] unable to get local issuer certificate`, this means your Python installation does not have root certificate authorities configured.
> Fix it by prepending `SSL_CERT_FILE` using the `certifi` bundle:
> ```bash
> SSL_CERT_FILE=$(python3 -c "import certifi; print(certifi.where())") python3 <SKILL_DIR>/scripts/upload_to_stitch.py \
>   --project-id <PROJECT_ID> \
>   --file-path <PATH_TO_FILE> \
>   --billing-project <GOOGLE_BILLING_PROJECT>
> ```

### Supported File Types

| Extension | MIME Type |
|:---|:---|
| `.png` | `image/png` |
| `.jpg`, `.jpeg` | `image/jpeg` |
| `.webp` | `image/webp` |
| `.html`, `.htm` | `text/html` |

The script auto-detects MIME type from the file extension.

### Script Defaults

- `--api-url` defaults to `https://stitch.googleapis.com`
- ADC + billing project is the native default
- `--api-key` remains available only as a fallback for non-native environments
- Screen instances are automatically created for display
- For HTML files, `screenType` is set to `DOCUMENT`; for images, `IMAGE`
