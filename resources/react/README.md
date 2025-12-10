# React 19 Application

This folder contains your React 19 application integrated with Laravel 12.

## Structure

```
resources/react/
├── app.jsx              # React entry point
├── components/          # React components
│   ├── App.jsx         # Main App component
│   └── ExampleComponent.jsx  # Example component
└── README.md           # This file
```

## Usage

### In Blade Templates

To use React in your Blade templates, add a container element and include the React entry point:

```blade
<div id="react-app"></div>

@vite(['resources/react/app.jsx'])
```

### Creating Components

Create new components in the `components/` directory:

```jsx
// resources/react/components/MyComponent.jsx
export default function MyComponent() {
    return <div>Hello from React!</div>;
}
```

### Importing Components

Import and use components in your App component:

```jsx
import MyComponent from './components/MyComponent';

export default function App() {
    return (
        <div>
            <MyComponent />
        </div>
    );
}
```

## Development

- Run `npm run dev` to start the Vite development server
- Run `npm run build` to build for production
- The React app will hot-reload during development

## Notes

- React 19 is already installed and configured
- Tailwind CSS is available for styling
- Dark mode is supported via Tailwind's `dark:` prefix

