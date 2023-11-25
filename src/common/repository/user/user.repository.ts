import * as bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import appConfig from '../../../config/app.config';
import { DateHelper } from '../../../common/helper/date.helper';

const prisma = new PrismaClient();

export class UserRepository {
  /**
   * get user details
   * @returns
   */
  static async getUserDetails(userId: number) {
    const user = await prisma.user.findFirst({
      where: {
        id: Number(userId),
      },
      include: {
        tenant: true,
        workspace_users: {
          include: {
            workspace: true,
          },
        },
        role_users: {
          include: {
            role: {
              include: {
                permission_roles: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });
    return user;
  }

  static async getUserByBillingID(billingID) {
    const user = await prisma.user.findFirst({
      where: {
        billing_id: billingID,
      },
      include: {
        tenant: true,
        subscriptions: {
          include: {
            plan: true,
          },
        },
      },
    });
    return user;
  }

  /**
   * get user tenant id
   * @returns
   */
  static async getTenantId(userId: number) {
    const userDetails = await this.getUserDetails(userId);
    const tenant_id = userDetails.tenant_id ?? userDetails.id;

    return tenant_id;
  }

  /**
   * check tenant ownership
   * @returns
   */
  static async checkTenant({ model, userId }) {
    const userDetails = await this.getUserDetails(userId);
    const tenant_id = userDetails.tenant_id ?? userDetails.id;

    const check = await model.findFirst({
      where: {
        tenant_id: tenant_id,
      },
    });
    if (check) {
      return userDetails;
    } else {
      return false;
    }
  }

  /**
   * Check existance
   * @returns
   */
  static async exist({ field, value }) {
    const model = await prisma.user.findFirst({
      where: {
        [field]: value,
      },
    });
    return model;
  }

  /**
   * Create su admin user
   * @param param0
   * @returns
   */
  static async createSuAdminUser({ username, email, password }) {
    try {
      password = await bcrypt.hash(password, appConfig().security.salt);

      const user = await prisma.user.create({
        data: {
          username: username,
          email: email,
          password: password,
        },
      });
      return user;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Invite user under tenant
   * @param param0
   * @returns
   */
  static async inviteUser({
    fname,
    lname,
    username,
    email,
    tenant_id,
    role_id,
  }) {
    try {
      const user = await prisma.user.create({
        data: {
          fname: fname,
          lname: lname,
          username: username,
          email: email,
          tenant_id: tenant_id,
        },
      });
      if (user) {
        // attach role
        const role = await this.attachRole({
          user_id: user.id,
          role_id: role_id,
        });
        return user;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Attach a role to a user
   * @param param0
   * @returns
   */
  static async attachRole({
    user_id,
    role_id,
  }: {
    user_id: number;
    role_id: number;
  }) {
    const role = await prisma.roleUser.create({
      data: {
        user_id: user_id,
        role_id: role_id,
      },
    });
    return role;
  }

  /**
   * update user role
   * @param param0
   * @returns
   */
  static async syncRole({
    user_id,
    role_id,
  }: {
    user_id: number;
    role_id: number;
  }) {
    const role = await prisma.roleUser.updateMany({
      where: {
        AND: [
          {
            user_id: user_id,
          },
        ],
      },
      data: {
        role_id: Number(role_id),
      },
    });
    return role;
  }

  /**
   * Create tenant admin user (main subscriber)
   * @param param0
   * @returns
   */
  static async createTenantAdminUser({
    fname,
    lname,
    username,
    email,
    password,
    role_id,
  }) {
    try {
      // begin transaction
      return await prisma.$transaction(async (tx) => {
        // create a organization with 14 days trial period
        const end_date = DateHelper.add(14, 'days').toISOString();
        const organization = await tx.organization.create({
          data: {
            name: 'organization_xyz',
            trial_end_at: end_date,
          },
        });

        if (organization) {
          // create user
          password = await bcrypt.hash(password, appConfig().security.salt);

          const user = await tx.user.create({
            data: {
              fname: fname,
              lname: lname,
              username: username,
              email: email,
              password: password,
              tenant_id: organization.id,
            },
          });
          if (user) {
            // attach admin
            await this.attachRole({
              user_id: user.id,
              role_id: role_id,
              // role_id: 2, // admin
            });
            // create a workspace
            const workspace = await this.createWorkspace({
              user_id: user.id,
              workspace_name: 'My New Workspace',
              organization_id: organization.id,
            });
            if (workspace) {
              return user;
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new workspace
   * @param param0
   * @returns
   */
  static async createWorkspace({
    user_id,
    organization_id,
    workspace_name = 'My New Workspace',
    timezone,
  }: {
    user_id: number;
    organization_id: number;
    workspace_name?: string;
    timezone?: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const data = {};
      if (timezone) {
        Object.assign(data, { timezone: timezone });
      }

      // create a workspace
      const workspace = await tx.workspace.create({
        data: {
          ...data,
          name: workspace_name,
          tenant_id: organization_id,
        },
      });
      if (workspace) {
        // add this user to the workspace as an admin
        await tx.workspaceUser.create({
          data: {
            workspace_id: workspace.id,
            user_id: user_id,
            tenant_id: organization_id,
          },
        });
        // create role
        const userAdminRole = await tx.role.create({
          data: {
            title: 'user admin',
            workspace_id: workspace.id,
            tenant_id: organization_id,
          },
        });
        const agentRole = await tx.role.create({
          data: {
            title: 'agent',
            workspace_id: workspace.id,
            tenant_id: organization_id,
          },
        });
        // attach user admin role to current user
        // await this.attachRole({
        //   user_id: user_id,
        //   role_id: userAdminRole.id, // admin
        // });
        await tx.roleUser.create({
          data: {
            user_id: user_id,
            role_id: userAdminRole.id, // admin
          },
        });
        //
        // create permissions for  workspace roles
        const all_permissions = await tx.permission.findMany();
        // admin
        const admin_permissions = all_permissions.filter(function (permission) {
          return (
            permission.title.substring(0, 21) == 'workspace_management_' ||
            permission.title.substring(0, 26) == 'workspace_user_management_' ||
            permission.title.substring(0, 34) ==
              'workspace_conversation_management_' ||
            permission.title.substring(0, 29) ==
              'workspace_channel_management_' ||
            permission.title.substring(0, 29) == 'workspace_contact_management_'
          );
        });

        const adminPermissionRoleArray = [];
        for (const user_permission of admin_permissions) {
          adminPermissionRoleArray.push({
            role_id: userAdminRole.id,
            permission_id: user_permission.id,
          });
        }
        await tx.permissionRole.createMany({
          data: adminPermissionRoleArray,
        });
        //
        // agent
        const agent_permissions = all_permissions.filter(function (permission) {
          return (
            permission.title == 'workspace_management_read' ||
            permission.title == 'workspace_management_show' ||
            permission.title == 'workspace_user_management_read' ||
            permission.title.substring(0, 34) ==
              'workspace_conversation_management_' ||
            permission.title == 'workspace_channel_management_delete' ||
            permission.title.substring(0, 29) == 'workspace_contact_management_'
          );
        });

        const agentPermissionRoleArray = [];
        for (const user_permission of agent_permissions) {
          agentPermissionRoleArray.push({
            role_id: agentRole.id,
            permission_id: user_permission.id,
          });
        }
        await tx.permissionRole.createMany({
          data: agentPermissionRoleArray,
        });
        //

        return workspace;
      } else {
        return false;
      }
    });
  }

  /**
   * create user under a tenant
   * @param param0
   * @returns
   */
  static async createUser({
    username,
    email,
    password,
    tenant_id,
    role_id = null,
  }) {
    try {
      password = await bcrypt.hash(password, appConfig().security.salt);
      const user = await prisma.user.create({
        data: {
          username: username,
          email: email,
          tenant_id: tenant_id,
          password: password,
        },
      });
      if (user) {
        if (role_id) {
          // attach role
          const role = await this.attachRole({
            user_id: user.id,
            role_id: role_id,
          });
        }

        return user;
      } else {
        return false;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get subscription details
   * @param userId
   * @returns
   */
  static async getSubscriptionDetails(userId: number) {
    const tenant_id = await this.getTenantId(userId);
    const subscription = await prisma.subscription.findFirst({
      where: {
        tenant_id: tenant_id,
      },
      include: {
        plan: true,
      },
    });
    return subscription;
  }
}
