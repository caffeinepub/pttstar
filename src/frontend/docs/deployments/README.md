# Production Deployments Index

This directory contains records of all production deployments for PTTStar.

## Current Production Deployment

**Version 56** - Deployed February 14, 2026  
[View Deployment Record](./version-56-production-deployment.md)

---

## Deployment History

### Version 56 - February 14, 2026
- **Type**: Preview to Production Promotion
- **Status**: READY FOR DEPLOYMENT
- **Deployment Record**: [version-56-production-deployment.md](./version-56-production-deployment.md)
- **Promotion Record**: [../promotions/version-56-preview-to-production.md](../promotions/version-56-preview-to-production.md)
- **Key Features**: Enhanced authorization error handling, improved error recovery UI, robust session management

### Version 55 - February 12, 2026
- **Type**: Preview to Production Promotion
- **Status**: SUPERSEDED
- **Deployment Record**: [version-55-production-deployment.md](./version-55-production-deployment.md)
- **Promotion Record**: [../promotions/version-55-preview-to-production.md](../promotions/version-55-preview-to-production.md)
- **Key Features**: Enhanced BrandMeister detection, TGIF DMR support, AllStar preset, improved error handling

### Version 30 - [Previous Date]
- **Type**: Fresh Clean Production Deployment
- **Status**: SUPERSEDED
- **Deployment Record**: [version-30-production-deployment.md](./version-30-production-deployment.md)
- **Promotion Record**: [../promotions/version-30-preview-to-production.md](../promotions/version-30-preview-to-production.md)
- **Key Features**: Initial production deployment to new IC canisters

### Version 23 - [Previous Date]
- **Type**: Preview to Production Promotion
- **Status**: SUPERSEDED
- **Promotion Record**: [../promotions/version-23-preview-to-production.md](../promotions/version-23-preview-to-production.md)

---

## Deployment Process

All production deployments follow the standardized process documented in:
- [Publish Preview to Production Runbook](../publish-preview-to-production.md)

### Key Principles
1. **Deployment-Only Operations**: No code or configuration changes during promotion
2. **Comprehensive Verification**: Complete pre-promotion and post-promotion verification checklists
3. **Documentation**: Detailed promotion and deployment records for every production release
4. **Rollback Capability**: Maintained for all production deployments

---

## Access Information

### Current Production URLs
- **Frontend**: `https://[canister-id].icp0.io` (see current deployment record)
- **Backend Canister**: `[backend-canister-id]` (see current deployment record)

### Authentication
- **Method**: Internet Identity
- **Provider**: `https://identity.internetcomputer.org`

---

## Monitoring & Support

### Health Monitoring
- Frontend canister response times
- Backend canister response times
- Error rates and uptime
- User authentication success rates
- WebRTC connection success rates
- Profile loading success rates

### Issue Reporting
Issues should be documented in the relevant deployment record and tracked for resolution.

---

## Related Documentation

- [Promotions Index](../promotions/README.md)
- [Publish Preview to Production Runbook](../publish-preview-to-production.md)
- [DroidStar Settings Reference](../droidstar-settings-reference.md)
