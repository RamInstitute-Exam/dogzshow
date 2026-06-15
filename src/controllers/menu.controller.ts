import { Request, Response } from 'express';
import prisma from '../prisma';

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Build a nested tree from a flat list of menus */
function buildTree(menus: any[]): any[] {
  const roots = menus.filter(m => !m.parentId);
  const childrenOf = (parentId: string): any[] =>
    menus
      .filter(m => m.parentId === parentId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(m => ({ ...m, children: childrenOf(m.id) }));

  return roots
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map(m => ({ ...m, children: childrenOf(m.id) }));
}

// ─── Controllers ───────────────────────────────────────────────────────────

/**
 * GET /menus
 * Filters by position, visibility, and optionally by role permissions.
 * Query params:
 *   - position  (default: NAVBAR)
 *   - role      (optional) user role name — e.g. "Guest", "User", "Admin"
 */
export const getMenus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { position = 'NAVBAR', role } = req.query;

    // Base filter: correct position and visible
    const where: any = {
      position: String(position),
      visibility: true,
    };

    // RBAC: filter by role visibility flags
    if (role === 'Guest' || !role) {
      where.onlyLoggedUser = false;
      where.onlyAdmin = false;
    } else if (role === 'Admin' || role === 'Super Admin') {
      // Admin can see everything — no extra filter
    }
    // "User", "Judge", "Organizer" etc. can see everything except onlyAdmin
    if (role && role !== 'Admin' && role !== 'Super Admin') {
      where.onlyGuest = false;
      where.onlyAdmin = false;
    }

    const menus = await prisma.menu.findMany({
      where,
      include: {
        permissions: {
          include: { role: true }
        }
      },
      orderBy: { displayOrder: 'asc' },
    });

    // If a role is specified and a menu has explicit permissions configured,
    // filter to only those menus whose permissions include the requested role.
    let filtered = menus;
    if (role) {
      filtered = menus.filter(m => {
        // No explicit permissions = visible to everyone (respecting the flag filters above)
        if (!m.permissions || m.permissions.length === 0) return true;
        // Has permissions = only show if role matches
        return m.permissions.some((p: any) => p.role?.name === role);
      });
    }

    const tree = buildTree(filtered);
    res.status(200).json({ success: true, data: tree });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /menus/all
 * Admin-only: returns ALL menus regardless of visibility/role, for management.
 */
export const getAllMenusForAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { position } = req.query;
    const where: any = {};
    if (position) where.position = String(position);

    const menus = await prisma.menu.findMany({
      where,
      include: {
        permissions: { include: { role: true } }
      },
      orderBy: [{ position: 'asc' }, { displayOrder: 'asc' }],
    });

    const tree = buildTree(menus);
    res.status(200).json({ success: true, data: tree });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, url, icon, position = 'NAVBAR', parentId, displayOrder = 0,
      visibility = true, openNewTab = false, badge, color,
      onlyLoggedUser = false, onlyGuest = false, onlyAdmin = false,
      roleIds = []
    } = req.body;

    const menu = await prisma.menu.create({
      data: {
        name, url, icon, position,
        parentId: parentId || null,
        displayOrder: Number(displayOrder),
        visibility, openNewTab, badge, color,
        onlyLoggedUser, onlyGuest, onlyAdmin,
      },
    });

    // Attach role permissions if provided
    if (roleIds.length > 0) {
      await prisma.menuPermission.createMany({
        data: roleIds.map((roleId: string) => ({ menuId: menu.id, roleId })),
        skipDuplicates: true,
      });
    }

    res.status(201).json({ success: true, message: 'Menu created', data: menu });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name, url, icon, position, parentId, displayOrder,
      visibility, openNewTab, badge, color,
      onlyLoggedUser, onlyGuest, onlyAdmin, roleIds
    } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (url !== undefined) updateData.url = url;
    if (icon !== undefined) updateData.icon = icon;
    if (position !== undefined) updateData.position = position;
    if (parentId !== undefined) updateData.parentId = parentId || null;
    if (displayOrder !== undefined) updateData.displayOrder = Number(displayOrder);
    if (visibility !== undefined) updateData.visibility = visibility;
    if (openNewTab !== undefined) updateData.openNewTab = openNewTab;
    if (badge !== undefined) updateData.badge = badge;
    if (color !== undefined) updateData.color = color;
    if (onlyLoggedUser !== undefined) updateData.onlyLoggedUser = onlyLoggedUser;
    if (onlyGuest !== undefined) updateData.onlyGuest = onlyGuest;
    if (onlyAdmin !== undefined) updateData.onlyAdmin = onlyAdmin;

    const menu = await prisma.menu.update({ where: { id: String(id) }, data: updateData });

    // Update permissions if provided
    if (roleIds !== undefined) {
      await prisma.menuPermission.deleteMany({ where: { menuId: String(id) } });
      if (roleIds.length > 0) {
        await prisma.menuPermission.createMany({
          data: roleIds.map((roleId: string) => ({ menuId: String(id), roleId })),
          skipDuplicates: true,
        });
      }
    }

    res.status(200).json({ success: true, message: 'Menu updated', data: menu });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteMenu = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Cascade: delete children first (permissions deleted via Cascade on schema)
    await prisma.menu.deleteMany({ where: { parentId: String(id) } });
    await prisma.menu.delete({ where: { id: String(id) } });
    res.status(200).json({ success: true, message: 'Menu deleted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const reorderMenus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { items } = req.body; // Array of { id, displayOrder, parentId? }
    await Promise.all(
      items.map((item: { id: string; displayOrder: number; parentId?: string }) =>
        prisma.menu.update({
          where: { id: String(item.id) },
          data: {
            displayOrder: Number(item.displayOrder),
            parentId: item.parentId ? String(item.parentId) : null,
          },
        })
      )
    );
    res.status(200).json({ success: true, message: 'Menus reordered' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
