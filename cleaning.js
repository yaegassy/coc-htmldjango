const fs = require('fs');

const cleaningSnippets = (filename) => {
  fs.readFile(filename, 'utf8', (err, data) => {
    if (err) {
    }

    // Delete line -> "_comment" : "...",
    const filteredText = data
      .split('\n')
      .filter((w) => !w.match(/_comment/))
      .join('\n');

    fs.writeFile(filename, filteredText, () => {});
  });
};

cleaningSnippets('snippets/tags.json');
cleaningSnippets('snippets/filters.json');
