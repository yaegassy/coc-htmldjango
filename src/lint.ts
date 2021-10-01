import {
  Diagnostic,
  DiagnosticCollection,
  DiagnosticSeverity,
  languages,
  OutputChannel,
  Position,
  Range,
  TextDocument,
  Uri,
  workspace,
} from 'coc.nvim';

import cp from 'child_process';
import semver from 'semver';

import { getToolVersion } from './tool';

import { SUPPORT_LANGUAGES } from './constant';

interface DjlintDiagnostics {
  ruleName: string;
  line: number;
  col: number;
  message: string;
}

export class LintEngine {
  private collection: DiagnosticCollection;
  private toolPath: string;
  private toolVersion: string | undefined;
  private outputChannel: OutputChannel;

  constructor(toolPath: string, toolVersion: string | undefined, outputChannel: OutputChannel) {
    this.collection = languages.createDiagnosticCollection('djlint');
    this.toolPath = toolPath;
    this.toolVersion = toolVersion;
    this.outputChannel = outputChannel;
  }

  public async lint(textDocument: TextDocument): Promise<void> {
    if (!SUPPORT_LANGUAGES.includes(textDocument.languageId)) return;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const filePath = Uri.parse(textDocument.uri).fsPath;
    const args: string[] = [];
    const cwd = Uri.file(workspace.root).fsPath;
    const opts = { cwd, shell: true };

    const extensionConfig = workspace.getConfiguration('htmldjango');
    const ignoreRules = extensionConfig.get<string>('djlint.ignore', '');
    const profile = extensionConfig.get<string>('djlint.profile', 'django');

    if (ignoreRules) {
      args.push('--ignore', ignoreRules);
    }

    // MEMO: "--profile" option has been available since v0.4.5
    if (this.toolVersion && semver.gte(this.toolVersion, '0.4.5')) {
      args.push('--profile', profile);
    }

    args.push('-');

    this.outputChannel.appendLine(`${'#'.repeat(10)} djlint (lint)\n`);
    this.outputChannel.appendLine(`Ver: ${this.toolVersion}`);
    this.outputChannel.appendLine(`Cwd: ${opts.cwd}`);
    this.outputChannel.appendLine(`File: ${filePath}`);
    this.outputChannel.appendLine(`Args: ${args.join(' ')}`);
    this.outputChannel.appendLine(`Run: ${self.toolPath} ${args.join(' ')}`);

    this.collection.clear();

    return new Promise(function (resolve) {
      const cps = cp.spawn(self.toolPath, args, opts);
      cps.stdin.write(textDocument.getText());
      cps.stdin.end();
      let stderrOutput = '';

      let buffer = '';
      const onDataEvent = (data: Buffer) => {
        buffer += data.toString();
      };

      let djlintDiagnostics: DjlintDiagnostics[];
      const onEndEvent = () => {
        self.outputChannel.appendLine(`\n==== STDOUT ===\n`);
        self.outputChannel.appendLine(`${buffer}`);

        try {
          djlintDiagnostics = self.parseRegex(buffer);
        } catch (error) {
          self.outputChannel.appendLine(`\n==== Error ===\n`);
          self.outputChannel.appendLine(`Failed: parse failure`);
          return;
        }

        const diagnostics: Diagnostic[] = [];

        if (djlintDiagnostics && djlintDiagnostics.length > 0) {
          for (const d of djlintDiagnostics) {
            // MEMO: col is adjusted because it may return 0
            const startLine = d.line !== 0 ? d.line - 1 : d.line;
            const startCharacter = d.col !== 0 ? d.col - 1 : d.col;
            const endLine = startLine;
            const endCharacter = startCharacter;

            const startPosition = Position.create(startLine, startCharacter);
            const endPosition = Position.create(endLine, endCharacter);

            const severity = self.getSeverity(d.ruleName);

            diagnostics.push({
              range: Range.create(startPosition, endPosition),
              message: d.message,
              severity,
              source: 'djlint',
              code: d.ruleName,
              relatedInformation: [],
            });
          }

          self.collection.set(textDocument.uri, diagnostics);
        } else {
          // MEMO: Dealing with cases where the diagnosis is 0 but the signature remains.
          self.collection.set(textDocument.uri, null);
        }

        resolve();
      };

      cps.stderr.on('data', (error) => {
        stderrOutput = String(error);
      });
      cps.stdout.on('data', onDataEvent);
      cps.stdout.on('end', onEndEvent);

      cps.on('close', (code) => {
        if (code && code >= 2) {
          self.outputChannel.appendLine(`\n==== STDERR (CODE: ${String(code)}) ====\n`);
          self.outputChannel.appendLine(`${stderrOutput}`);
        }
      });

      resolve();
    });
  }

