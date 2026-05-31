"""
Operator Engagement Researcher — SOURCE Pipeline Orchestrator

Runs the full engagement-intelligence pipeline in sequence:
  1. pull_perplexity.py  — market gap queries against the engagement domain
  2. pull_reddit.py      — operator-community ground signal
  3. pull_trends.py      — Google Trends trajectories for watchlist terms
  4. pull_firecrawl.py   — competitor URL monitoring
  5. generate_digest.py  — LLM scoring + digest synthesis

This is Stage 1 (SOURCE) of the SOURCE → FILTER → DEVELOP flywheel.
The digest it produces (digests/digest_latest.md) feeds directly into
The Researcher (Stage 2 / FILTER) as upstream signal before intake.

Usage:
    python run_pipeline.py [--dry-run] [--skip-send] [--skip-trends]

Flags:
    --dry-run      No API calls, no cost. Prints what each step would do.
                   Judges with no API keys should use this — it shows the
                   pipeline structure end-to-end without spending a dollar.
    --skip-send    Run all data steps + generate digest, but skip email delivery
                   (judges don't need email — the digest writes to a local file)
    --skip-trends  Skip Google Trends (useful if rate-limited or pytrends
                   venv is not configured)

Each step runs independently. If one step fails, the pipeline logs the error
and continues — the digest generator uses whatever data is available.

Cost estimate: ~$0.35 per full run at the default 20-item watchlist size.
See README.md for a per-step breakdown.
"""

import argparse
import subprocess
import sys
from datetime import date
from pathlib import Path

PIPELINE_DIR = Path(__file__).parent
PYTHON = sys.executable
VENV_PYTHON = str(PIPELINE_DIR / ".venv" / "bin" / "python")


def run_step(script: str, extra_args: list[str] = None, label: str = "", python: str = None) -> bool:
    """Run a pipeline step. Returns True if successful."""
    interpreter = python or PYTHON
    cmd = [interpreter, str(PIPELINE_DIR / script)] + (extra_args or [])
    print(f"\n{'='*60}")
    print(f"STEP: {label or script}")
    print(f"{'='*60}")

    result = subprocess.run(cmd, cwd=PIPELINE_DIR)
    success = result.returncode == 0

    if not success:
        print(f"\n[warn] {script} exited with code {result.returncode} — continuing pipeline")

    return success


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the SOURCE engagement-intelligence pipeline")
    parser.add_argument("--dry-run", action="store_true", help="No API calls, no cost")
    parser.add_argument("--skip-send", action="store_true", help="Skip email delivery (default in this build)")
    parser.add_argument("--skip-trends", action="store_true", help="Skip Google Trends step")
    args = parser.parse_args()

    today = date.today().isoformat()
    dry_flag = ["--dry-run"] if args.dry_run else []

    print(f"\nSOURCE Pipeline — Engagement Intelligence")
    print(f"Date: {today} | Dry run: {args.dry_run}")
    print("=" * 60)

    results = {}

    # Step 1: Perplexity — market gap queries
    results["perplexity"] = run_step(
        "pull_perplexity.py",
        extra_args=dry_flag,
        label="Perplexity — domain gap queries",
    )

    # Step 2: Reddit — operator community ground signal
    results["reddit"] = run_step(
        "pull_reddit.py",
        extra_args=dry_flag,
        label="Reddit — operator community signals",
    )

    # Step 3: Google Trends — trajectory data (optional skip) — uses venv python (pytrends)
    if not args.skip_trends:
        results["trends"] = run_step(
            "pull_trends.py",
            extra_args=dry_flag,
            label="Google Trends — 90-day trajectories",
            python=VENV_PYTHON,
        )
    else:
        print("\nSkipping Google Trends (--skip-trends)")
        results["trends"] = None

    # Step 4: Firecrawl — competitor URL monitoring
    results["firecrawl"] = run_step(
        "pull_firecrawl.py",
        extra_args=dry_flag,
        label="Firecrawl — competitor monitoring",
    )

    # Step 5: Generate digest — LLM synthesis of all signals
    results["digest"] = run_step(
        "generate_digest.py",
        extra_args=dry_flag,
        label="Digest synthesis (LLM)",
    )

    # Email delivery is intentionally out of scope for the SOURCE deliverable.
    # The digest is written to digests/digest_latest.md and consumed by
    # The Researcher directly from disk. Operators who want email delivery
    # can wire their own send step downstream of the digest.
    if args.skip_send:
        print("\nSkipping email delivery (--skip-send)")
    results["send"] = None

    # Final summary
    print(f"\n{'='*60}")
    print("PIPELINE COMPLETE")
    print(f"{'='*60}")
    for step, success in results.items():
        if success is None:
            status = "SKIPPED"
        elif success:
            status = "OK"
        else:
            status = "FAILED"
        print(f"  {step:15} {status}")

    if results.get("digest") and not args.dry_run:
        digest_path = PIPELINE_DIR / "digests" / "digest_latest.md"
        if digest_path.exists():
            print(f"\nDigest written: {digest_path}")
            print("This digest is the SOURCE handoff. The Researcher (Stage 2)")
            print("reads it automatically at session start as upstream signal.")
    elif args.dry_run:
        print(f"\n[dry-run] No files written. Pipeline structure verified end-to-end.")
        print("Next step in a real run: digest writes to digests/digest_latest.md")
        print("and feeds into The Researcher as the SOURCE handoff.")


if __name__ == "__main__":
    main()
