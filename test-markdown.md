# Markdown Viewer Test File

This is a test file to verify the **Markdown Viewer Extension** functionality.

## Features to Test

### 1. Basic Text Formatting

-   **Bold text**
-   _Italic text_
-   ~~Strikethrough text~~
-   `inline code`

### 2. Lists

#### Unordered List:

-   Item 1
-   Item 2
    -   Nested item 2.1
    -   Nested item 2.2
-   Item 3

#### Ordered List:

1. First item
2. Second item
    1. Nested numbered item
    2. Another nested item
3. Third item

### 3. Code Blocks

#### JavaScript Code:

```javascript
function greetUser(name) {
    console.log(`Hello, ${name}!`);
    return `Welcome to Markdown Viewer, ${name}`;
}

const user = "Developer";
console.log(greetUser(user));
```

#### Python Code:

```python
def calculate_fibonacci(n):
    if n <= 1:
        return n
    return calculate_fibonacci(n-1) + calculate_fibonacci(n-2)

# Test the function
for i in range(10):
    print(f"fib({i}) = {calculate_fibonacci(i)}")
```

#### HTML Code:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <title>Sample HTML</title>
    </head>
    <body>
        <h1>Hello World</h1>
        <p>This is a <strong>test</strong> paragraph.</p>
    </body>
</html>
```

### 4. Tables

| Feature             | Status | Notes                     |
| ------------------- | ------ | ------------------------- |
| Syntax Highlighting | ✅     | Working with highlight.js |
| Table Rendering     | ✅     | Styled with CSS           |
| Toggle Edit Mode    | ✅     | Available in toolbar      |
| Live Preview        | ✅     | Updates in real-time      |
| Dark Mode Support   | ✅     | Uses VSCode theme         |

### 5. Links and Images

-   [VSCode Marketplace](https://marketplace.visualstudio.com/)
-   [Markdown Guide](https://www.markdownguide.org/)

### 6. Blockquotes

> This is a blockquote example.
>
> It can span multiple lines and is useful for highlighting important information or quotes.

### 7. Horizontal Rule

---

## Testing Instructions

1. **Open this file** in VSCode with the Markdown Viewer extension
2. **Command Palette Test**: Press `Ctrl+Shift+P` → Search for "Markdown Viewer"
3. **Context Menu Test**: Right-click this file in Explorer → "Open with Markdown Viewer"
4. **Toggle Mode Test**: Click the "Toggle Edit Mode" button in the toolbar
5. **Syntax Highlighting Test**: Verify code blocks are properly highlighted
6. **Table Styling Test**: Check if tables have proper borders and styling
7. **Theme Integration Test**: Switch between light/dark themes in VSCode

## Expected Results

-   ✅ Markdown renders properly with syntax highlighting
-   ✅ Tables have borders and hover effects
-   ✅ Code blocks show language labels
-   ✅ Toggle between preview and edit modes works
-   ✅ Live preview updates while editing
-   ✅ Styling matches VSCode theme
