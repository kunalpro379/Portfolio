# Installation Instructions

## Required Dependencies

Run these commands to install all required packages:

```bash
npm install three @react-three/fiber @react-three/drei
npm install gsap
npm install framer-motion
```

## Package Versions
- three: ^0.160.0
- @react-three/fiber: ^8.15.0
- @react-three/drei: ^9.95.0
- gsap: ^3.12.0
- framer-motion: ^11.0.0

## Deployment to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Vercel will auto-detect Next.js
4. Deploy!

## Environment Variables (if needed)
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=your_api_url
```

## Build Command
```bash
npm run build
```

## Development
```bash
npm run dev
```

Navigate to:
- Home: http://localhost:3000
- Game Map: http://localhost:3000/map
