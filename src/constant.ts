/**
 * System-wide constants.
 *
 * May be read from package.json
 */

// @ts-ignore
import { djlintVersion } from '../package.json';
// @ts-ignore
import { djhtmlVersion } from '../package.json';

export const SUPPORT_LANGUAGES = ['htmldjango'];

export const DJHTML_VERSION = djhtmlVersion;
export const DJLINT_VERSION = djlintVersion;
