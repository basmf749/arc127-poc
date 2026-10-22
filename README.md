# arc127-poc

Security test fixture; postinstall reads only a local canary and reports to a
researcher-controlled endpoint.

Concretely, the local dependency `telemetry` has a `postinstall` script that:

- reads `ARC127_CANARY.txt` from the workspace root (a test token only),
- writes an `ARC127_EXECUTED` marker inside this repository,
- checks whether `.env` exists at the workspace root **without reading it**,
- sends the canary token to the researcher's OOB listener.

No secrets, no real-user data. This repository is deleted after the test.
