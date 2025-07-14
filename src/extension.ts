import * as vscode from "vscode";

const SURROUNDING_LINE_RADIUS = 2;

export function activate(context: vscode.ExtensionContext) {
	const cmdDisposable = vscode.commands.registerCommand(
		"typst-implied-multiplication.fixSurrounding",
		() => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) return;

			const errors = findErrors(editor);
			const edit = new vscode.WorkspaceEdit();
			for (const error of errors) {
				const fix = generateFix(editor.document, error.range);
				edit.replace(editor.document.uri, fix.range, fix.newText);
			}
			vscode.workspace.applyEdit(edit);
			vscode.workspace.save(editor.document.uri);
		},
	);

	const onWillSaveDisposable = vscode.workspace.onWillSaveTextDocument(
		(event) => {
			const doc = event.document;
			if (doc.languageId !== "typst") return;

			const editor = vscode.window.activeTextEditor;
			if (!editor) return;

			const errors = findErrors(editor);
			const edits = errors.map((error) =>
				generateFix(editor.document, error.range),
			);
			event.waitUntil(Promise.resolve(edits));
		},
	);

	context.subscriptions.push(cmdDisposable);
	context.subscriptions.push(onWillSaveDisposable);
}

function findErrors(editor: vscode.TextEditor): vscode.Diagnostic[] {
	const line = editor.selection.active.line;
	const diagnostics = vscode.languages.getDiagnostics(editor.document.uri);
	const impliedMultiplicationErrors = diagnostics
		.filter(
			(diag) =>
				Math.abs(diag.range.start.line - line) <= SURROUNDING_LINE_RADIUS &&
				diag.severity === vscode.DiagnosticSeverity.Error,
		)
		.filter((err) => isImpliedMultiplicationError(err.message));

	return impliedMultiplicationErrors;
}

function isImpliedMultiplicationError(message: string) {
	return (
		message.includes("unknown variable") &&
		message.includes("try adding spaces between each letter")
	);
}

function generateFix(
	doc: vscode.TextDocument,
	range: vscode.Range,
): vscode.TextEdit {
	const originalText = doc.getText(range);
	const fixedText = [...originalText].join(" ");

	// If we're dealing with a subscript or superscript, additionally parenthesize the fixed text.
	if (range.start.character > 0) {
		const prevChar = doc.getText(
			new vscode.Range(range.start.translate(0, -1), range.start),
		);
		if (prevChar === "_" || prevChar === "^") {
			return new vscode.TextEdit(range, `(${fixedText})`);
		}
	}

	return new vscode.TextEdit(range, fixedText);
}
