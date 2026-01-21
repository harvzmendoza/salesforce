# Salesforce (Laravel + React + Filament) — Local Development

This project is a Laravel 12 backend with a React (Vite) frontend and Filament admin.

## Prerequisites

- **PHP**: 8.3+
- **Composer**
- **Node.js**: 18+ (recommended) and **npm**
- **Database**: SQLite (default) or MySQL/Postgres (if you change `.env`)
- **Laravel Herd (recommended on macOS)**: the app will be available at `http://salesforce.test`

## Quick start (recommended)

From the project root:

```bash
git clone <your-repo-url>
cd salesforce

composer run setup
composer run dev
```

Then open:

- **App**: `http://salesforce.test` (or the URL shown by `php artisan serve`)

## What `composer run setup` does

This repo includes a `setup` script in `composer.json` that runs:

- **Install PHP deps**: `composer install`
- **Create env file**: copies `.env.example` → `.env` if missing
- **Generate app key**: `php artisan key:generate`
- **Run migrations**: `php artisan migrate --force`
- **Install JS deps**: `npm install`
- **Build assets**: `npm run build`

## Manual setup (if you prefer explicit commands)

```bash
git clone <your-repo-url>
cd salesforce

composer install

cp .env.example .env
php artisan key:generate

php artisan migrate

npm install
npm run build
```

## Running the app

### Option A: One command (recommended)

Runs the Laravel server, queue listener, logs, and Vite dev server together:

```bash
composer run dev
```

### Option B: Run pieces separately

In separate terminals:

```bash
php artisan serve
```

```bash
npm run dev
```

If you use queues in your environment:

```bash
php artisan queue:listen --tries=1
```

## Testing

```bash
composer run test
```

## Useful URLs

- **Filament admin**: `/admin`
- **Login app (React)**: `/login`

## Troubleshooting

### “Unable to locate file in Vite manifest”

- Make sure you ran `npm install` and then either:
  - `npm run build` (production assets), or
  - `npm run dev` (dev server), or
  - `composer run dev` (recommended)

### Database/migrations issues

- If you changed `.env` DB settings, re-run:

```bash
php artisan migrate:fresh
```

## PWA / Offline Support

See:

- `PWA_SETUP.md`
- `OFFLINE_SYNC.md`
