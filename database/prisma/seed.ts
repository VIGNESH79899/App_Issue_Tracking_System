import { PrismaClient, Role, Status, Priority, Severity, HistoryAction, NotificationType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive enterprise database seed...');

  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@system.local' },
  });
  if (existingAdmin) {
    console.log('⚡ Database already seeded with admin user. Skipping seed.');
    return;
  }

  // Hash secure default passwords
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Seed Users for ALL 4 initial roles
  const admin = await prisma.user.upsert({
    where: { email: 'admin@system.local' },
    update: { passwordHash },
    create: {
      email: 'admin@system.local',
      passwordHash,
      firstName: 'Alexander',
      lastName: 'Vance',
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const pm = await prisma.user.upsert({
    where: { email: 'pm@system.local' },
    update: { passwordHash },
    create: {
      email: 'pm@system.local',
      passwordHash,
      firstName: 'Samantha',
      lastName: 'Reed',
      role: Role.PROJECT_MANAGER,
      isActive: true,
    },
  });

  const developer1 = await prisma.user.upsert({
    where: { email: 'dev@system.local' },
    update: { passwordHash },
    create: {
      email: 'dev@system.local',
      passwordHash,
      firstName: 'Marcus',
      lastName: 'Chen',
      role: Role.DEVELOPER,
      isActive: true,
    },
  });

  const developer2 = await prisma.user.upsert({
    where: { email: 'dev2@system.local' },
    update: { passwordHash },
    create: {
      email: 'dev2@system.local',
      passwordHash,
      firstName: 'Elena',
      lastName: 'Rostova',
      role: Role.DEVELOPER,
      isActive: true,
    },
  });

  const reporter = await prisma.user.upsert({
    where: { email: 'reporter@system.local' },
    update: { passwordHash },
    create: {
      email: 'reporter@system.local',
      passwordHash,
      firstName: 'David',
      lastName: 'Kim',
      role: Role.REPORTER,
      isActive: true,
    },
  });

  console.log('✅ 5 System Users created covering all 4 initial roles (ADMIN, PROJECT_MANAGER, DEVELOPER, REPORTER).');

  // 2. Seed Software Applications
  const payGateApp = await prisma.application.upsert({
    where: { code: 'PAYGATE' },
    update: { ownerId: pm.id },
    create: {
      name: 'Payment Gateway Engine',
      code: 'PAYGATE',
      description: 'High-throughput transactional payment processor and webhook orchestration layer.',
      version: '2.4.0',
      ownerId: pm.id,
      isActive: true,
    },
  });

  const portalApp = await prisma.application.upsert({
    where: { code: 'PORTAL' },
    update: { ownerId: admin.id },
    create: {
      name: 'Customer Self-Service Portal',
      code: 'PORTAL',
      description: 'Web dashboard for enterprise client account management and billing operations.',
      version: '1.8.2',
      ownerId: admin.id,
      isActive: true,
    },
  });

  console.log('✅ 2 Enterprise Applications created.');

  // 3. Seed Projects
  const payApiProject = await prisma.project.upsert({
    where: { key: 'PAY' },
    update: { managerId: pm.id },
    create: {
      applicationId: payGateApp.id,
      name: 'Payment Core REST API',
      key: 'PAY',
      description: 'Core microservices managing authorization, captures, and refund workflows.',
      status: 'ACTIVE',
      startDate: new Date('2026-01-10'),
      endDate: new Date('2026-12-31'),
      managerId: pm.id,
    },
  });

  const checkoutProject = await prisma.project.upsert({
    where: { key: 'SDK' },
    update: { managerId: pm.id },
    create: {
      applicationId: payGateApp.id,
      name: 'Mobile Checkout SDK',
      key: 'SDK',
      description: 'iOS and Android client SDKs for seamless embedded payments.',
      status: 'ACTIVE',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-11-30'),
      managerId: pm.id,
    },
  });

  const portalUiProject = await prisma.project.upsert({
    where: { key: 'PORT' },
    update: { managerId: pm.id },
    create: {
      applicationId: portalApp.id,
      name: 'Portal React Interface',
      key: 'PORT',
      description: 'React frontend single-page application for client analytics.',
      status: 'ACTIVE',
      startDate: new Date('2026-03-15'),
      endDate: new Date('2026-10-15'),
      managerId: pm.id,
    },
  });

  console.log('✅ 3 Projects created.');

  // Assign Project Members
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: payApiProject.id, userId: developer1.id } },
    update: {},
    create: { projectId: payApiProject.id, userId: developer1.id, roleInProject: Role.DEVELOPER },
  });

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: payApiProject.id, userId: developer2.id } },
    update: {},
    create: { projectId: payApiProject.id, userId: developer2.id, roleInProject: Role.DEVELOPER },
  });

  // 4. Seed Realistic Issues across all canonical Statuses
  const issue1 = await prisma.issue.upsert({
    where: { issueKey: 'PAY-101' },
    update: {},
    create: {
      issueKey: 'PAY-101',
      title: 'Stripe Webhook Signature Verification Timeout under Burst Traffic',
      description: 'During high peak load (500 req/sec), signature verification drops due to synchronous crypto hashing blocking event loop.',
      applicationId: payGateApp.id,
      projectId: payApiProject.id,
      moduleComponent: 'WebhookHandler',
      reporterId: reporter.id,
      assigneeId: developer1.id,
      status: Status.IN_PROGRESS,
      priority: Priority.CRITICAL,
      severity: Severity.BLOCKER,
      environment: 'Staging-US-East-1',
      stepsToReproduce: '1. Trigger 500 webhooks/sec.\n2. Monitor API response latency metric.\n3. Observe HTTP 504 timeouts.',
      expectedResult: 'All incoming webhook signatures verify in < 15ms.',
      actualResult: 'Event loop spikes to 100% CPU usage causing 504 Gateway Timeout.',
      dueDate: new Date('2026-09-15'),
    },
  });

  const issue2 = await prisma.issue.upsert({
    where: { issueKey: 'PAY-102' },
    update: {},
    create: {
      issueKey: 'PAY-102',
      title: 'Idempotency Key Collisions in Asynchronous Refund Queue',
      description: 'Re-submitting a failed refund job with the same idempotency key causes duplicate refund requests to processor.',
      applicationId: payGateApp.id,
      projectId: payApiProject.id,
      moduleComponent: 'RefundService',
      reporterId: reporter.id,
      assigneeId: developer2.id,
      status: Status.RESOLVED,
      priority: Priority.HIGH,
      severity: Severity.CRITICAL,
      environment: 'Production-EU-West',
      stepsToReproduce: '1. Initiate refund for transaction TX-9842.\n2. Inject network interruption during ACK.\n3. Trigger queue auto-retry.',
      expectedResult: 'Queue worker skips duplicate processing using Redis lock.',
      actualResult: 'Refund API returns 200 twice for single transaction.',
      resolution: 'Implemented distributed Redis atomic lock with 30s TTL on refund keys.',
      resolvedAt: new Date('2026-08-30'),
    },
  });

  const issue3 = await prisma.issue.upsert({
    where: { issueKey: 'SDK-201' },
    update: {},
    create: {
      issueKey: 'SDK-201',
      title: 'iOS Swift SDK 3D-Secure 2.0 Challenge View Modal Rendering Glitch',
      description: 'On iOS 18 devices, the 3D-Secure OTP modal iframe cuts off bottom action buttons in dark mode.',
      applicationId: payGateApp.id,
      projectId: checkoutProject.id,
      moduleComponent: 'ThreeDSecureView',
      reporterId: reporter.id,
      assigneeId: developer1.id,
      status: Status.OPEN,
      priority: Priority.MEDIUM,
      severity: Severity.MAJOR,
      environment: 'iOS Simulator 18.2',
      stepsToReproduce: '1. Trigger 3DS challenge on iPhone 15 Pro.\n2. Toggle dark mode in system settings.',
      expectedResult: 'Modal renders full height with scrollable container.',
      actualResult: 'Submit button is clipped below viewport bottom.',
      dueDate: new Date('2026-09-30'),
    },
  });

  const issue4 = await prisma.issue.upsert({
    where: { issueKey: 'PORT-301' },
    update: {},
    create: {
      issueKey: 'PORT-301',
      title: 'CSV Export Missing Pagination Parameters on Transaction Audit Log',
      description: 'Downloading full audit log ignores applied date filters and exports only the first 50 records.',
      applicationId: portalApp.id,
      projectId: portalUiProject.id,
      moduleComponent: 'AuditLogTable',
      reporterId: reporter.id,
      assigneeId: developer2.id,
      status: Status.VERIFIED,
      priority: Priority.LOW,
      severity: Severity.MINOR,
      environment: 'Production',
      stepsToReproduce: '1. Navigate to Audit Log.\n2. Filter date range 2026-01-01 to 2026-08-01.\n3. Click Export CSV.',
      expectedResult: 'Export contains all matching filtered entries.',
      actualResult: 'File contains default page limit of 50 rows.',
      resolution: 'Added explicit filter parameters to backend export stream endpoint.',
      resolvedAt: new Date('2026-08-25'),
    },
  });

  const issue5 = await prisma.issue.upsert({
    where: { issueKey: 'PORT-302' },
    update: {},
    create: {
      issueKey: 'PORT-302',
      title: 'Session Token Expiry Does Not Redirect User to Login Screen',
      description: 'When JWT expires after 24h, clicking navigation links displays blank white screen instead of auth redirect.',
      applicationId: portalApp.id,
      projectId: portalUiProject.id,
      moduleComponent: 'AuthInterceptor',
      reporterId: reporter.id,
      assigneeId: developer1.id,
      status: Status.CLOSED,
      priority: Priority.HIGH,
      severity: Severity.MODERATE,
      environment: 'Staging',
      stepsToReproduce: '1. Log into portal.\n2. Clear JWT token from localStorage.\n3. Click Dashboard tab.',
      expectedResult: 'Axios response interceptor catches HTTP 401 and routes to /login.',
      actualResult: 'Unhandled exception crash on unauthenticated query call.',
      resolution: 'Added global Axios 401 interceptor with React Router navigation dispatch.',
      resolvedAt: new Date('2026-08-20'),
      closedAt: new Date('2026-08-22'),
    },
  });

  const issue6 = await prisma.issue.upsert({
    where: { issueKey: 'PAY-103' },
    update: {},
    create: {
      issueKey: 'PAY-103',
      title: 'Kafka Consumer Offset Lag Spikes During Midnight Batch Settling',
      description: 'Reopened issue: Batch settlement job consumes all DB connections causing lag to increase by 45,000 messages.',
      applicationId: payGateApp.id,
      projectId: payApiProject.id,
      moduleComponent: 'SettlementConsumer',
      reporterId: reporter.id,
      assigneeId: developer2.id,
      status: Status.REOPENED,
      priority: Priority.CRITICAL,
      severity: Severity.CRITICAL,
      environment: 'Production-US-East',
      stepsToReproduce: '1. Wait for 00:00 UTC settlement cron execution.\n2. Measure Kafka consumer group lag metric.',
      expectedResult: 'Offset lag remains under 1000 messages.',
      actualResult: 'Lag reaches 45k messages due to connection pool exhaustion.',
    },
  });

  console.log('✅ 6 Realistic Issues created spanning all canonical statuses (OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, VERIFIED, CLOSED, REOPENED).');

  // 5. Seed Comments
  await prisma.comment.createMany({
    data: [
      {
        issueId: issue1.id,
        authorId: developer1.id,
        content: 'Profiled event loop bottleneck using v8-profiler. Moving crypto verification to worker thread pool using webcrypto.',
        isInternal: false,
      },
      {
        issueId: issue1.id,
        authorId: pm.id,
        content: 'Internal note: Customer merchant ACME Corp requested update before Friday client sync.',
        isInternal: true,
      },
      {
        issueId: issue2.id,
        authorId: developer2.id,
        content: 'Verified fix on staging environment. Redis distributed lock prevents concurrent processing clean.',
        isInternal: false,
      },
    ],
  });

  console.log('✅ Issue Comments created.');

  // 6. Seed Attachment Metadata
  await prisma.attachment.createMany({
    data: [
      {
        issueId: issue1.id,
        uploadedById: reporter.id,
        filename: 'grafana_cpu_spike_paygate.png',
        originalName: 'Grafana CPU Spike 2026-08-31.png',
        mimeType: 'image/png',
        fileSize: 458920,
        filePath: 'uploads/grafana_cpu_spike_paygate.png',
      },
      {
        issueId: issue3.id,
        uploadedById: reporter.id,
        filename: 'ios_3ds_modal_cutoff.png',
        originalName: 'iOS 3DS Modal Cutoff.png',
        mimeType: 'image/png',
        fileSize: 312040,
        filePath: 'uploads/ios_3ds_modal_cutoff.png',
      },
    ],
  });

  console.log('✅ Attachment metadata created.');

  // 7. Seed Issue History Traceability Logs
  await prisma.issueHistory.createMany({
    data: [
      {
        issueId: issue1.id,
        changedById: reporter.id,
        actionType: HistoryAction.ISSUE_CREATED,
        fieldChanged: 'Issue',
        oldValue: null,
        newValue: 'Created issue PAY-101',
      },
      {
        issueId: issue1.id,
        changedById: pm.id,
        actionType: HistoryAction.ASSIGNED,
        fieldChanged: 'assigneeId',
        oldValue: null,
        newValue: developer1.id,
      },
      {
        issueId: issue1.id,
        changedById: developer1.id,
        actionType: HistoryAction.STATUS_CHANGED,
        fieldChanged: 'status',
        oldValue: Status.ASSIGNED,
        newValue: Status.IN_PROGRESS,
      },
      {
        issueId: issue6.id,
        changedById: reporter.id,
        actionType: HistoryAction.ISSUE_REOPENED,
        fieldChanged: 'status',
        oldValue: Status.RESOLVED,
        newValue: Status.REOPENED,
      },
    ],
  });

  console.log('✅ Issue History traceability logs created.');

  // 8. Seed User Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: developer1.id,
        issueId: issue1.id,
        title: 'New High Priority Issue Assigned',
        message: 'You have been assigned to PAY-101: Stripe Webhook Signature Verification Timeout',
        type: NotificationType.ISSUE_ASSIGNED,
        link: '/issues/PAY-101',
        isRead: false,
      },
      {
        userId: pm.id,
        issueId: issue2.id,
        title: 'Issue Resolved',
        message: 'Developer Marcus Chen marked PAY-102 as RESOLVED.',
        type: NotificationType.STATUS_CHANGED,
        link: '/issues/PAY-102',
        isRead: true,
      },
    ],
  });

  console.log('✅ User Notifications created.');

  console.log('🎉 Enterprise Database Seed Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Enterprise Database Seed Failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
