const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const modules = [
  'Dashboard', 'User', 'Role', 'Permission', 'Menu', 'CMS', 'Gallery', 'Event',
  'Dog', 'Judge', 'Club', 'Sponsor', 'Partner', 'Testimonial', 'Payment',
  'Notification', 'Report', 'Setting', 'AuditLog'
];

const actions = ['view', 'create', 'update', 'delete', 'export', 'import', 'approve'];

async function seedAdminData() {
  console.log('Seeding Admin Data (Roles, Permissions, Menus)...');

  // 1. Clear existing data
  await prisma.menuPermission.deleteMany({});
  await prisma.menu.deleteMany({ where: { position: 'ADMIN_SIDEBAR' } });
  await prisma.rolePermission.deleteMany({});
  await prisma.permission.deleteMany({});
  
  // 2. Create Permissions
  console.log('Creating Permissions...');
  const permissionsData = [];
  for (const mod of modules) {
    for (const action of actions) {
      permissionsData.push({
        name: `${action}_${mod.toLowerCase()}`,
        description: `Can ${action} ${mod}`
      });
    }
  }
  
  // Add some specific ones
  permissionsData.push({ name: 'access_admin_panel', description: 'Can access Admin Portal' });
  permissionsData.push({ name: 'manage_system_settings', description: 'Can manage core system settings' });

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm
    });
  }
  const allPerms = await prisma.permission.findMany();

  // 3. Create/Ensure Roles
  console.log('Ensuring Roles...');
  const roleNames = ['Super Admin', 'Admin', 'Club Admin', 'Judge', 'Staff', 'Dog Owner', 'Viewer'];
  const roles = [];
  for (let i = 0; i < roleNames.length; i++) {
    const role = await prisma.role.upsert({
      where: { name: roleNames[i] },
      update: { priority: 100 - i },
      create: { name: roleNames[i], displayName: roleNames[i], priority: 100 - i }
    });
    roles.push(role);
  }

  const superAdminRole = roles.find(r => r.name === 'Super Admin');

  // Assign ALL permissions to Super Admin
  for (const perm of allPerms) {
    await prisma.rolePermission.create({
      data: { roleId: superAdminRole.id, permissionId: perm.id }
    });
  }

  // 4. Create Admin Menus
  console.log('Creating Admin Menus...');
  const adminMenus = [
    { name: 'Dashboard', url: '/admin', icon: 'LayoutDashboard', position: 'ADMIN_SIDEBAR', displayOrder: 1 },
    { name: 'Masters', url: '/admin/masters', icon: 'Database', position: 'ADMIN_SIDEBAR', displayOrder: 2 },
    { name: 'Users', url: '/admin/users', icon: 'Users', position: 'ADMIN_SIDEBAR', displayOrder: 3 },
    { name: 'RBAC', url: '/admin/rbac', icon: 'Shield', position: 'ADMIN_SIDEBAR', displayOrder: 4 },
    { name: 'Menu Management', url: '/admin/menus', icon: 'MenuIcon', position: 'ADMIN_SIDEBAR', displayOrder: 5 },
    { name: 'Events', url: '/admin/events', icon: 'Calendar', position: 'ADMIN_SIDEBAR', displayOrder: 6 },
    { name: 'Dogs', url: '/admin/dogs', icon: 'Dog', position: 'ADMIN_SIDEBAR', displayOrder: 7 },
    { name: 'Payments', url: '/admin/payments', icon: 'CreditCard', position: 'ADMIN_SIDEBAR', displayOrder: 8 },
    { name: 'Reports', url: '/admin/reports', icon: 'FileText', position: 'ADMIN_SIDEBAR', displayOrder: 9 },
    { name: 'Settings', url: '/admin/settings', icon: 'Settings', position: 'ADMIN_SIDEBAR', displayOrder: 10 },
    { name: 'Banners', url: '/admin/banners', icon: 'Image', position: 'ADMIN_SIDEBAR', displayOrder: 11 }
  ];

  const createdMenus = [];
  for (const m of adminMenus) {
    const menu = await prisma.menu.create({ data: m });
    createdMenus.push(menu);
    // Assign Super Admin to these menus
    await prisma.menuPermission.create({
      data: { menuId: menu.id, roleId: superAdminRole.id }
    });
  }

  // 5. Create Submenus for Masters
  const mastersMenu = createdMenus.find(m => m.name === 'Masters');
  const subMasters = [
    { name: 'Dog Groups', url: '/admin/masters/groups' },
    { name: 'Dog Breeds', url: '/admin/masters/breeds' },
    { name: 'Clubs', url: '/admin/masters/clubs' },
  ];
  for (let i = 0; i < subMasters.length; i++) {
    await prisma.menu.create({
      data: {
        name: subMasters[i].name,
        url: subMasters[i].url,
        parentId: mastersMenu.id,
        position: 'ADMIN_SIDEBAR',
        displayOrder: i + 1
      }
    });
  }

  console.log('Admin Data Seeded successfully!');
}

seedAdminData().catch(console.error).finally(() => prisma.$disconnect());
