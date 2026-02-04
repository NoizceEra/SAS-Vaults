# 🔌 VS Code/Cursor Extensions for Solana Development

## ✅ Currently Installed

You already have these essential extensions:
- ✅ **Solana** (`ackeeblockchain.solana`)
- ✅ **Anchor** (`ayushh.vscode-anchor`)
- ✅ **VisualSolana** (`visualsolana.visualsolana`)

---

## 📦 Recommended Additional Extensions

### Essential for Rust/Anchor Development

```bash
# Rust Language Support
code --install-extension rust-lang.rust-analyzer

# Better TOML support (for Anchor.toml, Cargo.toml)
code --install-extension tamasfe.even-better-toml

# Error Lens (shows errors inline)
code --install-extension usernamehw.errorlens
```

### TypeScript/JavaScript (for SDK & Tests)

```bash
# TypeScript support
code --install-extension ms-vscode.vscode-typescript-next

# ESLint
code --install-extension dbaeumer.vscode-eslint

# Prettier (code formatter)
code --install-extension esbenp.prettier-vscode
```

### Git & Version Control

```bash
# GitLens (enhanced Git features)
code --install-extension eamodio.gitlens

# Git Graph (visualize Git history)
code --install-extension mhutchie.git-graph
```

### General Productivity

```bash
# Markdown Preview Enhanced
code --install-extension shd101wyy.markdown-preview-enhanced

# Path Intellisense (autocomplete file paths)
code --install-extension christian-kohler.path-intellisense

# Bracket Pair Colorizer (easier to read nested code)
code --install-extension coenraads.bracket-pair-colorizer-2
```

---

## 🚀 Quick Install Script

Copy and paste this entire block into your terminal to install all recommended extensions:

```powershell
# Rust & Anchor Development
code --install-extension rust-lang.rust-analyzer
code --install-extension tamasfe.even-better-toml
code --install-extension usernamehw.errorlens

# TypeScript/JavaScript
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode

# Git
code --install-extension eamodio.gitlens
code --install-extension mhutchie.git-graph

# Productivity
code --install-extension shd101wyy.markdown-preview-enhanced
code --install-extension christian-kohler.path-intellisense
code --install-extension coenraads.bracket-pair-colorizer-2
```

---

## 📋 Extension Details

### Rust Analyzer (`rust-lang.rust-analyzer`)
- **Why:** Essential for Rust development
- **Features:**
  - Code completion
  - Go to definition
  - Error checking
  - Refactoring tools
- **Required for:** Anchor program development

### Even Better TOML (`tamasfe.even-better-toml`)
- **Why:** Better syntax highlighting for `Anchor.toml` and `Cargo.toml`
- **Features:**
  - Syntax validation
  - Formatting
  - Schema validation

### Error Lens (`usernamehw.errorlens`)
- **Why:** Shows errors inline in your code
- **Features:**
  - Real-time error display
  - Warning highlighting
  - Saves time debugging

### TypeScript (`ms-vscode.vscode-typescript-next`)
- **Why:** Better TypeScript support for SDK and tests
- **Features:**
  - Enhanced IntelliSense
  - Better type checking
  - Improved refactoring

### ESLint (`dbaeumer.vscode-eslint`)
- **Why:** Code quality and consistency
- **Features:**
  - Linting for TypeScript/JavaScript
  - Auto-fix on save
  - Custom rules

### Prettier (`esbenp.prettier-vscode`)
- **Why:** Automatic code formatting
- **Features:**
  - Format on save
  - Consistent code style
  - Supports multiple languages

### GitLens (`eamodio.gitlens`)
- **Why:** Enhanced Git features
- **Features:**
  - Blame annotations
  - File history
  - Commit search
  - Code lens

### Markdown Preview Enhanced (`shd101wyy.markdown-preview-enhanced`)
- **Why:** Better markdown preview (for docs like USER_GUIDE.md)
- **Features:**
  - Live preview
  - Math support
  - Diagram support
  - Export to PDF/HTML

---

## 🔍 Check Installed Extensions

To see all installed extensions:
```bash
code --list-extensions
```

To check if a specific extension is installed:
```bash
code --list-extensions | Select-String "rust-analyzer"
```

---

## 🗑️ Uninstall Extensions

To remove an extension:
```bash
code --uninstall-extension <extension-id>
```

Example:
```bash
code --uninstall-extension rust-lang.rust-analyzer
```

---

## ⚙️ Extension Settings

### Recommended VS Code Settings for Solana Development

Create or update `.vscode/settings.json` in your project:

```json
{
  // Rust settings
  "rust-analyzer.checkOnSave.command": "clippy",
  "rust-analyzer.cargo.features": "all",
  
  // Format on save
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "rust-lang.rust-analyzer",
  
  // TypeScript settings
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  
  // Markdown settings
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.wordWrap": "on"
  },
  
  // File associations
  "files.associations": {
    "*.toml": "toml",
    "Anchor.toml": "toml"
  },
  
  // Exclude build artifacts from search
  "search.exclude": {
    "**/target": true,
    "**/node_modules": true,
    "**/.anchor": true
  },
  
  // File watcher exclusions
  "files.watcherExclude": {
    "**/target/**": true,
    "**/node_modules/**": true,
    "**/.anchor/**": true
  }
}
```

---

## 🎯 Extension-Specific Configuration

### Solana Extension Settings

The Solana extension (`ackeeblockchain.solana`) should auto-detect your:
- Solana CLI installation
- Wallet configuration
- Network settings (devnet/mainnet)

### Anchor Extension Settings

The Anchor extension (`ayushh.vscode-anchor`) provides:
- Anchor command palette
- Build shortcuts
- Test runners
- IDL generation

### VisualSolana Settings

VisualSolana (`visualsolana.visualsolana`) offers:
- Visual program explorer
- Account inspection
- Transaction debugging

---

## 📚 Extension Documentation

- **Rust Analyzer:** https://rust-analyzer.github.io/
- **Solana Extension:** Check extension marketplace
- **Anchor Extension:** Check extension marketplace
- **VisualSolana:** Check extension marketplace

---

## 🆘 Troubleshooting

### Extension Not Working

1. **Reload Window:**
   - Press `Ctrl+Shift+P`
   - Type "Reload Window"
   - Select "Developer: Reload Window"

2. **Check Extension Output:**
   - View → Output
   - Select extension from dropdown
   - Check for error messages

3. **Reinstall Extension:**
   ```bash
   code --uninstall-extension <extension-id>
   code --install-extension <extension-id>
   ```

### Rust Analyzer Issues

If Rust Analyzer isn't working:
1. Check Rust is installed: `rustc --version`
2. Check Cargo is installed: `cargo --version`
3. Restart Rust Analyzer: `Ctrl+Shift+P` → "rust-analyzer: Restart server"

### Solana Extension Not Detecting CLI

1. Verify Solana CLI is in PATH: `solana --version`
2. Check extension settings
3. Restart VS Code/Cursor

---

## ✅ Verification Checklist

After installing extensions, verify:

- [ ] Rust Analyzer shows code completion in `.rs` files
- [ ] Solana extension shows in command palette (`Ctrl+Shift+P` → "Solana")
- [ ] Anchor extension shows build commands
- [ ] Error Lens shows errors inline
- [ ] TOML files have syntax highlighting
- [ ] TypeScript files have IntelliSense

---

**Last Updated:** January 24, 2026
