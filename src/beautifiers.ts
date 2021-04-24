import { Beautifier } from 'unibeautify';
import prettyDiff from '@unibeautify/beautifier-prettydiff';
import jsBeautify from '@unibeautify/beautifier-js-beautify';

export const beautifiers: Beautifier[] = [jsBeautify, prettyDiff];
