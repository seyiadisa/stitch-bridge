#!/usr/bin/env python3
r"""Upload an image or HTML to a Stitch project via BatchCreateScreens.

WHY THIS SCRIPT EXISTS:
    The AI model cannot upload files via the MCP tool directly because MCP tool
    call arguments are part of the model's *output*. The model must re-emit the
    entire base64-encoded file as generated text, but its output token limit
    (~16K tokens) is far smaller than a typical file's base64 encoding (e.g.
    a 53KB PNG becomes ~71K chars of base64). The output gets truncated
    mid-string, producing a corrupted payload that the API rejects.

    This script bypasses the model entirely — it reads the file, encodes it
    in-process, and sends the full payload directly over HTTP with no token
    limits.

SUPPORTED FILE TYPES:
    - Images: .png, .jpg, .jpeg, .webp
    - HTML: .html, .htm

Usage:
    python3 upload_to_stitch.py \
        --project-id <PROJECT_ID> \
        --file-path <PATH_TO_FILE> \
        [--api-url <STITCH_API_BASE_URL>] \
        [--access-token <ACCESS_TOKEN>] \
        [--billing-project <GOOGLE_BILLING_PROJECT>] \
        [--api-key <API_KEY>] \
        [--title <SCREEN_TITLE>] \
        [--create-screen-instances]
"""

import argparse
import base64
import json
import os
import pathlib
import subprocess
import sys
from typing import Any
import urllib.request


# Maps file extensions to MIME types.
_MIME_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".html": "text/html",
    ".htm": "text/html",
    ".md": "text/markdown",
}


def encode_file(path: pathlib.Path) -> str:
  """Read and base64-encode a file."""
  with open(path, "rb") as f:
    return base64.b64encode(f.read()).decode("utf-8")


def call_batch_create_screens(
    api_url: str,
    project_id: str,
    requests: list[dict[str, Any]],
    access_token: str | None = None,
    billing_project: str | None = None,
    api_key: str | None = None,
    create_screen_instances: bool = False,
    urlopen: Any = urllib.request.urlopen,
) -> dict[str, Any]:
  """Call BatchCreateScreens REST API directly.

  Endpoint: POST /v1/{parent=projects/*}/screens:batchCreate

  Args:
    api_url: Base URL of the Stitch API (e.g. https://stitch.googleapis.com).
    project_id: The Stitch project ID.
    requests: List of CreateScreenRequest dicts, each containing a screen.
    access_token: Optional ADC access token for bearer auth.
    billing_project: Optional Google billing project for native Stitch access.
    api_key: Optional API key fallback for non-native environments.
    create_screen_instances: Whether to create screen instances for display.
    urlopen: The urlopen function to use (for testing).

  Returns:
    Parsed JSON response dict.
  """
  url = f"{api_url.rstrip('/')}/v1/projects/{project_id}/screens:batchCreate"

  payload = {
      "parent": f"projects/{project_id}",
      "requests": requests,
      "createScreenInstances": create_screen_instances,
  }

  headers = {
      "Content-Type": "application/json",
  }

  if api_key:
    headers["X-Goog-Api-Key"] = api_key
  else:
    if not access_token:
      raise ValueError("access_token is required when api_key is not provided")
    if not billing_project:
      raise ValueError("billing_project is required when api_key is not provided")

    headers["Authorization"] = f"Bearer {access_token}"
    headers["X-Goog-User-Project"] = billing_project

  data = json.dumps(payload).encode("utf-8")
  req = urllib.request.Request(
      url,
      data=data,
      headers=headers,
      method="POST",
  )

  try:
    print("Calling urlopen...")
    with urlopen(req, timeout=120) as resp:
      print(f"urlopen returned. Status: {resp.getcode()}")
      body = resp.read().decode("utf-8")
      print(f"Response status: {resp.getcode()}")
      print(f"Response body (first 1000 chars): {body[:1000]}")
      if not body:
        print("Error: Empty response body")
        sys.exit(1)
      return json.loads(body)
  except urllib.error.HTTPError as e:
    error_body = e.read().decode("utf-8")
    print(f"HTTP Error {e.code}: {e.reason}")
    print(f"Response: {error_body}")
    sys.exit(1)


def build_screen_request(
    mime_type: str,
    b64_data: str,
    title: str | None = None,
) -> dict[str, Any]:
  """Build a CreateScreenRequest dict from a file.

  For images, the file is set as the screenshot.
  For HTML, the file is set as the html_code.

  Args:
    mime_type: The MIME type of the file.
    b64_data: Base64-encoded file content.
    title: Optional title for the screen.

  Returns:
    A CreateScreenRequest-shaped dict.
  """
  file_obj = {
      "fileContentBase64": b64_data,
      "mimeType": mime_type,
  }

  if mime_type in ("text/html", "text/markdown"):
    screen = {
        "htmlCode": file_obj,
        "screenType": "DOCUMENT",
        "isCreatedByClient": True,
    }
  else:
    screen = {
        "screenshot": file_obj,
        "screenType": "IMAGE",
        "isCreatedByClient": True,
    }

  if title:
    screen["title"] = title

  return {"screen": screen}