  public parseRegex(s: string): DjlintDiagnostics[] {
    const diagnostics: DjlintDiagnostics[] = [];
    const lines = s.split('\n');

    // MEMO: rule name has been changed since v0.4.5.
    const p = /^(?:(?<error>E\d+)|(?<warning>W\d+)|(?<template>T\d+)|(?<html>H\d+)|(?<django>D\d+)|(?<jinja>J\d+)|(?<nunjucks>N\d+)|(?<handlebars>M\d+))\s(?<line>\d+):(?<col>\d+)\s(?<message>.+)$/;

    for (const v of lines) {
      let ruleName: string | undefined;
      let line: number | undefined;
      let col: number | undefined;
      let message: string | undefined;

      const m = v.match(p);
      if (m) {
        // MEMO: rule name has been changed since v0.4.5.
        if (m.groups?.error) {
          ruleName = m.groups.error;
        } else if (m.groups?.warning) {
          ruleName = m.groups.warning;
        } else if (m.groups?.template) {
          ruleName = m.groups.template;
        } else if (m.groups?.html) {
          ruleName = m.groups.html;
        } else if (m.groups?.django) {
          ruleName = m.groups.django;
        } else if (m.groups?.jinja) {
          ruleName = m.groups.jinja;
        } else if (m.groups?.nunjucks) {
          ruleName = m.groups.nunjucks;
        } else if (m.groups?.handlebars) {
          ruleName = m.groups.handlebars;
        }

        line = m.groups?.line ? Number(m.groups.line) : undefined;
        col = m.groups?.col ? Number(m.groups.col) : undefined;
        message = m.groups?.message ? m.groups.message : undefined;
      }

      if (ruleName !== undefined && line !== undefined && col !== undefined && message !== undefined) {
        diagnostics.push({
          ruleName,
          line,
          col,
          message,
        });
      }
    }

    return diagnostics;
  }

  public getSeverity(s: string) {
    let severity: DiagnosticSeverity;
    let severityNumber: number | undefined;

    if (s.startsWith('W')) {
      severityNumber = DiagnosticSeverity.Warning;
    }
    if (s.startsWith('E')) {
      severityNumber = DiagnosticSeverity.Error;
    }
    // MEMO: rule name has been changed since v0.4.5.
    if (s.startsWith('T')) {
      severityNumber = DiagnosticSeverity.Warning;
    }
    if (s.startsWith('D')) {
      severityNumber = DiagnosticSeverity.Warning;
    }
    if (s.startsWith('J')) {
      severityNumber = DiagnosticSeverity.Warning;
    }
    if (s.startsWith('N')) {
      severityNumber = DiagnosticSeverity.Warning;
    }
    if (s.startsWith('H')) {
      severityNumber = DiagnosticSeverity.Warning;
    }

    switch (severityNumber) {
      case 1:
        severity = DiagnosticSeverity.Error;
        break;

      case 2:
        severity = DiagnosticSeverity.Warning;
        break;

      default:
        severity = DiagnosticSeverity.Warning;
        break;
    }

    return severity;
  }

  public async getVersion(cmdPath: string) {
    let toolVersion: string | undefined;
    const toolVersionStr = await getToolVersion(cmdPath);
    if (toolVersionStr) {
      const m = toolVersionStr.match(/(\d+.\d+.\d+)/);
      if (m) {
        toolVersion = m[0];
      }
    }
    return toolVersion;
  }
}
