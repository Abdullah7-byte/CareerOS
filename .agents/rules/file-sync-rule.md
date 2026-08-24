# File Sync Rule

Never use `replace_file_content` or `multi_replace_file_content` on a file if it is currently listed as the `Active Document` or in `Other open documents` in the user's state, because writing directly to disk while the user has the file open in their editor buffer causes "The content of the file is newer" save conflicts.

Instead, when a target file is currently open in the editor:
1. Ask the user to close the file or ensure it is fully saved and not dirty before you make modifications.
2. Alternatively, present the code changes in your response or in a Markdown artifact so the user can copy/paste or apply them manually.