def parse_args():
  """Parse command-line arguments."""
  parser = argparse.ArgumentParser(
      description="Upload a file to a Stitch project via BatchCreateScreens."
  )
  parser.add_argument("--project-id", required=True, help="Stitch project ID")
  parser.add_argument(
      "--file-path",
      required=True,
      type=pathlib.Path,
      help=(
          "Path to the file to upload. Supported types:"
          f" {', '.join(sorted(_MIME_TYPES.keys()))}"
      ),
  )
  parser.add_argument(
      "--api-url",
      default="https://stitch.googleapis.com",
      help="Stitch API base URL. Defaults to https://stitch.googleapis.com.",
  )
  parser.add_argument(
      "--access-token",
      default=None,
      help="Optional bearer token override. Defaults to gcloud ADC token.",
  )
  parser.add_argument(
      "--billing-project",
      default=None,
      help=(
          "Optional Google billing project override. Defaults to STITCH_BILLING_PROJECT, "
          "GOOGLE_CLOUD_PROJECT, STITCH_USER_PROJECT, or the active gcloud project."
      ),
  )
  parser.add_argument(
      "--api-key",
      default=None,
      help="Optional API key fallback for non-native environments.",
  )
  parser.add_argument(
      "--title",
      default=None,
      help="Optional title for the created screen",
  )
  return parser.parse_args()


def run_gcloud(args: list[str], failure_message: str) -> str:
  try:
    result = subprocess.run(
        ["gcloud", *args],
        check=False,
        capture_output=True,
        text=True,
    )
  except FileNotFoundError:
    print(
        "Error: `gcloud` is not installed or is not available on PATH.\n"
        f"{failure_message}"
    )
    sys.exit(1)

  if result.returncode != 0:
    stderr = result.stderr.strip()
    print(f"Error: {failure_message}")
    if stderr:
      print(stderr)
    sys.exit(1)

  return result.stdout.strip()


def resolve_access_token(explicit_token: str | None) -> str | None:
  if explicit_token:
    return explicit_token

  return run_gcloud(
      ["auth", "application-default", "print-access-token"],
      "Run `gcloud auth application-default login` or pass --access-token explicitly.",
  )


def resolve_billing_project(explicit_project: str | None) -> str | None:
  if explicit_project:
    return explicit_project

  env_project = (
      os.environ.get("STITCH_BILLING_PROJECT")
      or os.environ.get("GOOGLE_CLOUD_PROJECT")
      or os.environ.get("STITCH_USER_PROJECT")
  )
  if env_project:
    return env_project.strip()

  project = run_gcloud(
      ["config", "get-value", "project"],
      "Set GOOGLE_CLOUD_PROJECT or STITCH_BILLING_PROJECT, or configure an active gcloud project.",
  )

  if not project or project == "(unset)":
    print(
        "Error: no Google billing project is configured.\n"
        "Set GOOGLE_CLOUD_PROJECT or STITCH_BILLING_PROJECT before using this uploader."
    )
    sys.exit(1)

  return project


def main():
  args = parse_args()

  file_path = args.file_path
  file_suffix = file_path.suffix.lower()
  mime_type = _MIME_TYPES.get(file_suffix)

  if mime_type is None:
    print(
        f"Error: Unsupported file type '{file_suffix}'. Supported types:"
        f" {', '.join(sorted(_MIME_TYPES.keys()))}"
    )
    sys.exit(1)

  if not file_path.exists():
    print(f"Error: File not found: {file_path}")
    sys.exit(1)

  print(f"File:      {file_path}")
  print(f"MIME type: {mime_type}")

  b64_data = encode_file(file_path)
  print(f"Base64:    {len(b64_data)} chars")

  screen_request = build_screen_request(mime_type, b64_data, title=args.title)

  print(f"\nUploading to project: {args.project_id}")
  print(f"API URL:   {args.api_url}")

  access_token = None
  billing_project = None
  if args.api_key:
    print("Auth mode: API key fallback")
  else:
    access_token = resolve_access_token(args.access_token)
    billing_project = resolve_billing_project(args.billing_project)
    print("Auth mode: ADC bearer token")
    print(f"Billing:   {billing_project}")

  result = call_batch_create_screens(
      api_url=args.api_url,
      project_id=args.project_id,
      requests=[screen_request],
      access_token=access_token,
      billing_project=billing_project,
      api_key=args.api_key,
      create_screen_instances=True,
  )

  print("\nResponse:")
  print(json.dumps(result, indent=2))


if __name__ == "__main__":
  main()
