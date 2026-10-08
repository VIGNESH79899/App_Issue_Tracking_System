import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserRole } from '@app-issue-track/shared';

const mocks = vi.hoisted(() => ({
  canManageProject: vi.fn(),
  projectFindUnique: vi.fn(),
  userFindUnique: vi.fn(),
  membershipFindUnique: vi.fn(),
  membershipCount: vi.fn(),
  membershipCreate: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock('../config/database.js', () => ({
  prisma: {
    project: { findUnique: mocks.projectFindUnique },
    user: { findUnique: mocks.userFindUnique },
    projectMember: {
      findUnique: mocks.membershipFindUnique,
      count: mocks.membershipCount,
      create: mocks.membershipCreate,
    },
    $transaction: mocks.transaction,
  },
}));

vi.mock('../services/projectAccessService.js', () => ({
  projectAccessService: { canManageProject: mocks.canManageProject },
}));

import { projectService } from '../services/projectService.js';

describe('project membership limit', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.canManageProject.mockResolvedValue(true);
    mocks.projectFindUnique.mockResolvedValue({ id: 'project-3' });
    mocks.userFindUnique.mockResolvedValue({ id: 'user-1', isActive: true });
    mocks.membershipFindUnique.mockResolvedValue(null);
    mocks.transaction.mockImplementation(async (callback) =>
      callback({
        projectMember: {
          findUnique: mocks.membershipFindUnique,
          count: mocks.membershipCount,
          create: mocks.membershipCreate,
        },
      })
    );
  });

  it('rejects a third project assignment for the same user', async () => {
    mocks.membershipCount.mockResolvedValue(2);

    await expect(
      projectService.addProjectMember(
        { userId: 'admin-1', email: 'admin@example.com', role: UserRole.ADMIN },
        'project-3',
        'user-1'
      )
    ).rejects.toMatchObject({
      statusCode: 409,
      code: 'CONFLICT',
    });

    expect(mocks.membershipCreate).not.toHaveBeenCalled();
  });
});
