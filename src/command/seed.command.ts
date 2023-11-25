// external imports
import { Command, CommandRunner } from 'nest-commander';
import { StringHelper } from '../common/helper/string.helper';
// internal imports
import { UserRepository } from '../common/repository/user/user.repository';
import { PrismaService } from '../providers/prisma/prisma.service';

@Command({ name: 'seed', description: 'prisma db seed' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly prisma: PrismaService) {
    super();
  }
  async run(passedParam: string[]): Promise<void> {
    await this.seed(passedParam);
  }

  async seed(param: string[]) {
    try {
      console.log(`Prisma Env: ${process.env.PRISMA_ENV}`);
      console.log('Seeding started...');

      // begin transaaction
      await this.prisma.$transaction(async ($tx) => {
        await this.roleSeed();
        await this.permissionSeed();
        await this.userSeed();
        await this.roleUserSeed();
        await this.permissionRoleSeed();
        // subscription and plan seed
        await this.planSeed();
      });

      console.log('Seeding done.');
    } catch (error) {
      throw error;
    }
  }

  //---- subscription plan section ----
  async planSeed() {
    // system admin, user id: 1
    await this.prisma.plan.createMany({
      data: [
        {
          name: 'Team',
          gateway_price_id: 'price_1MEvhxJ1sD6uaGBLDQ2DqVEK',
          price_per_month: 99,
        },
        {
          name: 'Business',
          gateway_price_id: 'price_1MEviEJ1sD6uaGBLIbqAWP2Z',
          price_per_month: 299,
        },
      ],
    });
  }
  //---- user section ----
  async userSeed() {
    // system admin, user id: 1
    await UserRepository.createSuAdminUser({
      username: 'admin',
      email: 'admin@example.com',
      password: '123',
    });

    // subscriber (tenant admin), user id: 2
    await UserRepository.createTenantAdminUser({
      fname: 'sojeb',
      lname: 'sikder',
      username: 'sojebsikder',
      email: 'sojebsikder@gmail.com',
      password: '123',
      role_id: 2,
    });
  }

  async roleUserSeed() {
    await this.prisma.roleUser.create({
      data: {
        user_id: 1,
        role_id: 1,
      },
    });
    // await this.prisma.roleUser.create({
    //   data: {
    //     user_id: 2,
    //     role_id: 2,
    //   },
    // });
  }

  async permissionSeed() {
    let i = 0;
    const permissions = [];
    const permissionGroups = [
      // (system level )super admin level permission
      { title: 'system_tenant_management', subject: 'SystemTenant' },
      // end (system level )super admin level permission
      { title: 'user_management', subject: 'User' },
      { title: 'role_management', subject: 'Role' },
      // Workspace
      { title: 'workspace_management', subject: 'Workspace' },
      { title: 'workspace_user_management', subject: 'WorkspaceUser' },
      { title: 'workspace_team_management', subject: 'WorkspaceTeam' },
      {
        title: 'workspace_conversation_management',
        subject: 'WorkspaceConversation',
      },
      { title: 'workspace_channel_management', subject: 'WorkspaceChannel' },
      { title: 'workspace_snippet_management', subject: 'WorkspaceSnippet' },
      { title: 'workspace_file_management', subject: 'WorkspaceFile' },
      { title: 'workspace_contact_management', subject: 'WorkspaceContact' },
      {
        title: 'workspace_broadcast_management',
        subject: 'WorkspaceBroadcast',
      },
      {
        title: 'workspace_workflow_management',
        subject: 'WorkspaceWorkflow',
      },
      {
        title: 'workspace_report_management',
        subject: 'WorkspaceReport',
        scope: ['read', 'show'],
      },
      {
        title: 'workspace_data_backup_management',
        subject: 'WorkspaceDataBackup',
        scope: ['read', 'create'],
      },
      // organization
      {
        title: 'organization_management',
        subject: 'Organization',
        scope: ['show', 'update'],
      },
      { title: 'organization_user_management', subject: 'OrganizationUser' },
      {
        title: 'organization_billing_management',
        subject: 'OrganizationBilling',
        scope: ['read', 'create'],
      },
    ];

    for (const permissionGroup of permissionGroups) {
      if (permissionGroup.scope) {
        for (const permission of permissionGroup.scope) {
          permissions.push({
            id: ++i,
            title: permissionGroup.title + '_' + permission,
            action: StringHelper.cfirst(permission),
            subject: permissionGroup.subject,
          });
        }
      } else {
        for (const permission of [
          'read',
          'create',
          'update',
          'show',
          'delete',
        ]) {
          permissions.push({
            id: ++i,
            title: permissionGroup.title + '_' + permission,
            action: StringHelper.cfirst(permission),
            subject: permissionGroup.subject,
          });
        }
      }
    }

    await this.prisma.permission.createMany({
      data: permissions,
    });
  }

  async permissionRoleSeed() {
    const all_permissions = await this.prisma.permission.findMany();
    const su_admin_permissions = all_permissions.filter(function (permission) {
      return permission.title.substring(0, 25) == 'system_tenant_management_';
    });

    // su admin permission
    const adminPermissionRoleArray = [];
    for (const su_admin_permission of su_admin_permissions) {
      adminPermissionRoleArray.push({
        role_id: 1,
        permission_id: su_admin_permission.id,
      });
    }
    await this.prisma.permissionRole.createMany({
      data: adminPermissionRoleArray,
    });
    // admin
    const tenant_admin_permissions = all_permissions.filter(
      function (permission) {
        return permission.title.substring(0, 25) != 'system_tenant_management_';
      },
    );

    const tenantAdminPermissionRoleArray = [];
    for (const admin_permission of tenant_admin_permissions) {
      tenantAdminPermissionRoleArray.push({
        role_id: 2,
        permission_id: admin_permission.id,
      });
    }
    await this.prisma.permissionRole.createMany({
      data: tenantAdminPermissionRoleArray,
    });
    // agent
    const agent_permissions = all_permissions.filter(function (permission) {
      return (
        permission.title.substring(0, 17) ==
        'workspace_conversation_management_'
      );
    });

    const tenantUserPermissionRoleArray = [];
    for (const user_permission of agent_permissions) {
      tenantUserPermissionRoleArray.push({
        role_id: 8,
        permission_id: user_permission.id,
      });
    }
    await this.prisma.permissionRole.createMany({
      data: tenantUserPermissionRoleArray,
    });
    //
    // //
    // const tenant_user_permissions = all_permissions.filter(function (
    //   permission,
    // ) {
    //   return (
    //     permission.title.substring(0, 17) == 'asset_management_' ||
    //     permission.title.substring(0, 17) == 'image_management_' ||
    //     permission.title.substring(0, 20) == 'document_management_' ||
    //     permission.title.substring(0, 16) == 'note_management_'
    //   );
    // });

    // const tenantUserPermissionRoleArray = [];
    // for (const user_permission of tenant_user_permissions) {
    //   tenantUserPermissionRoleArray.push({
    //     role_id: 3,
    //     permission_id: user_permission.id,
    //   });
    // }
    // await this.prisma.permissionRole.createMany({
    //   data: tenantUserPermissionRoleArray,
    // });
    // //
  }

  async roleSeed() {
    await this.prisma.role.createMany({
      data: [
        // system role
        {
          id: 1,
          title: 'Super Admin', // system admin, do not assign to a tenant/user
          name: 'su-admin',
        },
        // organization role
        {
          id: 2,
          title: 'Admin',
          name: 'admin',
        },
        {
          id: 3,
          title: 'Billing Admin',
          name: 'billing-admin',
        },
        {
          id: 4,
          title: 'User Admin',
          name: 'user-admin',
        },
        {
          id: 5,
          title: 'Member',
          name: 'member',
        },
        // workspace role
        {
          id: 6,
          title: 'Owner',
          name: 'owner',
        },
        {
          id: 7,
          title: 'Manager',
          name: 'manager',
        },
        {
          id: 8,
          title: 'Agent',
          name: 'agent',
        },
      ],
    });
  }
}
