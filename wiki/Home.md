# Project 20251205 Wiki

Welcome to the wiki for the Qhitz multi-app stack. Use the pages here to understand setup, environments, and key features across the Property Management, Supply Chain, Serbisyo24x7, and core services.

## Pages
- [[Property Management]]
- [[Contracts]]
- [[Supply Chain]] (coming soon)
- [[Serbisyo24x7]] (coming soon)

## Quick Links
- Frontend: http://localhost:3000
- Property API: http://localhost:5050
- Supply Chain API: http://localhost:5070
- Serbisyo24x7 API: http://localhost:5080
- Reverse Proxy: http://localhost (routes `/api/auth`, `/api/media`, `/api/cloud`, `/api/property`, `/api/supply`, `/api/serbisyo`)

## Environments
- Local (Docker compose): run `./rebuild-all.sh --quick` for fast rebuild, or without `--quick` for full backup/restore.
- Property/Supply stacks: `./scripts/start-property-supply.sh --build` to rebuild and start only those services.

## Contacts
- Property Management: property-management/frontend and property-management/backend
- Supply Chain: supply-chain/backend
- Serbisyo24x7: serbisyo24x7/backend

Use the Contracts page for details on generating, validating, and saving agreements.
