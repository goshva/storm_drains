// Matches the .row__icon modifier classes in styles/main.css.
export function roleTileClass(role) {
  if (!role) return ''
  if (role.id === 'admin') return 'indigo'
  if (role.level === 0) return 'gold'
  return ''
}
