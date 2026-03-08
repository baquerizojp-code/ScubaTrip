

## Problema: Texto "ScubaTrip" poco legible en mobile sobre la imagen de fondo

Al estar el navbar transparente sobre el hero, el texto blanco compite con zonas claras de la imagen submarina.

### Opciones para solucionarlo:

1. **Añadir un gradiente superior sutil** — Un `bg-gradient-to-b from-black/40 to-transparent` en la parte superior del hero (primeros ~100px). Esto oscurece la zona detrás del navbar sin afectar el resto de la imagen. Es la solución más elegante y usada en apps con headers transparentes.

2. **Añadir text-shadow al logo** — Aplicar un `drop-shadow` o `text-shadow` al texto "ScubaTrip" y al icono para crear contraste sin oscurecer la imagen. Más sutil pero menos robusto.

3. **Combinar ambas** — Gradiente superior ligero + text-shadow como refuerzo.

### Recomendación: Opción 3 (ambas)

- En `Landing.tsx`: añadir un `div` con gradiente top (`from-[#0A1B2A]/50 via-[#0A1B2A]/20 to-transparent`) que cubra los primeros ~120px del hero
- En `Navbar.tsx`: añadir `drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]` al contenedor del logo+texto cuando el navbar está en modo transparente

### Archivos a modificar
- `src/pages/Landing.tsx` — añadir gradiente superior al hero
- `src/components/Navbar.tsx` — añadir drop-shadow al logo en modo transparente

