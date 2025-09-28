<!--
Sync Impact Report:
- Version: 1.0.0 → 1.1.0 (added Japanese response requirement principle)
- Principles: Added VI. Japanese Communication Standards
- Added sections: None
- Removed sections: None
- Templates: ✅ All templates consistent with updated principles
- No deferred TODOs
-->

# Notion Service Constitution

## Core Principles

### I. Service-First Architecture
Every feature must be implemented as a focused Firebase Cloud Function. Functions must be self-contained, independently deployable, and serve a single business purpose. Clear separation between Notion API integration, data transformation, and response formatting is required.

### II. TypeScript Standards
All code must be written in TypeScript with strict type checking enabled. Type definitions must be comprehensive, covering all data structures, API responses, and function parameters. No `any` types are permitted except for well-documented external API integrations.

### III. Test Coverage
Unit tests are mandatory for all service functions and helper utilities. Test coverage must exceed 80% for all modules. Integration tests are required for Notion API interactions and data transformation pipelines.

### IV. Firebase Integration
All functions must follow Firebase Functions best practices including proper error handling, timeout configuration, and memory optimization. Functions must use Firebase Admin SDK for authentication and data access where applicable.

### V. API Design
All endpoints must return consistent JSON responses with proper HTTP status codes. Error responses must include meaningful messages without exposing internal implementation details. API documentation must be maintained for all public endpoints.

### VI. Japanese Communication Standards
All AI assistant responses must be in Japanese regardless of the input language. All documentation files (.md) must have corresponding Japanese versions. Code comments and technical documentation must prioritize Japanese language for better team communication and accessibility.

## Security Requirements

All Notion API keys and sensitive configuration must be stored in Firebase environment variables. Input validation is required for all external data sources. Error logs must not contain sensitive information or API keys.

## Development Workflow

All changes require unit tests to pass before deployment. ESLint and Prettier must be used for code formatting and quality checks. TypeScript compilation must succeed without warnings. Functions must be tested locally using Firebase emulators before deployment.

## Governance

This constitution supersedes all other development practices. All code reviews must verify compliance with these principles. Amendments require documentation of rationale and migration plan for existing code.

**Version**: 1.1.0 | **Ratified**: 2025-01-28 | **Last Amended**: 2025-01-28