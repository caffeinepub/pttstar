# Promotion Records Index

This directory contains records of all preview-to-production promotions for PTTStar.

## Current Production Version

**Version 55** - Promoted February 12, 2026  
[View Promotion Record](./version-55-preview-to-production.md)

---

## Promotion History

### Version 55 - February 12, 2026
- **Status**: APPROVED & DEPLOYED
- **Promotion Record**: [version-55-preview-to-production.md](./version-55-preview-to-production.md)
- **Deployment Record**: [../deployments/version-55-production-deployment.md](../deployments/version-55-production-deployment.md)
- **Verification Status**: PASS (all checklists completed)
- **Issues Found**: None (critical or non-critical)
- **Key Features**: Enhanced BrandMeister detection, TGIF DMR support, AllStar preset, improved error handling, server directory sources configuration

### Version 30 - [Previous Date]
- **Status**: SUPERSEDED
- **Promotion Record**: [version-30-preview-to-production.md](./version-30-preview-to-production.md)
- **Deployment Record**: [../deployments/version-30-production-deployment.md](../deployments/version-30-production-deployment.md)
- **Verification Status**: PASS
- **Issues Found**: None
- **Key Features**: Fresh clean production deployment to new IC canisters

### Version 23 - [Previous Date]
- **Status**: SUPERSEDED
- **Promotion Record**: [version-23-preview-to-production.md](./version-23-preview-to-production.md)
- **Verification Status**: PASS
- **Issues Found**: None
- **Key Features**: Initial promotion with comprehensive verification checklist

---

## Promotion Process

All promotions follow the standardized process documented in:
- [Publish Preview to Production Runbook](../publish-preview-to-production.md)

### Promotion Workflow
1. **Pre-Promotion Verification**: Complete comprehensive checklist in preview environment
2. **Issue Classification**: Identify and classify any issues (critical vs non-critical)
3. **Attestation**: Explicitly attest that no code or configuration changes are being introduced
4. **Promotion Execution**: Deploy preview build to production (deployment-only operation)
5. **Post-Promotion Verification**: Verify production deployment health and functionality
6. **Monitoring**: Monitor production for 24 hours post-promotion
7. **Documentation**: Complete promotion and deployment records

### Key Principles
- **Deployment-Only**: Promotions must not introduce code or configuration changes
- **Comprehensive Verification**: All checklist items must be completed and documented
- **Issue Resolution**: Critical issues must be resolved before promotion
- **Documentation**: Detailed records for every promotion
- **Rollback Capability**: Maintained for all production deployments

---

## Verification Checklist

Each promotion record includes verification of:
1. Authentication & Authorization
2. Connect Page (IAX/DVSwitch and Digital Voice)
3. PTT Page (Display, Status, and Functionality)
4. Activity Page
5. Settings Page
6. About/Compliance Page
7. PWA Functionality
8. Navigation & Layout
9. Directory Page
10. Quick Setup & Presets
11. Error Handling & Recovery

---

## Access to Production

### Current Production URLs
See the current deployment record for production access information:
- [Version 55 Production Deployment](../deployments/version-55-production-deployment.md)

---

## Related Documentation

- [Deployments Index](../deployments/README.md)
- [Publish Preview to Production Runbook](../publish-preview-to-production.md)
- [DroidStar Settings Reference](../droidstar-settings-reference.md)

---

## Promotion Sign-off

Each promotion record includes:
- Pre-promotion verification results
- Code/configuration change attestation
- Promotion execution details
- Post-promotion verification results
- Final approval sign-off

All promotion records are maintained for audit and reference purposes.
