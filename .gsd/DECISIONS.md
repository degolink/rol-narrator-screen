# DECISIONS.md — Architecture Decision Record (ADR)

This file tracks significant design and architectural decisions.

## ADR-01: One Active Character Model
- **Status**: Accepted
- **Context**: Players could previously have multiple characters, making diarization ambiguous.
- **Decision**: Restrict players to one active character at a time.
- **Consequences**: Simplified speaker identification; consistent player identity; requires UI for character switching.
