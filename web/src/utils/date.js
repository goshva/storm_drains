const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
const WEEKDAYS = ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']

export function formatToday(date = new Date()) {
  const wd = WEEKDAYS[date.getDay()]
  const wdCap = wd.charAt(0).toUpperCase() + wd.slice(1)
  return `${wdCap}, ${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}
