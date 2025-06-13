
import { useAppStore } from '@/stores'
const appStore = useAppStore()
export const isPermission = function (roleAction) {
  let roles = appStore.permissionUser
  if (!roles || (roles && !roles.length) || !roleAction) return false 
  let roleCheck = roleAction.split(',')
  let set = new Set(roles)
  let hasRoleChucNang = roleCheck.some(item => set.has(item))
  let admin = roles.includes('Admin') || roles.includes('SuperAdmin')
  return admin || hasRoleChucNang
}