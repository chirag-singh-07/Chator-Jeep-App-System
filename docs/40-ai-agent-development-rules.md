# AI Agent Development Rules

## Rules

1. Never blindly rewrite working code.
2. Inspect before modifying.
3. Preserve existing API contracts unless intentionally versioning them.
4. Never expose secrets.
5. Never invent database fields without documenting them.
6. Never change order states arbitrarily.
7. Never trust client-side prices.
8. Never trust client-side payment success.
9. Always validate authorization server-side.
10. Use MongoDB transactions where necessary.
11. Use idempotency for payment/order operations.
12. Do not store unlimited GPS data unnecessarily.
13. Do not send GPS updates every second unless required.
14. Do not use expensive map-routing APIs unnecessarily.
15. Keep customer, restaurant, and delivery permissions separate.
16. Treat backend as source of truth.
17. Keep mobile UI separate from business logic.
18. Maintain backwards compatibility during Expo -> Flutter migration.
19. Test critical order flows before deployment.
20. Make incremental changes.
21. Before changing architecture, document why.
22. Before deleting code, confirm it is unused.
23. Never modify production configuration without explicit approval.
24. Never commit .env files or secrets.
25. Always explain breaking changes.
