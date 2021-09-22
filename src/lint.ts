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

import { SUPPORT_LANGUAGES } from './constant';

interface DjlintDiagnostics {
  ruleName: string;
  line: number;
  col: number;
  message: string;
}

export class LintEngine {
  private collection: DiagnosticCollection;
  private cmdPath: string;
  private outputChannel: OutputChannel;

  constructor(cmdPath: string, outputChannel: OutputChannel) {
    this.collection = languages.createDiagnosticCollection('djlint');
    this.cmdPath = cmdPath;
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
    args.push('-');

    this.outputChannel.appendLine(`${'#'.repeat(10)} djlint (lint)\n`);
    this.outputChannel.appendLine(`Cwd: ${opts.cwd}`);
    this.outputChannel.appendLine(`File: ${filePath}`);
    this.outputChannel.appendLine(`Args: ${args.join(' ')}`);
    this.outputChannel.appendLine(`Run: ${self.cmdPath} ${args.join(' ')}`);

    this.collection.clear();

    return new Promise(function (resolve) {
      const cps = cp.spawn(self.cmdPath, args, opts);
      cps.stdin.write(textDocument.getText());
      cps.stdin.end();

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

      // If there is an stderr
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cps.stderr.on('data', (error) => {
        // MEMO: debug
        //self.outputChannel.appendLine(`\n==== STDERR ====\n`);
        //self.outputChannel.appendLine(`${stripAnsi(String(error))}`);
        //self.outputChannel.appendLine(`\n==== /STDERR ====\n`);
      });

      cps.stdout.on('data', onDataEvent);
      cps.stdout.on('end', onEndEvent);

      resolve();
    });
  }

  public parseRegex(s: string): DjlintDiagnostics[] {
    const diagnostics: DjlintDiagnostics[] = [];
    const lines = s.split('\n');

    const p = /^(?:(?<error>E\d+)|(?<warning>W\d+))\s(?<line>\d+):(?<col>\d+)\s(?<message>.+)$/;

    for (const v of lines) {
      let ruleName: string | undefined;
      let line: number | undefined;
      let col: number | undefined;
      let message: string | undefined;

      const m = v.match(p);
      if (m) {
        if (m.groups?.error) {
          ruleName = m.groups.error;
        } else if (m.groups?.warning) {
          ruleName = m.groups.warning;
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

    switch (severityNumber) {
      case 1:
        severity = DiagnosticSeverity.Error;
        break;

      case 2:
        severity = DiagnosticSeverity.Warning;
        break;

      default:
        severity = DiagnosticSeverity.Error;
        break;
    }

    return severity;
  }
}
