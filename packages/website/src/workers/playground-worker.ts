import * as rx4u from 'rx4u';

type RunMessage = {
  code: string;
  runId: number;
};

type ConsoleLevel = 'error' | 'info' | 'log' | 'warn';

function formatValue(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }

  if (value instanceof Error) {
    return value.stack || value.message;
  }

  try {
    const serialized = JSON.stringify(value);
    return serialized === undefined ? String(value) : serialized;
  } catch {
    return String(value);
  }
}

function createConsole(runId: number): Console {
  function send(level: ConsoleLevel, values: unknown[]): void {
    self.postMessage({
      level,
      runId,
      type: 'console',
      value: values.map(formatValue).join(' '),
    });
  }

  return {
    ...console,
    error: (...values: unknown[]) => send('error', values),
    info: (...values: unknown[]) => send('info', values),
    log: (...values: unknown[]) => send('log', values),
    warn: (...values: unknown[]) => send('warn', values),
  };
}

function transformImports(code: string): string {
  const transformedCode = code.replace(/import\s+\*\s+as\s+rx4u\s+from\s+['"]rx4u['"];?/g, '');
  const codeWithNamedImports = transformedCode.replace(/import\s+\{([^}]+)\}\s+from\s+['"]rx4u['"];?/g, (_match, imports: string) => {
    const bindings = imports
      .split(',')
      .map((item) => item.trim().replace(/\s+as\s+/, ': '))
      .join(', ');

    return `const {${bindings}} = rx4u;`;
  });

  if (/^\s*import\s/m.test(codeWithNamedImports)) {
    throw new Error('The playground only supports imports from "rx4u".');
  }

  return codeWithNamedImports;
}

self.addEventListener('message', (event: MessageEvent<RunMessage>) => {
  const {code, runId} = event.data;

  try {
    const execute = new Function('rx4u', 'console', `"use strict";\n${transformImports(code)}`);
    execute(rx4u, createConsole(runId));
    self.postMessage({runId, type: 'complete'});
  } catch (error) {
    self.postMessage({
      runId,
      type: 'error',
      value: formatValue(error),
    });
  }
});
