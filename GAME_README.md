# 🎮 GTA-5 Style Interactive Portfolio

A fully playable 3D portfolio experience built with React, Three.js, and Next.js.

## 🚀 Features

### Game Mechanics
- **WASD Movement**: Navigate the 3D world
- **Mouse Look**: Rotate camera view
- **E to Interact**: Enter buildings and locations
- **ESC to Exit**: Close modals and return to game
- **Day/Night Cycle**: Toggle between day and night modes

### Locations
1. **🏠 House** - About Me section
2. **⚡ Tech Lab** - Skills & Technologies
3. **📋 Mission Board** - Projects showcase
4. **🏢 Office Tower** - Work Experience
5. **💻 Terminal** - Resume & CV
6. **📞 Phone Booth** - Contact Information

### UI Features
- Mini-map in top-right corner
- Controls guide in bottom-left
- Smooth modal transitions
- Blur effects on overlays
- Responsive design

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   └── map/
│       └── page.tsx          # Game entry point
├── components/
│   └── game/
│       ├── Game.tsx          # Main game component
│       ├── canvas/
│       │   ├── World.tsx     # 3D world setup
│       │   ├── Player.tsx    # Player controller
│       │   ├── Map.tsx       # Map layout
│       │   └── Building.tsx  # Interactive buildings
│       └── ui/
│           ├── UI.tsx        # UI manager
│           ├── MiniMap.tsx   # Mini-map component
│           ├── Controls.tsx  # Controls guide
│           ├── MissionModal.tsx    # Projects modal
│           ├── AboutModal.tsx      # About modal
│           └── SkillsModal.tsx     # Skills modal
└── data/
    ├── missions.json         # Projects data
    └── skills.json           # Skills data
```

## 🎨 Customization

### Adding New Locations
Edit `src/components/game/canvas/Map.tsx`:

```typescript
const locations = [
  { 
    id: 'new-location', 
    position: [x, y, z], 
    color: '#hexcolor', 
    label: 'Location Name', 
    icon: '🎯' 
  },
  // ... more locations
];
```

### Adding New Projects
Edit `src/data/missions.json`:

```json
{
  "title": "Project Name",
  "category": "Category",
  "status": "Active",
  "description": "Description here",
  "techStack": ["Tech1", "Tech2"],
  "github": "https://github.com/...",
  "demo": "https://demo.com"
}
```

### Adding New Skills
Edit `src/data/skills.json`:

```json
{
  "category": "Category Name",
  "items": [
    { "name": "Skill", "icon": "🔥", "level": 90 }
  ]
}
```

## 🎮 Controls

| Key | Action |
|-----|--------|
| W/↑ | Move Forward |
| S/↓ | Move Backward |
| A/← | Move Left |
| D/→ | Move Right |
| E | Enter Location |
| ESC | Close Modal |
| Mouse | Look Around |

## 🌟 Performance Tips

- Low-poly geometry for smooth performance
- Optimized textures
- Lazy loading for modals
- Efficient rendering with React Three Fiber

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import in Vercel
3. Deploy automatically

### Manual Build
```bash
npm run build
npm start
```

## 🎯 Future Enhancements

- [ ] Add NPCs with dialogue
- [ ] Ambient city sounds
- [ ] More interactive elements
- [ ] Multiplayer support
- [ ] Mobile touch controls
- [ ] VR support

## 📝 License

MIT License - Feel free to use for your own portfolio!

## 🤝 Contributing

Contributions welcome! Feel free to submit PRs.

---

Built with ❤️ using React, Three.js, and Next.js
