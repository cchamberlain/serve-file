/**
 * Check if `path` looks absolute.
 *
 * @param {String} path
 * @return {Boolean}
 * @api private
 */

export const isAbsolute = path => {
  if ('/' == path[0]) return true
  if (':' == path[1] && '\\' == path[2]) return true
  if ('\\\\' == path.substring(0, 2)) return true // Microsoft Azure absolute path
}
