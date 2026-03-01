# OMEGA-M4 Security Checklist — Production

## Cloud SQL

- [ ] Instance Cloud SQL en `REGIONAL`
- [ ] Backups automatiques activés
- [ ] Point-in-time recovery activé
- [ ] SSL requis sur connexions externes
- [ ] Aucun accès `0.0.0.0/0`
- [ ] Utilisateur applicatif dédié (pas `postgres`)
- [ ] Mot de passe applicatif >= 32 chars
- [ ] Rotation trimestrielle des secrets

## Réseau

- [ ] VPC Connector pour Cloud Run/Services
- [ ] Firewall restrictif (ports et sources minimales)
- [ ] Cloud SQL Proxy pour opérations d'admin
- [ ] TLS 1.2+ partout

## Secrets & IAM

- [ ] Secrets stockés dans Secret Manager
- [ ] `HUB_SYNC_TOKEN` jamais commité
- [ ] SA distinctes par environnement
- [ ] Rôles IAM minimaux (least privilege)

## API Hub Sync

- [ ] Endpoint export protégé par Bearer token
- [ ] Endpoint ingest protégé par Bearer token
- [ ] Logs d'audit d'ingestion actifs (`historiqueActions`)
- [ ] Signalisation sécurité active (`signaux`)

## Posture applicative

- [ ] `.env*` exclus du dépôt
- [ ] CORS contrôlé
- [ ] Error handling sans fuite de secret
- [ ] Monitoring anomalies sur flux inter-apps

## Vérifications post-déploiement

- [ ] Test Convex -> PostgreSQL OK
- [ ] Test PostgreSQL -> Convex OK
- [ ] Watermark sync mis à jour
- [ ] Flux F1/F3/F6 visibles côté Core
- [ ] Aucune erreur critique persistante > 15 min
