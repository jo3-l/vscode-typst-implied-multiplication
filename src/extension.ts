import * as vscode from 'vscode';

const SURROUNDING_LINE_RADIUS = 2;
const COMMAND_ID = 'typst-implied-multiplication.fixSurrounding';

export function activate(context: vscode.ExtensionContext) {
	const cmdDisposable = vscode.commands.registerCommand(COMMAND_ID, () => {
		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const line = editor.selection.active.line;
		const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
		const impliedMultiplicationErrors = diagnostics
			.filter(
				(diag) =>
					Math.abs(diag.range.start.line - line) <= SURROUNDING_LINE_RADIUS &&
					diag.severity === vscode.DiagnosticSeverity.Error
			)
			.filter((err) => isImpliedMultiplicationError(err.message));

		if (impliedMultiplicationErrors.length === 0) return;

		const edit = new vscode.WorkspaceEdit();
		for (const error of impliedMultiplicationErrors) {
			const originalText = editor.document.getText(error.range);
			const fixedText = [...originalText].join(' ');
			edit.replace(editor.document.uri, error.range, fixedText);
		}
		vscode.workspace.applyEdit(edit);
	});

	const onSaveDisposable = vscode.workspace.onDidSaveTextDocument((doc) => {
		if (doc.languageId !== 'typst') return;
		vscode.commands.executeCommand(COMMAND_ID);
	});

	context.subscriptions.push(cmdDisposable);
	context.subscriptions.push(onSaveDisposable);
}

function isImpliedMultiplicationError(message: string) {
	return message.includes('unknown variable') && message.includes('try adding spaces between each letter');
}
