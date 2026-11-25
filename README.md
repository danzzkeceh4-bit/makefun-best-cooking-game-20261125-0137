# Dapur Kilat 🍳

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/danzzkeceh4-bit/makefun-best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/danzzkeceh4-bit/makefun-best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

**Dapur Kilat** is a fast-paced 2D cooking game set in a small Indonesian
warung. You are the cook: take orders from the board, chop chicken on the
board, fry everything in the wok before it burns, plate the dish, and serve
it through the window before the customer's patience runs out. One shift
lasts 180 seconds — and every 60 seconds a **rush** hits: orders come
faster, patience drains quicker, but tips pay 1.5×.

## How to play

| Key | Action |
| --- | --- |
| WASD / arrow keys | Move the cook |
| E / Space | Interact: take ingredient, chop, cook, plate, serve |
| Mouse click | Walk to a station and interact with it |
| M | Mute / unmute |
| P | Pause |
| R | Restart (on the end screen) |

## The cooking loop

1. **Take** a base and ingredients from the counter (nasi, mi, telur, ayam,
   sayur, cabai).
2. **Chop** the ayam on the talenan (stand close, it finishes by itself).
3. **Cook** raw ingredients in one of the two woks — take them out when
   matang, before they burn (gosong food goes in the trash).
4. **Plate** finished items on the meja plating. A plate that matches an
   order exactly is ready to go.
5. **Serve** the plate at the jendela saji. Serve fast for a big tip, serve
   in a row to build a combo (x2 from 3 in a row, x3 from 5).

## Recipes (6)

- **Nasi Goreng Kilat** — nasi + telur + sayur (wok)
- **Mie Goreng Pedas** — mi + cabai + ayam (chop + wok)
- **Nasi Ayam Geprek** — nasi + ayam (chop) + cabai
- **Mie Telur Sayur** — mi + telur + sayur (wok)
- **Nasi Sate Kilat** — nasi + ayam (chop) + sayur
- **Mie Goreng Spesial** — mi + telur + ayam + cabai (chop + wok)

## Run it locally

```bash
node serve.ts
# open http://localhost:8080
```

No build step, no libraries, no network requests — plain static files
plus a canvas. Sound is synthesized with WebAudio, so there are no audio
files either.

Deterministic screenshots: open `?shot=start&seed=1`,
`?shot=chop&seed=1`, `?shot=rush&seed=1` or `?shot=win&seed=1` to jump
straight into a staged scene. The four staged shots (title, mid-chop,
rush, end screen) live in `screenshots/` — the first file by name is the
cover.

## Hand in

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
